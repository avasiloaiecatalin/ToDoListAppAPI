import { MyContext } from "../types";
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import { User } from "../entities/User";
import { getConnection } from "typeorm";
import jwt from 'jsonwebtoken'
import argon2 from 'argon2'
import { UserResponse } from "./responses/UserResponse";
import { RegisterInput } from "./inputs/UserInputs";
import { validateRegister } from "./inputs/validators/user/register";
import { UserAction } from "../entities/UserAction";
import { ACTIVATE_ACCOUNT_EXPIRATION } from "../utils/constants";
import { sendEmail } from "../utils/sendEmail";
import { validateAccountActivation } from "./inputs/validators/user/activateAccount";

@Resolver(User)
export class UserResolver {
    @FieldResolver(() => String)
    email(
        @Root() user: User, 
        @Ctx() { req }: MyContext
    ) {
      if (req.session.userId === user.id) {
        return user.email;
      }
      return "";
    }

    //! ME QUERY

    @Query(() => User, { nullable: true })
    me(@Ctx() { req }: MyContext) {
        if (!req.session.userId) {
        return null;
        }
    
        return User.findOne(req.session.userId);
    }

    //* END ME QUERY

        //! REGISTER MUTATION

        @Mutation(() => UserResponse)
        async register(
          @Arg("fields") fields: RegisterInput,
          @Ctx() {req}: MyContext
        ): Promise<UserResponse> {
            const errors = await validateRegister(fields)
            if(errors){
              return {errors}
            }

            const hashedPassword = await argon2.hash(fields.password)
      
            const response = await getConnection().transaction(async () => {
              const user = await User.create({
                email: fields.email,
                password: hashedPassword
              }).save()
              const activateAccount = jwt.sign({userId: user.id}, process.env.ACTIVATE_ACCOUNT_SECRET, {expiresIn: ACTIVATE_ACCOUNT_EXPIRATION})
              await UserAction.create({activateAccount, user}).save()
              console.log("A new account has been created at < ", user.email, " >")
              return {user, activateAccount}
          })
      
          await sendEmail(response.user.email, "Activate your account", `${process.env.CORS_ORIGIN}/activate-account/${response.activateAccount}`)
          req.session.userId = response.user.id
          return {user: response.user}
        }
    
        //* END REGISTER MUTATION

            //! ACTIVATE ACCOUNT MUTATION

    @Mutation(() => UserResponse)
    async activateAccount(
        @Arg("token") token: string,
    ): Promise<UserResponse> {
        const errors = await validateAccountActivation(token, process.env.ACTIVATE_ACCOUNT_SECRET)
        if(errors){
            return {errors}
        }

        // const response = await getConnection().transaction(async (tm) => {
        // await tm.query(
        //     `UPDATE user_action SET activateAccount = NULL where userId = ${vf.userId}`
        // )

        // await tm.query(
        //     `UPDATE user SET isActivated = TRUE where id = ${vf.userId}`
        // )
        
        // return User.findOne({id: vf.userId})
        // })
        // return {user: response}
        return {}
    
    }

    //* END ACTIVATE ACCOUNT MUTATION
}