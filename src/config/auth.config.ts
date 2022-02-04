import { JwtModuleOptions } from '@nestjs/jwt';
export const JWT_EXPIRY = 172800; //2 days in seconds

export default (): JwtModuleOptions => ({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: JWT_EXPIRY,
  },
});
