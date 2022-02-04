import { BadRequestException } from 'src/common/exceptions/bad-request.exception';
import { Injectable } from '@nestjs/common';
import { RootEntity } from 'src/common/root.entity';
import { StateMachineFactory } from '@depthlabs/nestjs-state-machine';
import { TransitionInterface } from '@depthlabs/nestjs-state-machine/dist/interfaces/transition.interface';

@Injectable()
export class StateService<T extends RootEntity> {
  constructor(private readonly stateMachineFactory: StateMachineFactory) {}

  async apply(entity: T, transition: string, graphName: string): Promise<T> {
    try {
      const stateMachine = this.stateMachineFactory.create<T>(
        entity,
        graphName,
      );
      await stateMachine.apply(transition);
      await entity.save();
      return entity;
    } catch ({ fromState, transition }) {
      throw new BadRequestException('error.transition', '', {
        from: fromState,
        to: transition.to,
      });
    }
  }

  async canTransit(
    entity: T,
    transition: string,
    graphName: string,
  ): Promise<boolean> {
    const stateMachine = this.stateMachineFactory.create<T>(entity, graphName);
    return await stateMachine.can(transition);
  }

  getAvailableTransitions(entity: T, graphName: string): TransitionInterface[] {
    const stateMachine = this.stateMachineFactory.create<T>(entity, graphName);
    return stateMachine.getAvailableTransitions();
  }
}
