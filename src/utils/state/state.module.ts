import { Global, Module } from '@nestjs/common';
import { InvitationStateGraph } from 'src/utils/state/graphs/invitation.state-graph';
import { StateMachineModule } from '@depthlabs/nestjs-state-machine';
import { StateService } from 'src/utils/state/state.service';
import { UserStateGraph } from 'src/utils/state/graphs/user.state-graph';

@Global()
@Module({
  imports: [StateMachineModule.forRoot([UserStateGraph, InvitationStateGraph])],
  exports: [StateService],
  providers: [StateService],
})
export class StateModule {}
