import {
  UserStatuses,
  UserTransitions,
} from 'src/utils/state/constants/user.state';

export const USER_STATE_GRAPH = 'user-state-graph';

export const UserStateGraph = {
  // Name of graph
  name: USER_STATE_GRAPH,
  // Initial state of graph
  initialState: UserStatuses.PENDING,
  // Available states in graph
  states: [UserStatuses.PENDING, UserStatuses.ACTIVE, UserStatuses.SUSPENDED],
  // Available transitions in graph
  transitions: [
    {
      // Name of transistion
      name: UserTransitions.ACCOUNT_ACTIVATION,
      // Source states
      from: [UserStatuses.PENDING, UserStatuses.SUSPENDED],
      // Target state of transition
      to: UserStatuses.ACTIVE,
    },
    {
      name: UserTransitions.ACCOUNT_SUSPENSION,
      from: [UserStatuses.ACTIVE, UserStatuses.PENDING],
      to: UserStatuses.SUSPENDED,
    },
  ],
};
