import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { AdminProfileDto } from './dto/admin-profile.dto';
import { DoctorProfileDto } from './dto/doctor-profile.dto';
import { PatientProfileDto } from './dto/patient-profile.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../email/email.service';
import { StandardResponse } from 'src/common/dto/standard-response.dto';
import { ResponseService } from 'src/common/services/response.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private responseService: ResponseService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<StandardResponse<UserResponseDto>> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.isEmailVerified) {
        throw new UnauthorizedException(
          'Your email address is not verified. Please verify your email.',
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return this.responseService.success(
        'User validated successfully',
        result as UserResponseDto,
      );
    }
    throw new UnauthorizedException('Invalid email or password.');
  }

  async login(
    user: UserResponseDto,
  ): Promise<StandardResponse<LoginResponseDto>> {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const loginResponse = {
      access_token: this.jwtService.sign(payload),
    };
    return this.responseService.success('Login successful', loginResponse);
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<StandardResponse<UserResponseDto>> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const verificationToken = uuidv4();

    return this.prisma.$transaction(async (prisma) => {
      try {
        const user = await prisma.user.create({
          data: {
            email: registerDto.email,
            password: hashedPassword,
            role: registerDto.role,
            verificationToken,
          },
        });

        switch (registerDto.role) {
          case UserRole.PATIENT:
            await prisma.patient.create({
              data: {
                userId: user.id,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                dateOfBirth: new Date(registerDto.dateOfBirth),
                gender: registerDto.gender,
                contactNumber: registerDto.contactNumber,
                address: registerDto.address,
              },
            });
            break;
          case UserRole.DOCTOR:
            await prisma.doctor.create({
              data: {
                userId: user.id,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                dateOfBirth: new Date(registerDto.dateOfBirth),
                gender: registerDto.gender,
                contactNumber: registerDto.contactNumber,
                address: registerDto.address,
                specialty: registerDto.specialty,
                yearsOfExperience: registerDto.yearsOfExperience,
              },
            });
            break;
          case UserRole.ADMIN:
            break;
          default:
            throw new BadRequestException('Invalid user role specified.');
        }

        await this.emailService.sendVerificationEmail(
          user.email,
          verificationToken,
        );

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, verificationToken: vt, ...userResponse } = user;
        return this.responseService.success(
          'User registered successfully',
          userResponse as UserResponseDto,
        );
      } catch (error) {
        if (error.code === 'P2002' && error.meta.target.includes('email')) {
          throw new BadRequestException('Email already exists.');
        }
        throw new BadRequestException('User registration failed.');
      }
    });
  }

  async forgotPassword(email: string): Promise<StandardResponse<null>> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException(
        'User with this email address does not exist.',
      );
    }

    const resetToken = this.jwtService.sign(
      { userId: user.id },
      { expiresIn: '1h' },
    );
    await this.emailService.sendPasswordResetEmail(email, resetToken);
    return this.responseService.success(
      'Password reset email sent successfully',
    );
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<StandardResponse<null>> {
    try {
      const decoded = this.jwtService.verify(token);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const user = await this.prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword },
      });
      if (!user) {
        throw new UnauthorizedException('Invalid token or user.');
      }
      return this.responseService.success('Password reset successfully');
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }

  async verifyEmail(token: string): Promise<StandardResponse<null>> {
    const user = await this.prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid verification token.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, verificationToken: null },
    });
    return this.responseService.success('Email verified successfully');
  }

  async getProfile(
    userId: number,
  ): Promise<
    StandardResponse<PatientProfileDto | DoctorProfileDto | AdminProfileDto>
  > {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    switch (user.role) {
      case UserRole.PATIENT:
        const patientProfile: PatientProfileDto = {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.patient?.firstName,
          lastName: user.patient?.lastName,
          dateOfBirth: user.patient?.dateOfBirth,
          gender: user.patient?.gender,
          contactNumber: user.patient?.contactNumber,
          address: user.patient?.address,
        };
        return this.responseService.success(
          'Patient profile retrieved successfully',
          patientProfile,
        );
      case UserRole.DOCTOR:
        const doctorProfile: DoctorProfileDto = {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.doctor?.firstName,
          lastName: user.doctor?.lastName,
          dateOfBirth: user.doctor?.dateOfBirth,
          gender: user.doctor?.gender,
          contactNumber: user.doctor?.contactNumber,
          address: user.doctor?.address,
          specialty: user.doctor?.specialty,
          yearsOfExperience: user.doctor?.yearsOfExperience,
        };
        return this.responseService.success(
          'Doctor profile retrieved successfully',
          doctorProfile,
        );
      case UserRole.ADMIN:
        const adminProfile: AdminProfileDto = {
          id: user.id,
          email: user.email,
          role: user.role,
        };
        return this.responseService.success(
          'Admin profile retrieved successfully',
          adminProfile,
        );
      default:
        throw new NotFoundException('Invalid user role.');
    }
  }
}
