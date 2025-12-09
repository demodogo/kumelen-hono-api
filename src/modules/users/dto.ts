export class UserDto {
  constructor(
    public id: string,
    public username: string,
    public name: string,
    public lastName?: string,
    public role?: string
  ) {}
}
