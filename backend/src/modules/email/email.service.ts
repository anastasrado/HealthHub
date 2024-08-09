import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const appUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    const verificationLink = `${appUrl}/auth/verify/${token}`;

    this.logger.log('Sending verification email');
    this.logger.log(`To: ${email}`);
    this.logger.log(`Verification Link: ${verificationLink}`);
    this.logger.log('Email content:');
    this.logger.log(`
      Subject: Verify your email for HealthHub
      
      Welcome to HealthHub!
      Please click the link below to verify your email address:
      ${verificationLink}
      
      If you didn't request this, you can safely ignore this email.
    `);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const appUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    const resetLink = `${appUrl}/auth/reset-password/${token}`;

    this.logger.log('Sending password reset email');
    this.logger.log(`To: ${email}`);
    this.logger.log(`Reset Link: ${resetLink}`);
    this.logger.log('Email content:');
    this.logger.log(`
      Subject: Reset your HealthHub password
      
      HealthHub Password Reset
      You requested a password reset. Click the link below to set a new password:
      ${resetLink}
      
      If you didn't request this, you can safely ignore this email.
    `);
  }
}
