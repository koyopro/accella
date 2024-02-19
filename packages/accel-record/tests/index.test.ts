import { User } from './models/user';

it('should create a user', () => {
  User.create({ name: 'test' });
});
