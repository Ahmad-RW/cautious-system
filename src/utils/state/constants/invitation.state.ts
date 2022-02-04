export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum InvitationTransitions {
  INVITATION_ACCEPTANCE = 'invitation-acceptance',
  INVITATION_EXPIRATION = 'invitation-expiration',
  INVITATION_CANCELLATION = 'invitation-cancellation',
}
