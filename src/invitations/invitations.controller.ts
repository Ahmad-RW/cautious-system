import { AcceptInvite } from 'src/invitations/dto/accept-invite.dto';
import { BindEntityPipe } from 'src/common/pipes/bind-entity.pipe';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { GetUser } from 'src/common/decorators/user.decorator';
import {
  IQueryParams,
  QueryParamOptions,
} from 'src/common/decorators/query-param-options';
import { ISuccessResponse } from 'src/common/interfaces/success-response.interface';
import { Invitation } from 'src/invitations/entities/invitations.entity';
import { InvitationsService } from 'src/invitations/invitations.service';
import { InviteDto } from 'src/invitations/dto/invite.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { PermissionKeys } from 'src/auth/enums/permission.enum';
import { SkipAuth } from 'src/auth/decorators/skip-auth.decorator';
import { TranslationService } from 'src/utils/i18n/translation/translation.service';
import { User } from 'src/users/entities/user.entity';
import { WithPermissions } from 'src/auth/decorators/with-permissions.decorator';

@Controller('invitations')
export class InvitationsController {
  constructor(
    private readonly invitationService: InvitationsService,
    private readonly translationService: TranslationService,
  ) {}

  @Get()
  @WithPermissions(PermissionKeys.userInvite)
  @HttpCode(HttpStatus.OK)
  async invitations(
    @GetUser() user: User,
    @QueryParamOptions() queryParams: IQueryParams,
  ): Promise<Pagination<Invitation>> {
    return await this.invitationService.getInvitations(user, queryParams);
  }

  @Post()
  @WithPermissions(PermissionKeys.userInvite)
  @HttpCode(HttpStatus.OK)
  async invite(
    @Body() { email, role }: InviteDto,
    @GetUser() user: User,
  ): Promise<ISuccessResponse> {
    await this.invitationService.createInvitation(user, email, role);
    return {
      message: await this.translationService.t('info.invitationSent'),
    };
  }

  @Post('resend/:id')
  @WithPermissions(PermissionKeys.userInvite)
  @HttpCode(HttpStatus.OK)
  async resendInvite(
    @Param('id', BindEntityPipe) invitation: Invitation,
    @GetUser() user: User,
  ): Promise<ISuccessResponse> {
    await this.invitationService.resendInvitation(user, invitation);

    return {
      message: await this.translationService.t('info.invitationSent'),
    };
  }

  @Put('cancel/:id')
  @WithPermissions(PermissionKeys.userInvite)
  @HttpCode(HttpStatus.OK)
  async cancelInvite(
    @Param('id', BindEntityPipe) invitation: Invitation,
    @GetUser() user: User,
  ): Promise<ISuccessResponse> {
    await this.invitationService.cancelInvitation(user, invitation);

    return {
      message: await this.translationService.t('info.invitationCancelled'),
    };
  }

  @Post('accept')
  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  async acceptInvite(
    @Body() acceptInvite: AcceptInvite,
  ): Promise<ISuccessResponse> {
    await this.invitationService.acceptInvitation(acceptInvite);
    return {
      message: await this.translationService.t('info.accountCreated'),
    };
  }
}
