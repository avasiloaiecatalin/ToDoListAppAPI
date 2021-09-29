import validator from "validator"
import argon2 from 'argon2'

export const isPasswordValid = (password: string) => {
    if(validator.isStrongPassword(password)){
        return true
    }
    return false
}

export const isConfirmPasswordValid = (confirmPassword: string, password: string) => {
    if(confirmPassword === password){
        return true
    }
    return false
}

export const isPasswordCorrect = async (password: string, givenPassword: string) => {
    const valid = await argon2.verify(password, givenPassword)
    if(!valid) {
        return false
    }
    return true
}

export const areNewAndOldPasswordSame = async (oldPassword: string, newPassword: string) => {
    return isPasswordCorrect(oldPassword, newPassword)
}