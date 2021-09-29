import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class UserAction extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;
    
    @Field({nullable: true})
    @Column({default: null})
    activateAccount!: string;
    
    @Field()
    @Column({nullable: true}) 
    changePassword!: string;

    @Field()
    @Column({nullable: true}) 
    changeEmail!: string;

    @OneToOne(() => User, {onDelete: 'CASCADE', cascade: true})
    @JoinColumn()
    user!: User;

}