import { AuthService } from 'src/auth/services/auth.service';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
} from '@nestjs/common';
import { ForgotPasswordDto } from 'src/auth/dto/forgot-password.dto';
import { GetUser } from 'src/common/decorators/user.decorator';
import { ISuccessResponse } from 'src/common/interfaces/success-response.interface';
import { LoginDto } from 'src/auth/dto/login.dto';
import { LoginResponseDto } from 'src/auth/dto/login-response.dto';
import { ResetPasswordDto } from 'src/auth/dto/reset-password.dto';
import { SkipAuth } from 'src/auth/decorators/skip-auth.decorator';
import { Throttle } from '@nestjs/throttler';
import { TranslationService } from 'src/utils/i18n/translation/translation.service';
import { UpdatePasswordDto } from 'src/auth/dto/update-password.dto';
import { User } from 'src/users/entities/user.entity';
import { VerifyEmail } from 'src/auth/dto/verify-email.dto';
import { authThrottler } from 'src/common/constants/throttler.const';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly translationService: TranslationService,
  ) {}
  @Post()
  @HttpCode(HttpStatus.OK)
  @SkipAuth()
  @Throttle(authThrottler.limit, authThrottler.ttl)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const { username, password } = loginDto;
    return await this.authService.login(username, password);
    //TODO : create session log
  }

  @Throttle(1, 120)
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @SkipAuth()
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ISuccessResponse> {
    await this.authService.forgotPassword(forgotPasswordDto);
    return {
      message: await this.translationService.t('info.emailSent', {
        args: { email: forgotPasswordDto.email },
      }),
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @SkipAuth()
  async resetPassword(
    @Body() { password, token }: ResetPasswordDto,
  ): Promise<ISuccessResponse> {
    await this.authService.resetPassword(password, token);
    return {
      message: await this.translationService.t('info.passwordUpdated'),
    };
  }
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@GetUser() user: User): Promise<void> {
    await this.authService.logout(user);
    //TODO : mark respective session log as logged out
  }

  @Throttle(1, 120)
  @Post('send-verification-email')
  @HttpCode(HttpStatus.OK)
  async sendActivationEmail(@GetUser() user: User): Promise<ISuccessResponse> {
    await this.authService.sendActivationEmail(user);
    return {
      message: await this.translationService.t('info.emailSent', {
        args: { email: user.email },
      }),
    };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @SkipAuth()
  async receiveVerificationEmail(
    @Body() { token }: VerifyEmail,
  ): Promise<ISuccessResponse> {
    await this.authService.receiveVerificationEmail(token);

    return {
      message: await this.translationService.t('info.emailVerified'),
    };
  }

  @Put('password')
  async changePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @GetUser() user: User,
  ): Promise<void> {
    await this.authService.setNewPassword(user, updatePasswordDto);
  }
}
