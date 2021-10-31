import { MyContext } from "../types";
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import { User } from "../entities/User";
import { getConnection } from "typeorm";
import argon2 from 'argon2'
import { UserResponse } from "./responses/UserResponse";
import { LoginInput, RegisterInput } from "./inputs/UserInputs";
import { validateRegister } from "./validators/user/register";
import { ACTIVATE_ACCOUNT_EXPIRATION, COOKIE_NAME, TOKEN_USAGE_CASES } from "../utils/constants";
import { sendEmail } from "../utils/sendEmail";
import { validateToken } from "./validators/user/activateAccount";
import { isTokenValid } from "./validators/fields/token";
import { BooleanResponse } from "./responses/BooleanResponse";
import { validateLogin } from "./validators/user/login";
import { Token } from "../entities/Token";
import { TokenUsageCase } from "../entities/TokenUsageCase";
import { createToken, validateAndGenerateUserActionToken } from "./validators/user/generateToken";
import { validateRecoverPassword, validateRecoverPasswordRequest } from "./validators/user/changePassword";

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
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const registerErrors = await validateRegister(fields)
    if (registerErrors) {
      return { errors: registerErrors }
    }

    const hashedPassword = await argon2.hash(fields.password)

    const response = await getConnection().transaction(async () => {
      const user = await User.create({
        email: fields.email,
        password: hashedPassword
      }).save()
      const tokenUsageCase = await TokenUsageCase.findOne({ where: { usageCase: 'ACTIVATE_ACCOUNT' } })
      const tokenRow = await createToken(user, ACTIVATE_ACCOUNT_EXPIRATION, tokenUsageCase!, process.env.ACTIVATE_ACCOUNT_SECRET)
      console.log("A new account has been created at < ", user.email, " >")
      return { user, activateAccount: tokenRow.token }
    })

    await sendEmail(response.user.email, "Activate your account", `${process.env.CORS_ORIGIN}/activate-account/${response.activateAccount}`)
    req.session.userId = response.user.id
    return { user: response.user }
  }

  //* END REGISTER MUTATION

  //! GET ACCOUNT BY ACTIVATION TOKEN QUERY

  @Query(() => Number, { nullable: true })
  async getAccountIDByActivationToken(
    @Arg("token") token: string,
  ): Promise<Number> {
    const tokenInfo = await isTokenValid(token, process.env.ACTIVATE_ACCOUNT_SECRET)
    return tokenInfo.userId

  }

  //* END GET ACCOUNT BY ACTIVATION TOKEN QUERY

  //! ACTIVATE ACCOUNT MUTATION

  @Mutation(() => UserResponse)
  async activateAccount(
    @Arg("token") token: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = await validateToken(token, TOKEN_USAGE_CASES.ACTIVATE_ACCOUNT, process.env.ACTIVATE_ACCOUNT_SECRET)
    const tokenInfo = await isTokenValid(token, process.env.ACTIVATE_ACCOUNT_SECRET)

    if (errors) {
      return { errors }
    }

    const response = await getConnection().transaction(async (tm) => {
      await tm.query(
        //`UPDATE user_action SET activateAccount = NULL where userId = ${tokenInfo.userId}`
        `DELETE FROM token WHERE userId = ${tokenInfo.userId} AND usageCaseId = (SELECT id FROM token_usage_case WHERE usageCase = "${TOKEN_USAGE_CASES.ACTIVATE_ACCOUNT}")`
      )

      await tm.query(
        `UPDATE user SET isActivated = TRUE where id = ${tokenInfo.userId}`
      )

      return User.findOne({ id: tokenInfo.userId })
    })
    req.session.userId = response?.id;
    return { user: response }

  }

  //* END ACTIVATE ACCOUNT MUTATION

  //! RESEND ACTIVATION EMAIL MUTATION

  @Mutation(() => BooleanResponse)
  async resendActivationEmail(
    @Arg("email") email: string
  ): Promise<BooleanResponse> {
    const selectedUser = await User.findOne({ where: { email } })
    const errors = await validateAndGenerateUserActionToken(selectedUser, TOKEN_USAGE_CASES.ACTIVATE_ACCOUNT, process.env.ACTIVATE_ACCOUNT_SECRET)
    if (errors) {
      return { errors }
    }
    const usageCase = await getConnection().transaction(async (tm) => {
      return await tm.query(
        `SELECT * FROM token_usage_case WHERE usageCase = "${TOKEN_USAGE_CASES.ACTIVATE_ACCOUNT}"`
      )
    })

    const tokenData = await Token.findOne({ where: { user: selectedUser, usageCase: usageCase[0].id } })
    if (tokenData) {
      await sendEmail(email, "Activate your account", `${process.env.CORS_ORIGIN}/activate-account/${tokenData.token}`)
      await getConnection().transaction(async (tm) => {
        return await tm.query(
          `UPDATE token SET resendTimes = "${tokenData.resendTimes + 1}" where id = ${tokenData.id}`
        )
      })
      return { isDone: true }
    }
    return { isDone: false }
  }

  //* END RESEND ACTIVATION EMAIL MUTATION

  //! RECOVER ACCOUNT PASSWORD MUTATION

  @Mutation(() => BooleanResponse)
  async recoverAccountPassword(
    @Arg("email") email: string
  ): Promise<BooleanResponse> {
    const errors = validateRecoverPasswordRequest(email)
    if (errors) {
      return { errors }
    }
    const selectedUser = await User.findOne({ where: { email } })
    const tokenErrors = await validateAndGenerateUserActionToken(selectedUser, TOKEN_USAGE_CASES.CHANGE_PASSWORD, process.env.CHANGE_ACCOUNT_DETAILS_SECRET)
    if (tokenErrors) {
      return { errors: tokenErrors }
    }
    const usageCase = await getConnection().transaction(async (tm) => {
      return await tm.query(
        `SELECT * FROM token_usage_case WHERE usageCase = "${TOKEN_USAGE_CASES.CHANGE_PASSWORD}"`
      )
    })

    const tokenData = await Token.findOne({ where: { user: selectedUser, usageCase: usageCase[0].id } })
    if (tokenData) {
      await sendEmail(email, "Recover your account password", `${process.env.CORS_ORIGIN}/recover/${tokenData.token}`)
      await getConnection().transaction(async (tm) => {
        return await tm.query(
          `UPDATE token SET resendTimes = "${tokenData.resendTimes + 1}" where id = ${tokenData.id}`
        )
      })
    }
    return { isDone: true }
  }

  //* END RECOVER ACCOUNT PASSWORD MUTATION

  //! CHANGE PASSWORD WITH TOKEN MUTATION

  @Mutation(() => UserResponse)
  async changePasswordWithToken(
    @Arg("token") token: string,
    @Arg("password", { nullable: true }) password: string,
    @Arg("confirmPassword", { nullable: true }) confirmPassword: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const tokenErrors = await validateToken(token, TOKEN_USAGE_CASES.CHANGE_PASSWORD, process.env.CHANGE_ACCOUNT_DETAILS_SECRET)
    const tokenInfo = await isTokenValid(token, process.env.CHANGE_ACCOUNT_DETAILS_SECRET)
    if (tokenErrors) {
      return { errors: tokenErrors }
    }

    const errors = validateRecoverPassword(password, confirmPassword)
    if (errors) {
      return { errors }
    }

    const hashedPassword = await argon2.hash(password)
    const response = await getConnection().transaction(async (tm) => {
      await tm.query(
        `DELETE FROM token WHERE userId = ${tokenInfo.userId} AND usageCaseId = (SELECT id FROM token_usage_case WHERE usageCase = "${TOKEN_USAGE_CASES.CHANGE_PASSWORD}")`
      )
      await tm.query(
        `UPDATE user SET password = "${hashedPassword}" where id = ${tokenInfo.userId}`
      )

      return User.findOne({ id: tokenInfo.userId })
    })
    req.session.userId = response?.id;
    return { user: response }

  }

  //* END CHANGE PASSWORD WITH TOKEN MUTATION

  //! LOGIN MUTATION

  @Mutation(() => UserResponse)
  async login(
    @Arg("fields") fields: LoginInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = await validateLogin(fields)
    if (errors) {
      return { errors }
    }

    const user = await User.findOne({ where: { email: fields.email } })
    req.session.userId = user?.id;
    return { user }
  }

  //* END LOGIN MUTATION

  //! LOGOUT MUTATION

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }

  //* END LOGOUT MUTATION

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