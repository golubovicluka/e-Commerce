import { Query, Resolver } from '@nestjs/graphql';

import { User } from './models/user';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService);

  // Use this with async/await an Promise
  @Query(() => User, { name: 'user', nullable: true })
  getUser(): User {
    // Fetch data from the database
    return this.usersService.getUser();
  }
}
