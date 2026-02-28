import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash },
    });
    return this.sanitize(user);
  }

  async findById(userId: number, currentUser: User) {
    const user = await this.prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundException('User not found');

    if (currentUser.userId !== userId) {
      // Check if currentUser is owner/admin in any shared project
      const sharedProjects = await this.prisma.projectMember.findFirst({
        where: {
          userId: currentUser.userId,
          role: { in: ['owner', 'admin'] },
          project: {
            members: { some: { userId } },
          },
        },
      });
      if (!sharedProjects) {
        throw new ForbiddenException('Not authorized to view this user');
      }
    }

    return this.sanitize(user);
  }

  async getMyProjects(userId: number) {
    return this.prisma.project.findMany({
      where: { members: { some: { userId } } },
    });
  }

  async getUserProjects(targetUserId: number, currentUser: User) {
  // If viewing your own projects, just return all of them
  if (targetUserId === currentUser.userId) {
    return this.prisma.project.findMany({
      where: { members: { some: { userId: targetUserId } } },
    });
  }

  // If viewing someone else's projects, scope to projects where you're admin/owner
  const adminMemberships = await this.prisma.projectMember.findMany({
    where: {
      userId: currentUser.userId,
      role: { in: ['owner', 'admin'] },
    },
  });
  const allowedProjectIds = adminMemberships.map((m) => m.projectId);

  return this.prisma.project.findMany({
    where: {
      projectId: { in: allowedProjectIds },
      members: { some: { userId: targetUserId } },
    },
  });
}

  async getUserTasks(targetUserId: number, currentUser: User) {
  // If viewing your own tasks, return all of them
  if (targetUserId === currentUser.userId) {
    return this.prisma.task.findMany({
      where: { assigneeId: targetUserId },
    });
  }

  // If viewing someone else's tasks, scope to your admin/owner projects
  const adminMemberships = await this.prisma.projectMember.findMany({
    where: {
      userId: currentUser.userId,
      role: { in: ['owner', 'admin'] },
    },
  });
  const allowedProjectIds = adminMemberships.map((m) => m.projectId);

  return this.prisma.task.findMany({
    where: {
      assigneeId: targetUserId,
      projectId: { in: allowedProjectIds },
    },
  });
}

  sanitize(user: User) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
  async searchByEmail(email: string) {
  const user = await this.prisma.user.findUnique({ where: { email } });
  if (!user) throw new NotFoundException('No user found with that email');
  return this.sanitize(user);
}
}
