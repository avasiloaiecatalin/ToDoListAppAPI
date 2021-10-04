import validator from "validator"

export const isTodoTitleValid = (title: string) => {
    if(validator.isLength(title, {min: 3, max: 255})){
        return true
    }
    return false
}