import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Todo extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    title!: string;

    @Field({ nullable: true })
    @Column({ type: 'text', default: null })
    content: string;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @Column()
    creatorId: number;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.todos)
    creator: User
}