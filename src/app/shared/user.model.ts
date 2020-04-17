export class User {
  constructor(
    public name: string,
    public surrname: string,
    public age: number,
    public email: string,
    public password: string,
    public passwordChanged?: boolean
  ) {}
}
