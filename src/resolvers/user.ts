import { MyContext } from "../types";
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import { User } from "../entities/User";
import { getConnection } from "typeorm";
import jwt from 'jsonwebtoken'
import argon2 from 'argon2'
import { UserResponse } from "./responses/UserResponse";
import { LoginInput, RegisterInput } from "./inputs/UserInputs";
import { validateRegister } from "./validators/user/register";
import { UserAction } from "../entities/UserAction";
import { ACTIVATE_ACCOUNT_EXPIRATION } from "../utils/constants";
import { sendEmail } from "../utils/sendEmail";
import { validateAccountActivation, validateAccountActivationResend } from "./validators/user/activateAccount";
import { isTokenValid } from "./validators/fields/token";
import { BooleanResponse } from "./responses/BooleanResponse";
import { validateLogin } from "./validators/user/login";

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
        const errors = await validateAccountActivation(token)
        const tokenInfo = await isTokenValid(token, process.env.ACTIVATE_ACCOUNT_SECRET)
        if(errors){
            return {errors}
        }

        const response = await getConnection().transaction(async (tm) => {
        await tm.query(
            `UPDATE user_action SET activateAccount = NULL where userId = ${tokenInfo.userId}`
        )

        await tm.query(
            `UPDATE user SET isActivated = TRUE where id = ${tokenInfo.userId}`
        )
        
        return User.findOne({id: tokenInfo.userId})
        })
        return {user: response}
    
    }

    //* END ACTIVATE ACCOUNT MUTATION

    //! RESEND ACTIVATION EMAIL MUTATION

    @Mutation(() => BooleanResponse)
    async resendActivationEmail(
      @Arg("email") email: string
    ): Promise<BooleanResponse> {
      const selectedUser = await User.findOne({where: {email}})
      const errors = await validateAccountActivationResend(selectedUser)
      if(errors){
        return {errors}
      }

      const userActions = await UserAction.findOne({where: {user: selectedUser}})
      await sendEmail(email, "Activate your account", `${process.env.CORS_ORIGIN}/activate-account/${userActions?.activateAccount}`)
      return {isDone: true}
    }

    //* END RESEND ACTIVATION EMAIL MUTATION

    //! LOGIN MUTATION

    @Mutation(() => UserResponse)
    async login(
        @Arg("fields") fields: LoginInput,
        @Ctx() {req}: MyContext
    ): Promise<UserResponse> {
        const errors = await validateLogin(fields)
        if(errors){
            return {errors}
        }

        const user = await User.findOne({where: {email: fields.email}})
        req.session.userId = user?.id;
        return {user}
    }

    //* END LOGIN MUTATION

    //! EDIT ACCOUNT DETAILS MUTATION

    // @Mutation(() => UserResponse)
    // @UseMiddleware(isActivated)
    // @UseMiddleware(isAuth)
    // async editAccount(
    //     @Ctx() {req}: MyContext,
    //     @Arg("fields") fields: EditAccountInput,
    // ): Promise<UserResponse> {
    //     const errors = await validateEditAccountDetails(fields, req.session.userId)
    //     if(errors){
    //         return {errors}
    //     }

    //     const user = await User.findOne(req.session.userId)
    //     if(!user){
    //         return {}
    //     }
    //     if(fields?.email){
    //         const changeEmail = jwt.sign({userId: user.id, newEmail: fields.email}, process.env.CHANGE_EMAIL_SECRET, {expiresIn: CHANGE_EMAIL_EXPIRATION})
    //         const rChangeEmail = await getConnection().transaction(async (tm) => {
    //             await tm.query(
    //             `UPDATE user_action SET changeEmail = "${changeEmail}" where userId = ${user.id}`
    //             )
    //             return true
    //         })
    //         if(rChangeEmail){
    //             await sendEmail(fields.email, "Confirm your email change.", `${process.env.CORS_ORIGIN}/change-email/${changeEmail}`)
    //         }
    //     }

    //     if(fields?.newPassword){
    //         const hashedPassword = await argon2.hash(fields.newPassword)
    //         await getConnection().transaction(async (tm) => {
    //             await tm.query(
    //             `UPDATE user SET password = "${hashedPassword}" where id = ${user.id}`
    //             )
    //             return true
    //         })
    //         await sendEmail(user.email, "Your password has been changed.", `Not you? Recover your password now.`)
    //     }

    //     const newUser = await User.findOne(req.session.userId)

    //     return {user: newUser}
    
    // }
    //* END EDIT ACCOUNT DETAILS MUTATION
}