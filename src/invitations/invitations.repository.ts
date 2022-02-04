import { DependentRoles } from 'src/auth/enums/role.enum';
import { EntityRepository, In, Not, Repository } from 'typeorm';
import { Invitation } from 'src/invitations/entities/invitations.entity';

@EntityRepository(Invitation)
export class InvitationRepository extends Repository<Invitation> {
  async saveInvitation(invitation: Invitation): Promise<Invitation> {
    await this.save(invitation);
    await invitation.reload();
    return invitation;
  }

  async findAll(user): Promise<Invitation[]> {
    return await this.find({
      where: {
        status: Not('cancelled'),
        role: In(DependentRoles[user.role.id]),
      },
    });
  }

  async findByToken(token: string): Promise<Invitation> {
    return await this.findOne({ where: { token: token } });
  }
}
