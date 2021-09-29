import { User } from "../../../../entities/User"
import { ActionsWithToken } from "../../../../types"
import { isTokenInDB } from "../fields/token"

export const validateAccountActivation = async (token: string, tokenInfo: any) => {
    if(!await isTokenInDB(token, ActionsWithToken.ACTIVATE_ACCOUNT) || !tokenInfo){
        return [
            {
              field: "token",
              message: "The provided token is invalid.",
            },
        ]
    }

    //! nu atat de necesara partea asta...

    const selectedUser = await User.findOne({where: {id: tokenInfo.userId}})

    if(selectedUser){
        if(!selectedUser.isActivated){
            return null
        }
        return [
            {
              field: "user",
              message: "This account is already activated. You can login.",
            },
        ]
    }
    return [
        {
          field: "user",
          message: "This account dosn't exist.",
        },
    ]

    //! --------------------
}

export const validateAccountActivationResend = async (email: string) => {
    const selectedUser = await User.findOne({where: {email}})

    if(selectedUser){
        if(selectedUser.isActivated){
            return [
                {
                  field: "user",
                  message: "This account is already activated. You can login.",
                },
            ]
        }
        return null
        
    }
    return [
        {
          field: "user",
          message: "This account dosn't exist.",
        },
    ]

    //! --------------------
}