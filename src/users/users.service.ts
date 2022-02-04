import * as moment from 'moment';
import { AuthService } from 'src/auth/services/auth.service';
import { BadRequestException } from 'src/common/exceptions/bad-request.exception';
import { DependentRoles } from 'src/auth/enums/role.enum';
import { EMAILS } from 'src/utils/queues/emails.enum';
import { IAdditionalSearchQueries } from 'src/utils/search/interfaces/extra-queries.interface';
import { IQueryParams } from 'src/common/decorators/query-param-options';
import { IUserData } from 'src/common/interfaces/user-data.interface';
import { In } from 'typeorm';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from 'nestjs-typeorm-paginate';
import { QueuesService } from 'src/utils/queues/queues.service';
import { RolesPermissionsService } from 'src/auth/services/roles-permissions.service';
import { SearchService } from 'src/utils/search/search.service';
import { StateService } from 'src/utils/state/state.service';
import { UNIQUE_CONSTRAINT_VIOLATION } from 'src/utils/state/constants/error.codes';
import { USER_STATE_GRAPH } from 'src/utils/state/graphs/user.state-graph';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UploadsService } from 'src/utils/uploads/uploads.service';
import { User } from 'src/users/entities/user.entity';
import { UserRepository } from 'src/users/users.repository';
import { UserTransitions } from 'src/utils/state/constants/user.state';
import { nanoid } from 'nanoid';

@Injectable()
export class UsersService {
  constructor(
    private readonly rolePermissionService: RolesPermissionsService,
    private readonly queuesService: QueuesService,
    @InjectRepository(UserRepository) private readonly userRepo: UserRepository,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly uploadService: UploadsService,
    private readonly searchService: SearchService<User>,
    private readonly stateService: StateService<User>,
  ) {}

  getUserByEmail(email: string): Promise<User> {
    return this.userRepo.getUserByEmail(email);
  }

  getUserByEmailOrUsername(username: string): Promise<User> {
    return this.userRepo.getUserByEmailOrUsername(username);
  }

  async createUser(userData: IUserData): Promise<User> {
    const user = new User();
    user.email = userData.email;
    user.username = userData.username;
    user.password = userData.password;
    user.country = userData.country;
    user.role = await this.rolePermissionService.getRoleById(userData.type);

    if (userData.verify) {
      user.emailVerifyAt = moment().toDate();
    }

    const created = await this.userRepo.saveUser(user);

    if (!userData.verify) {
      const verificationToken =
        await this.authService.generateVerificationToken(
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
    return created;
  }

  async getAll(
    queryParams: IQueryParams,
    user: User,
  ): Promise<Pagination<User>> {
    const additionalQuery: IAdditionalSearchQueries = {
      extraFilters: { role: In(DependentRoles[user.role.id]) },
    };
    return this.searchService.applySearch(User, queryParams, additionalQuery);
  }

  async updateUser(user: User, updateUserDto: UpdateUserDto): Promise<User> {
    for (const key in updateUserDto) {
      if (key === 'avatar' && updateUserDto.avatar !== null) {
        await this.uploadService.syncFile(updateUserDto[key]);
      }
      user[key] = updateUserDto[key];
    }

    try {
      const updated = await this.userRepo.saveUser(user);

      return updated;
    } catch (error) {
      if (error.code === UNIQUE_CONSTRAINT_VIOLATION) {
        throw new BadRequestException('error.emailOrUsernameExists');
      }

      throw error;
    }
  }

  async removeAvatar(user: User) {
    if (user.avatar) {
      await this.uploadService.deleteFile(user.avatar.split('/').pop());
      user.avatar = null;
      await this.userRepo.saveUser(user);
    }
    return user;
  }

  async activateUser(user: User) {
    await this.stateService.apply(
      user,
      UserTransitions.ACCOUNT_ACTIVATION,
      USER_STATE_GRAPH,
    );
    this.queuesService.addToEmailsQueue(EMAILS.ACCOUNT_ACTIVATION, {
      email: user.email,
      username: user.username,
    });
    return await this.userRepo.saveUser(user);
  }

  async suspendUser(user: User) {
    await this.stateService.apply(
      user,
      UserTransitions.ACCOUNT_SUSPENSION,
      USER_STATE_GRAPH,
    );
    this.queuesService.addToEmailsQueue(EMAILS.ACCOUNT_SUSPENSION, {
      email: user.email,
      username: user.username,
    });
    return await this.userRepo.saveUser(user);
  }
  async softDeleteUsersOverGracePeriod(): Promise<void> {
    const users = await this.userRepo.getUsersOverGracePeriod();
    for (const user of users) {
      //Scramble user email and username to be reused by new users
      user.email = nanoid(12);
      user.username = nanoid(12);
      user.deletedAt = new Date();
    }
    //One upsert query
    await this.userRepo.saveMany(users);
  }
}
