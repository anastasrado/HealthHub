import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'test@example.com' })
  email: string;

  @ApiProperty({ example: 'Test User' })
  name: string;

  @ApiProperty({
    example: 'securepassword',
    description: "The user's password",
  })
  password: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'test@example.com' })
  email: string;

  @ApiProperty({ example: 'Test User' })
  name: string;
}
