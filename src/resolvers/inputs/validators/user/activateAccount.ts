import { ActionsWithToken } from "../../../../types"
import { isTokenInDB, isTokenValid } from "../fields/token"

export const validateAccountActivation = async (token: string, secret: string) => {
    const tokenInfo = await isTokenValid(token, secret)
    if(!await isTokenInDB(token, ActionsWithToken.ACTIVATE_ACCOUNT) || !tokenInfo){
        return [
            {
              field: "token",
              message: "The provided token is invalid.",
            },
        ]
    }

    if(Date.now() >= tokenInfo.exp * 1000) {
        return [
            {
              field: "token",
              message: "The provided token is expired.",
            },
        ]
    }

    return null
}