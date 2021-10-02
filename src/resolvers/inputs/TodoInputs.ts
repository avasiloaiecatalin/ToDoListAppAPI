import { Field, InputType } from "type-graphql";

@InputType()
export class CreateTodoInput {
    @Field()
    title: string

    @Field({nullable: true})
    content: string
}