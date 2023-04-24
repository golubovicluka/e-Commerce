import { Injectable } from '@nestjs/common';
import { User } from './models/user';

@Injectable()
export class UsersService {
  private users: User[] = [];

  /**
   * createUser
   */
  public createUser(): User {}

  /**
   * updateUser
   */
  public updateUser(): User {}

  /**
   * getUser
   */
  public getUser(): User {}

  /**
   * getUsers
   */
  public getUsers(): User[] {}

  /**
   * deleteUser
   */
  public deleteUser(): User {}
}
