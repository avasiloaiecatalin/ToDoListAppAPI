import { Field, ObjectType } from "type-graphql";
import { FieldError } from "./FieldError";

@ObjectType()
export class  BooleanResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Boolean, { nullable: true })
  isDone?: boolean;
}