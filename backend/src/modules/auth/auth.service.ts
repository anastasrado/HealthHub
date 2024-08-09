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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.isEmailVerified) {
        throw new UnauthorizedException(
          'Please verify your email before logging in',
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result as UserResponseDto;
    }
    return null;
  }

  async login(user: UserResponseDto): Promise<LoginResponseDto> {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto): Promise<UserResponseDto> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const verificationToken = uuidv4();

    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          role: registerDto.role,
          verificationToken,
        },
      });

      // Create related profile based on role
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
          // No additional model creation for admin
          break;
        default:
          throw new BadRequestException('Invalid user role');
      }

      // Send verification email
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, verificationToken: __, ...userResponse } = user;
      return userResponse as UserResponseDto;
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, verificationToken: null },
    });
  }

  async getProfile(
    userId: number,
  ): Promise<PatientProfileDto | DoctorProfileDto | AdminProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }, // Corrected: Use id instead of undefined
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    switch (user.role) {
      case UserRole.PATIENT:
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.patient?.firstName,
          lastName: user.patient?.lastName,
          dateOfBirth: user.patient?.dateOfBirth,
          gender: user.patient?.gender,
          contactNumber: user.patient?.contactNumber,
          address: user.patient?.address,
        } as PatientProfileDto;
      case UserRole.DOCTOR:
        return {
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
        } as DoctorProfileDto;
      case UserRole.ADMIN:
        return {
          id: user.id,
          email: user.email,
          role: user.role,
        } as AdminProfileDto;
      default:
        throw new NotFoundException('Invalid user role');
    }
  }
}
