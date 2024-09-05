import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';
import { Gender } from '@prisma/client';

export class DoctorProfileDto extends UserDto {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  dateOfBirth: Date;

  @ApiProperty({ enum: Gender })
  gender: Gender;

  @ApiProperty({ required: false })
  contactNumber?: string;

  @ApiProperty({ required: false })
  address?: string;

  @ApiProperty()
  specialty: string;

  @ApiProperty()
  yearsOfExperience: number;
}
