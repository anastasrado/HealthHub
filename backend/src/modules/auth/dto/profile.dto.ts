import { ApiProperty } from '@nestjs/swagger';
import { PatientProfileDto } from './patient-profile.dto';
import { DoctorProfileDto } from './doctor-profile.dto';
import { AdminProfileDto } from './admin-profile.dto';

export class ProfileDto {
  @ApiProperty({
    description: 'User profile',
  })
  profile: PatientProfileDto | DoctorProfileDto | AdminProfileDto;
}
