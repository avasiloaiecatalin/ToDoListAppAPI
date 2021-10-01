import { RegisterInput } from "../../inputs/UserInputs"
import { isEmailUsed, isEmailValid } from "../fields/email"
import { isConfirmPasswordValid, isPasswordValid } from "../fields/password"

export const validateRegister = async (fields: RegisterInput) => {
    if(!isEmailValid(fields.email)){
        return [
            {
              field: "email",
              message: "The email address is invalid.",
            },
        ]
    }

    if(await isEmailUsed(fields.email)){
        return [
            {
              field: "email",
              message: "The email address is already used.",
            },
        ]
    }

    if(!isPasswordValid(fields.password)){
        return [
            {
              field: "password",
              message: "The password is invalid.",
            },
        ]
    }

    if(!isConfirmPasswordValid(fields.confirmPassword, fields.password)) {
        return [
            {
              field: "confirmPassword",
              message: "The passwords must match.",
            },
        ]
    }

    return null
}