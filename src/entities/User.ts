import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Todo } from "./Todo";

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({ unique: true })
    email!: string;
  
    @Column()
    password!: string;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @Column({default: false})
    isActivated!: boolean;

    @OneToMany(() => Todo, todo => todo.creator)
    todos: Todo[]
}