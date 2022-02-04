import * as moment from 'moment';
import { BadRequestException } from 'src/common/exceptions/bad-request.exception';
import { DependentRoles } from 'src/auth/enums/role.enum';
import { EMAILS } from 'src/utils/queues/emails.enum';
import { ForbiddenException } from 'src/common/exceptions/forbidden.exception';
import { ForgotPasswordDto } from 'src/auth/dto/forgot-password.dto';
import { ISetRedisRecord } from 'src/utils/redis/interfaces/set.interface';
import { Injectable } from '@nestjs/common';
import { JWT_EXPIRY } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from 'src/auth/dto/login-response.dto';
import { QueuesService } from 'src/utils/queues/queues.service';
import { RedisService } from 'src/utils/redis/redis.service';
import { Role } from 'src/auth/entities/role.entity';
import { UnauthorizedException } from 'src/common/exceptions/unauthorized.exception';
import { UpdatePasswordDto } from 'src/auth/dto/update-password.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Verification } from 'src/auth/entities/verification.entity';
import { VerificationsRepository } from 'src/auth/verifications.repository';
import { nanoid } from 'nanoid';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly verificationRepo: VerificationsRepository,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly queuesService: QueuesService,
  ) {}

  async login(username: string, password: string): Promise<LoginResponseDto> {
    const user = await this.validateUser(username, password);
    if (user) {
      delete user.role.permissions;
      //generating token payload
      const jwt = this.jwtService.sign({ user });
      await this.createSession(user, jwt);
      return {
        accessToken: jwt,
        user,
      };
    }
    throw new UnauthorizedException();
  }

  async logout(user: User): Promise<void> {
    await this.redisService.del(`session:${user.id}`);
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userService.getUserByEmailOrUsername(username);
    if (user && (await user.verifyPassword(password))) {
      return user;
    }
    throw new UnauthorizedException('error.exceptions.unauthorized');
  }

  async forgotPassword({ email }: ForgotPasswordDto) {
    const user = await this.userService.getUserByEmail(email);
    if (!user) return;

    const resetToken = await this.generateVerificationToken(
      user,
      EMAILS.RESET_PASSWORD,
      30,
    );
    this.queuesService.addToEmailsQueue(EMAILS.RESET_PASSWORD, {
      email: user.email,
      username: user.username,
      token: resetToken,
    });
  }

  async resetPassword(newPassword: string, token: string) {
    const verification = await this.verificationRepo.findVerificationByToken(
      token,
      EMAILS.RESET_PASSWORD,
    );
    const { user } = verification;
    user.password = newPassword;
    verification.expiresAt = moment().toDate();
    await verification.save();
    await user.save();
  }

  can(user: User, permission: string[]): boolean {
    if (!user.role || !user.role.permissions) {
      return false;
    }
    return !!user.role.permissions
      .concat(user.permissions)
      .find((permissionObject) =>
        permission.includes(permissionObject.nameKey),
      );
  }

  async cant(user: User, permission: string[]) {
    return !this.can(user, permission);
  }

  async generateVerificationToken(
    user: User,
    type: string,
    minutes: number,
  ): Promise<string> {
    if (type === EMAILS.EMAIL_VERIFICATION && user.emailVerifyAt) {
      throw new BadRequestException('error.accountAlreadyActivated');
    }
    const verification = new Verification();
    verification.user = user;
    verification.token = nanoid(20);
    verification.expiresAt = moment().add(minutes, 'minutes').toDate();
    verification.type = type;
    await verification.save();
    return verification.token;
  }

  async verifyEmail(verification: Verification) {
    verification.user.emailVerifyAt = moment().toDate();
    verification.expiresAt = moment().toDate();
    await verification.save();
    await verification.user.save();
  }

  async createSession(user: User, token: string): Promise<any> {
    const session: ISetRedisRecord = {
      key: `session:${user.id}`,
      value: token,
      ttl: JWT_EXPIRY,
    };
    this.redisService.set(session);
  }

  async sessionExists(userId: number, token: string): Promise<boolean> {
    const value = await this.redisService.get(`session:${userId}`);
    return value !== null && value === token;
  }

  async sendActivationEmail(user: User) {
    const verificationToken = await this.generateVerificationToken(
      user,
      EMAILS.EMAIL_VERIFICATION,
      1440,
    );
    this.queuesService.addToEmailsQueue(EMAILS.EMAIL_VERIFICATION, {
      email: user.email,
      username: user.username,
      token: verificationToken,
    });
  }

  async receiveVerificationEmail(token: string) {
    const verification = await this.verificationRepo.findVerificationByToken(
      token,
      EMAILS.EMAIL_VERIFICATION,
    );
    await this.verifyEmail(verification);
  }

  async setNewPassword(
    user: User,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const { newPassword } = updatePasswordDto;
    if (!(await user.verifyPassword(updatePasswordDto.oldPassword))) {
      throw new BadRequestException(
        'error.auth.currentPasswordNotCorrect',
        'oldPassword',
      );
    }
    user.password = newPassword;
    await user.save();
  }

  async isAuthorizedOnRole(currentUser: User, role: Role) {
    if (!DependentRoles[currentUser.role.id].includes(role.id)) {
      throw new ForbiddenException();
    }
  }
}
