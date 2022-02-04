import { AuthService } from 'src/auth/services/auth.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { EmailDto } from 'src/auth/dto/email-check.dto';
import { GetUser } from 'src/common/decorators/user.decorator';
import {
  IQueryParams,
  QueryParamOptions,
} from 'src/common/decorators/query-param-options';
import { LoginResponseDto } from 'src/auth/dto/login-response.dto';
import { MessageDto } from 'src/common/dto/message.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { PermissionKeys } from 'src/auth/enums/permission.enum';
import { RoleAuthorizationPipe } from 'src/auth/pipes/role-authorization.pipe';
import { RoleId } from 'src/auth/enums/role.enum';
import { SkipAuth } from 'src/auth/decorators/skip-auth.decorator';
import { TranslationService } from 'src/utils/i18n/translation/translation.service';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { User } from 'src/users/entities/user.entity';
import { UsernameDto } from 'src/auth/dto/username-check.dto';
import { UsersService } from 'src/users/users.service';
import { WithPermissions } from 'src/auth/decorators/with-permissions.decorator';
import { WithRoles } from 'src/auth/decorators/with-roles.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
    private readonly translationService: TranslationService,
  ) {}

  //nest will bind request body to our class `CreateUserDto`
  //Built in validation pipe will trigger class-validator and will valdiate the values.
  @Post()
  @SkipAuth()
  async createUser(
    @Body() { email, username, password, country }: CreateUserDto,
  ): Promise<LoginResponseDto> {
    const user = await this.userService.createUser({
      email,
      username,
      password,
      country,
      type: RoleId.player,
    });
    const token = await this.authService.login(email, password);
    return {
      user,
      accessToken: token.accessToken,
    };
  }

  @Get()
  @WithPermissions(PermissionKeys.userViewAll)
  async getAllUsers(
    @QueryParamOptions() queryParams: IQueryParams,
    @GetUser() user: User,
  ): Promise<Pagination<User>> {
    return await this.userService.getAll(queryParams, user);
  }

  @Get('me')
  @WithPermissions(PermissionKeys.userViewOwn)
  getUserInfo(@GetUser() user: User): User {
    return user;
  }

  @Put('profile')
  @WithPermissions(PermissionKeys.userViewOwn)
  async update(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.userService.updateUser(user, updateUserDto);
  }

  @Put('profile/:username')
  @WithRoles(RoleId.admin)
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('username', RoleAuthorizationPipe) user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.userService.updateUser(user, updateUserDto);
  }

  @Post('username-exists')
  @HttpCode(HttpStatus.OK)
  @SkipAuth()
  async checkUserName(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() checkUsername: UsernameDto,
  ): Promise<MessageDto> {
    return {
      message: await this.translationService.t(
        'validation.usernameAvailability',
      ),
    };
  }

  @Post('email-exists')
  @HttpCode(HttpStatus.OK)
  @SkipAuth()
  async checkEmail(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() checkEMail: EmailDto,
  ): Promise<MessageDto> {
    return {
      message: await this.translationService.t('validation.emailAvailability'),
    };
  }

  @Delete('avatar')
  @WithPermissions(PermissionKeys.userUpdateOwn)
  async deleteAvatar(@GetUser() user: User): Promise<User> {
    return await this.userService.removeAvatar(user);
  }

  @Put('activate/:username')
  @WithPermissions(PermissionKeys.userStatus)
  async activateUser(
    @Param('username', RoleAuthorizationPipe) user: User,
  ): Promise<User> {
    return await this.userService.activateUser(user);
  }

  @Put('suspend/:username')
  @WithPermissions(PermissionKeys.userStatus)
  async suspendUser(
    @Param('username', RoleAuthorizationPipe) user: User,
  ): Promise<User> {
    return await this.userService.suspendUser(user);
  }
}
