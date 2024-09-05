import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Param,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ProfileDto } from './dto/profile.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { StandardResponse } from 'src/common/dto/standard-response.dto';
import { ResponseService } from 'src/common/services/response.service';
import { AdminProfileDto } from './dto/admin-profile.dto';
import { DoctorProfileDto } from './dto/doctor-profile.dto';
import { PatientProfileDto } from './dto/patient-profile.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private responseService: ResponseService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Return JWT access token',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<StandardResponse<LoginResponseDto>> {
    // First validate the user
    const validatedUser = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    // If the user is valid, log them in to generate the JWT token
    return this.authService.login(validatedUser.data);
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<StandardResponse<UserResponseDto>> {
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiBadRequestResponse({ description: 'Invalid email address' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<StandardResponse<null>> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Get('verify/:token')
  @ApiOperation({ summary: 'Verify email' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiBadRequestResponse({ description: 'Invalid verification token' })
  async verifyEmail(
    @Param('token') token: string,
  ): Promise<StandardResponse<null>> {
    return this.authService.verifyEmail(token);
  }

  @Patch('reset-password/:token')
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiBadRequestResponse({ description: 'Invalid token or input' })
  @ApiBody({ type: ResetPasswordDto, description: 'New password details' })
  async resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<StandardResponse<null>> {
    return this.authService.resetPassword(token, resetPasswordDto.newPassword);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'Return user profile',
    type: ProfileDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getProfile(
    @Req() req: Request,
  ): Promise<
    StandardResponse<PatientProfileDto | DoctorProfileDto | AdminProfileDto>
  > {
    const user = req.user as { userId: number; email: string; role: string };
    const profileResponse = await this.authService.getProfile(user.userId);
    return this.responseService.success(
      'Profile retrieved successfully',
      profileResponse.data,
    );
  }
}
