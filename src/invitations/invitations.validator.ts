import { InvitationRepository } from 'src/invitations/invitations.repository';
import { InvitationStatus } from 'src/utils/state/constants/invitation.state';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { getConnectionManager } from 'typeorm';

@ValidatorConstraint({ name: 'validToken', async: true })
export class ValidToken implements ValidatorConstraintInterface {
  async validate(token: string): Promise<boolean> {
    if (token) {
      const invitation = await getConnectionManager()
        .get()
        .getCustomRepository(InvitationRepository)
        .findOne({
          where: { token: token },
        });
      return invitation?.status === InvitationStatus.PENDING;
    }
    return false;
  }

  defaultMessage(validationArguments: ValidationArguments): string {
    const [errorMessageKey] = validationArguments.constraints;
    return errorMessageKey;
  }
}

@ValidatorConstraint({ name: 'validInvitationEmail', async: true })
export class ValidInvitationEmail implements ValidatorConstraintInterface {
  async validate(email: string): Promise<boolean> {
    const oldInvitation = await getConnectionManager()
      .get()
      .getCustomRepository(InvitationRepository)
      .findOne({
        where: {
          email: email,
        },
        order: {
          createdAt: 'DESC',
        },
      });

    if (oldInvitation && oldInvitation.status !== InvitationStatus.CANCELLED) {
      return false;
    }

    return true;
  }

  defaultMessage(validationArguments: ValidationArguments): string {
    const [, errorMessageKey] = validationArguments.constraints;
    return errorMessageKey;
  }
}
