import * as moment from 'moment';
import { AcceptInvite } from 'src/invitations/dto/accept-invite.dto';
import { AuthService } from 'src/auth/services/auth.service';
import { CountriesService } from 'src/countries/countries.service';
import { DependentRoles } from 'src/auth/enums/role.enum';
import { EMAILS } from 'src/utils/queues/emails.enum';
import { IAdditionalSearchQueries } from 'src/utils/search/interfaces/extra-queries.interface';
import { INVITATION_STATE_GRAPH } from 'src/utils/state/graphs/invitation.state-graph';
import { IQueryParams } from 'src/common/decorators/query-param-options';
import { In, LessThanOrEqual, Not } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Invitation } from 'src/invitations/entities/invitations.entity';
import { InvitationRepository } from 'src/invitations/invitations.repository';
import {
  InvitationStatus,
  InvitationTransitions,
} from 'src/utils/state/constants/invitation.state';
import { Pagination } from 'nestjs-typeorm-paginate';
import { QueuesService } from 'src/utils/queues/queues.service';
import { Role } from 'src/auth/entities/role.entity';
import { SearchService } from 'src/utils/search/search.service';
import { StateService } from 'src/utils/state/state.service';
import { UnprocessableEntityException } from 'src/common/exceptions/unprocessable-entity.exception';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { nanoid } from 'nanoid';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly invitationRepo: InvitationRepository,
    private readonly countryService: CountriesService,
    private readonly stateService: StateService<Invitation>,
    private readonly queuesService: QueuesService,
    private readonly usersService: UsersService,
    private readonly searchService: SearchService<Invitation>,
    private readonly authService: AuthService,
  ) {}

  async getInvitations(
    user: User,
    queryParams: IQueryParams,
  ): Promise<Pagination<Invitation>> {
    const additionalQuery: IAdditionalSearchQueries = {
      extraFilters: {
        role: In(DependentRoles[user.role.id]),
        status: Not('cancelled'),
      },
    };
    return await this.searchService.applySearch(
      Invitation,
      queryParams,
      additionalQuery,
    );
  }

  async createInvitation(user: User, email: string, role: Role) {
    await this.authService.isAuthorizedOnRole(user, role);
    const invitation = new Invitation();
    invitation.email = email;
    invitation.token = nanoid(30);
    invitation.expiresAt = moment().add(3, 'days').toDate();
    invitation.role = role;

    const { token } = await this.invitationRepo.saveInvitation(invitation);
    this.queuesService.addToEmailsQueue(EMAILS.INVITATION_EMAIL, {
      email: email,
      username: email,
      token: token,
      role: invitation.role.name,
    });
  }

  async resendInvitation(user: User, invitation: Invitation) {
    await this.authService.isAuthorizedOnRole(user, invitation.role);
    if (invitation.status === InvitationStatus.CANCELLED) {
      throw new UnprocessableEntityException(
        'validation.invalidInvitationState',
      );
    }
    invitation.expiresAt = moment().toDate();

    await this.stateService.apply(
      invitation,
      InvitationTransitions.INVITATION_EXPIRATION,
      INVITATION_STATE_GRAPH,
    );

    await this.invitationRepo.saveInvitation(invitation);
    return this.createInvitation(user, invitation.email, invitation.role);
  }

  async cancelInvitation(user: User, invitation: Invitation) {
    await this.authService.isAuthorizedOnRole(user, invitation.role);

    invitation.expiresAt = moment().toDate();

    await this.stateService.apply(
      invitation,
      InvitationTransitions.INVITATION_CANCELLATION,
      INVITATION_STATE_GRAPH,
    );

    await this.invitationRepo.saveInvitation(invitation);
  }

  async acceptInvitation({ username, password, token }: AcceptInvite) {
    const invitation = await this.invitationRepo.findByToken(token);

    await this.usersService.createUser({
      email: invitation.email,
      username,
      password,
      country: await this.countryService.findOne(26),
      type: invitation.role.id,
      verify: true,
    });

    invitation.expiresAt = moment().toDate();

    await this.stateService.apply(
      invitation,
      InvitationTransitions.INVITATION_ACCEPTANCE,
      INVITATION_STATE_GRAPH,
    );

    await this.invitationRepo.saveInvitation(invitation);
  }

  async expireInvitations() {
    const invitations = await this.invitationRepo.find({
      where: { expiresAt: LessThanOrEqual(moment().toDate()) },
    });
    return Promise.all(
      invitations.map(async (invitation) => {
        invitation.expiresAt = moment().toDate();
        await this.stateService.apply(
          invitation,
          InvitationTransitions.INVITATION_EXPIRATION,
          INVITATION_STATE_GRAPH,
        );
        await this.invitationRepo.saveInvitation(invitation);
      }),
    );
  }
}
