import { Injectable } from '@nestjs/common';
import { CreateUserDto, UserResponseDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password, // Ensure the password is handled securely (e.g., hashing)
      },
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async getUser(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
    }));
  }
}
