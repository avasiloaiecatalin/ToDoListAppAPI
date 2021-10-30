import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TokenUsageCase } from "./TokenUsageCase";
import { User } from "./User";

@ObjectType()
@Entity()
export class Token extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @PrimaryColumn({ unique: true })
    token!: string;

    @Field(() => String)
    @UpdateDateColumn()
    sentAt: Date;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.todos, { onDelete: 'CASCADE', cascade: true })
    user: User

    @PrimaryColumn()
    userId: number

    @Field(() => TokenUsageCase)
    @ManyToOne(() => TokenUsageCase, (usageCase) => usageCase.tokens)
    usageCase: TokenUsageCase

    @Field(() => Number)
    @Column({ default: 0 })
    resendTimes: number
}