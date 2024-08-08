import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CreateUserDto, UserResponseDto } from './dto/create-user.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: UserResponseDto,
  })
  @ApiBody({ type: CreateUserDto })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.createUser(createUserDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user details.',
    type: UserResponseDto,
  })
  @ApiParam({ name: 'id', type: 'integer', description: 'User ID' })
  async getUser(@Param('id') id: number): Promise<UserResponseDto> {
    return this.userService.getUser(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Array of all users.',
    type: [UserResponseDto],
  })
  async getAllUsers(): Promise<UserResponseDto[]> {
    return this.userService.getAllUsers();
  }
}
