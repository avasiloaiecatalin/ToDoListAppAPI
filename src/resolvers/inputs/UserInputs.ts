import { Field, InputType } from "type-graphql";

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
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}