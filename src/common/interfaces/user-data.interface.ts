import { Country } from 'src/countries/entities/country.entity';

export interface IUserData {
  email: string;
  username: string;
  password: string;
  country: Country;
  type: number;
  verify?: boolean;
}
