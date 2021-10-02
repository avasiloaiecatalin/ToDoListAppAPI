import { Field, ObjectType } from "type-graphql";
import { FieldError } from "./FieldError";
import { Todo } from "../../entities/Todo";

@ObjectType()
export class TodoResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Todo, { nullable: true })
  todo?: Todo;
}