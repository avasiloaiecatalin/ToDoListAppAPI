import { LoginInput } from "../../inputs/UserInputs"
import { isEmailUsed } from "../fields/email"
import { isPasswordCorrect } from "../fields/password"

export const validateLogin = async (fields: LoginInput) => {
    const user = await isEmailUsed(fields.email)
    if(!user){
        return [
            {
              field: "user",
              message: "Wrong email address or password.",
            },
        ]
    }

    if(!await isPasswordCorrect(user.password, fields.password)){
        return [
            {
              field: "user",
              message: "Wrong email address or password.",
            },
        ]
    }

    return null
}