import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/role.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserController {
  @Get('patient-data')
  @Roles('patient')
  @ApiOperation({ summary: 'Get patient data' })
  @ApiResponse({ status: 200, description: 'Return patient data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getPatientData() {
    return 'This is protected patient data';
  }

  @Get('doctor-data')
  @Roles('doctor')
  @ApiOperation({ summary: 'Get doctor data' })
  @ApiResponse({ status: 200, description: 'Return doctor data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getDoctorData() {
    return 'This is protected doctor data';
  }

  @Get('admin-data')
  @Roles('admin')
  @ApiOperation({ summary: 'Get admin data' })
  @ApiResponse({ status: 200, description: 'Return admin data' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getAdminData() {
    return 'This is protected admin data';
  }
}
