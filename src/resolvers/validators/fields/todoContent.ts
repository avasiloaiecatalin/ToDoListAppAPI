import validator from "validator"

export const isTodoContentValid = (content: string) => {
    if(validator.isLength(content, {max: 255})){
        return true
    }
    return false
}