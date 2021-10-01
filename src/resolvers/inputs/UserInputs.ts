import { Field, InputType } from "type-graphql";

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class RegisterInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  confirmPassword: string;
}

@InputType()
export class EditAccountInput {
  @Field({nullable: true})
  email: string;

  @Field({nullable: true})
  newPassword: string;

  @Field({nullable: true})
  confirmNewPassword: string;

  @Field()
  oldPassword: string;
}