export class Student {
  constructor(
     public name: string,
     public surrname: string,
     public email: string,
     public password_digest: string,
     public student_class_id: number,
     public password_changed?: boolean,
     public id?: number,
    

  ) {}
}
