import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
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
  newPassword: string;
}
