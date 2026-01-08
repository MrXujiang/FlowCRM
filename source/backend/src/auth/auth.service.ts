import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JsonStorageService } from '../common/json-storage.service';
import { User } from '../common/interfaces';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly storageService: JsonStorageService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const users = this.storageService.read<User>('users');
    
    // 检查邮箱是否已存在
    const existingUser = users.find(u => u.email === registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('邮箱已被注册');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser: User = {
      id: uuidv4(),
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      role: registerDto.role,
      createdAt: new Date().toISOString(),
    };

    this.storageService.create('users', newUser);

    const token = this.jwtService.sign({ 
      sub: newUser.id, 
      email: newUser.email,
      role: newUser.role 
    });

    const { password, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, token };
  }

  async login(loginDto: LoginDto): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const users = this.storageService.read<User>('users');
    const user = users.find(u => u.email === loginDto.email);

    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const token = this.jwtService.sign({ 
      sub: user.id, 
      email: user.email,
      role: user.role 
    });

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async validateUser(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = this.storageService.findById<User>('users', userId);
    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
