  import { Controller, Post, Body, Req, Res, Get, Session } from '@nestjs/common';
  import type { Request, Response } from 'express';
  import { AuthService } from './auth.service';
  import { RegisterDto } from './dto/register.dto';
  import { LoginDto } from './dto/login.dto';

  @Controller('auth')
  export class AuthController {
    constructor(
      private readonly authService: AuthService,
    ) {}

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
      return this.authService.register(registerDto);
    }

    @Post('login')
    async login(
      @Body() dto: LoginDto,
      @Req() req: Request,
      @Res({ passthrough: true }) res: Response,
    ) {
      const result = await this.authService.login(dto);

      res.cookie('access_token', result.access_token, {
        httpOnly: true,         
        maxAge: 24 * 60 * 60 * 1000, 
        sameSite: 'lax',
      });
      (req.session as any).user = {
        username: dto.username,
        loginAt: new Date().toISOString(),
      };
      (req.session as any).isLoggedIn = true;

      return result;
    }

    @Get('set-cookie')
    setCookieDemo(@Res({ passthrough: true }) res: Response) {
      res.cookie('access_token', 'demo-jwt-token-123456', {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: 'lax',
      });
      return { message: 'Cookie access_token đã được set thành công!' };
    }

    @Get('set-session')
    setSessionDemo(@Req() req: Request) {
      const session = req.session as any;
      session.user = {
        username: 'demo_user',
        loginAt: new Date().toISOString(),
      };
      session.isLoggedIn = true;
      return { message: 'Session data đã được set thành công!' };
    }

    @Get('cookie')
    getCookie(@Req() req: Request) {
      const token = req.cookies['access_token'];
      return {
        message: token ? 'Cookie found' : 'No cookie set',
        access_token: token || null,
      };
    }

    @Get('session')
    getSession(@Req() req: Request) {
      const session = req.session as any;
      return {
        message: session?.isLoggedIn ? 'Session active' : 'No session',
        user: session?.user || null,
        isLoggedIn: session?.isLoggedIn || false,
        sessionId: req.sessionID,
      };
    }

    @Post('logout')
    logout(
      @Req() req: Request,
      @Res({ passthrough: true }) res: Response,
    ) {
      res.clearCookie('access_token');

      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
      });

      return { message: 'Đăng xuất thành công. Cookie đã xóa, Session đã hủy.' };
    }
  }