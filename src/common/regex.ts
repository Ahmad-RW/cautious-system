export const REGEX = {
  numbers: /\d/,
  lowercase: /[a-z]/,
  uppercase: /[A-Z]/,
  specialCharacter: /[-!$%^&*()_+|~=`{}[:;<>?,.@#\]]/,
  username: /^(?=.{6,35}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/,
};
