import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '@prisma/client';

@ApiTags('Users')
@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  // POST /signup
  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  signup(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // GET /users/me
  @Get('users/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@GetUser() user: User) {
    return this.usersService.sanitize(user);
  }

  // GET /users/search?email=  ← MUST be before /users/:userId
  @Get('users/search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find a user by email' })
  search(@Query('email') email: string) {
    return this.usersService.searchByEmail(email);
  }

  // GET /users/:userId
  @Get('users/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID (self or admin/owner of shared project)' })
  getUser(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUser() currentUser: User,
  ) {
    return this.usersService.findById(userId, currentUser);
  }

  // GET /users/:userId/projects
  @Get('users/:userId/projects')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List a user's projects (admin/owner-scoped)" })
  getUserProjects(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUser() currentUser: User,
  ) {
    return this.usersService.getUserProjects(userId, currentUser);
  }

  // GET /users/:userId/tasks
  @Get('users/:userId/tasks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List a user's tasks (admin/owner-scoped)" })
  getUserTasks(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUser() currentUser: User,
  ) {
    return this.usersService.getUserTasks(userId, currentUser);
  }
}