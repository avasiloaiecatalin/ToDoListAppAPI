import { User } from '../../../entities/User'
import validator from 'validator'

export const isTitleValid = (title: string) => {
    if(!validator.isLength(title, {min: 3, max: 255})){
        return false
    }
    if(!validator.isAlphanumeric(title)){
        return false
    }
    return true
}

export const isEmailUsed = async (email: string) => {
    const isUsed = await User.findOne({where: {email}})
    if(isUsed) {
        return isUsed
    }
    return false
}