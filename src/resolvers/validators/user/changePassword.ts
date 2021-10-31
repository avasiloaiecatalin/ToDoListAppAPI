import { isEmailValid } from "../fields/email"
import { isConfirmPasswordValid, isPasswordValid } from "../fields/password"

export const validateRecoverPasswordRequest = (email: string) => {
    if (!isEmailValid(email)) {
        return [
            {
                field: "email",
                message: "The email is invalid.",
            },
        ]
    }
    return null
}

export const validateRecoverPassword = (password: string, confirmPassword: string) => {
    if (!isPasswordValid(password)) {
        return [
            {
                field: "password",
                message: "The password is invalid.",
            },
        ]
    }

    if (!isConfirmPasswordValid(confirmPassword, password)) {
        return [
            {
                field: "confirmPassword",
                message: "The passwords must match.",
            },
        ]
    }

    return null
}