import {
  InvitationStatus,
  InvitationTransitions,
} from 'src/utils/state/constants/invitation.state';

export const INVITATION_STATE_GRAPH = 'invitation-state-graph';

export const InvitationStateGraph = {
  name: INVITATION_STATE_GRAPH,
  initialState: InvitationStatus.PENDING,
  states: [
    InvitationStatus.PENDING,
    InvitationStatus.ACCEPTED,
    InvitationStatus.EXPIRED,
    InvitationStatus.CANCELLED,
  ],
  transitions: [
    {
      name: InvitationTransitions.INVITATION_ACCEPTANCE,
      from: [InvitationStatus.PENDING],
      to: InvitationStatus.ACCEPTED,
    },
    {
      name: InvitationTransitions.INVITATION_EXPIRATION,
      from: [InvitationStatus.PENDING],
      to: InvitationStatus.EXPIRED,
    },
    {
      name: InvitationTransitions.INVITATION_CANCELLATION,
      from: [InvitationStatus.PENDING],
      to: InvitationStatus.CANCELLED,
    },
  ],
};
