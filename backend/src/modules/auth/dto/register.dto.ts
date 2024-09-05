import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsDateString,
  IsOptional,
  Matches,
  ValidateIf,
  IsNumber,
} from 'class-validator';
import { UserRole, Gender } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password@123' })
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/,
    {
      message:
        'Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
    },
  )
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.PATIENT })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: 'John' })
  @ValidateIf((o) => o.role !== UserRole.ADMIN)
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @ValidateIf((o) => o.role !== UserRole.ADMIN)
  @IsString()
  lastName: string;

  @ApiProperty({ example: '1990-01-01' })
  @ValidateIf((o) => o.role !== UserRole.ADMIN)
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @ValidateIf((o) => o.role !== UserRole.ADMIN)
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  contactNumber?: string;

  @ApiProperty({ example: '123 Main St, City, Country', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Cardiology', required: false })
  @ValidateIf((o) => o.role === UserRole.DOCTOR)
  @IsString()
  specialty?: string;

  @ApiProperty({ example: 10, required: false })
  @ValidateIf((o) => o.role === UserRole.DOCTOR)
  @IsNumber()
  yearsOfExperience?: number;
}
