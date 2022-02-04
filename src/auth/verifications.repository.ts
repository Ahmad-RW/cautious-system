import { EntityRepository, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Verification } from 'src/auth/entities/verification.entity';

@EntityRepository(Verification)
export class VerificationsRepository extends Repository<Verification> {
  findVerificationByUser(user: User, type: string): Promise<Verification> {
    return this.findOne({
      where: { user: user, type: type },
      order: { createdAt: 'DESC' },
    });
  }

  findVerificationByToken(
    token: string,
    type: string,
  ): Promise<Verification | undefined> {
    return this.findOne({
      where: { token: token, type: type },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }
}
