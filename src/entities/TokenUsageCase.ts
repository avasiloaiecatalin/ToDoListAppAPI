import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Token } from "./Token";

@ObjectType()
@Entity()
export class TokenUsageCase extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({ unique: true })
    usageCase!: string;

    @OneToMany(() => Token, token => token.usageCase)
    tokens: Token[]

}