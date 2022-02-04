export const common = ['createdAt'];

export const entitiesFilterFields = {
  User: [...common, 'status', 'role'],
  Invitation: [...common, 'status', 'role'],
};
