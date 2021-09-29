import { User } from '../../../../entities/User'
import validator from 'validator'

export const isEmailValid = (email: string) => {
    if(validator.isEmail(email)){
        return true
    }
    return false
}

export const isEmailUsed = async (email: string) => {
    const isUsed = await User.findOne({where: {email}})
    if(isUsed) {
        return isUsed
    }
    return false
}