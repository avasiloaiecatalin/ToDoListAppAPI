import { UserAction } from "../../../entities/UserAction"
import { ACTIVATE_ACCOUNT_EXPIRATION } from "../../../utils/constants"
import { getConnection } from "typeorm"
import { User } from "../../../entities/User"
import { ActionsWithToken } from "../../../types"
import { isTokenInDB, isTokenValid } from "../fields/token"
import jwt from 'jsonwebtoken'
import { checkTokenDelay } from "../../../utils/checkTokenDelay"

export const validateAccountActivation = async (token: string) => {
    const tokenInfo = await isTokenValid(token, process.env.ACTIVATE_ACCOUNT_SECRET)
    if(!await isTokenInDB(token, ActionsWithToken.ACTIVATE_ACCOUNT) || !tokenInfo){
        return [
            {
              field: "token",
              message: "The provided token is invalid.",
            },
        ]
    }

    //! nu e atat de necesara partea asta...

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

export const validateAccountActivationResend = async (selectedUser?: User) => {
    // contul al carui email este prezentat sa existe si sa fie neactivat
    if(!selectedUser){
        return [
            {
              field: "user",
              message: "This account dosn't exist.",
            },
        ]
    }

    if(selectedUser.isActivated) {
        return [
            {
                field: "user",
                message: "This account is already activated. You can login.",
            },
        ]
    }

    // daca este un token in UserActions pt activare care inca sa fie activ, sa poata fi retrimis daca au trecut cel putin 5 minute din cele 30 in care este activ.
    // daca este un token in UserActions pt activare care nu mai este valid

    var userActions = await UserAction.findOne({where: {user: selectedUser}})
    const tokenInfo = await isTokenValid(userActions!.activateAccount, process.env.ACTIVATE_ACCOUNT_SECRET)
    var validateAsNew = false
    console.log(tokenInfo)
    if(!tokenInfo){
        const activateAccount = jwt.sign({userId: selectedUser.id}, process.env.ACTIVATE_ACCOUNT_SECRET, {expiresIn: ACTIVATE_ACCOUNT_EXPIRATION})
        await getConnection().transaction(async (tm) => {
            await tm.query(
            `UPDATE user_action SET activateAccount = "${activateAccount}" where userId = ${selectedUser.id}`
            )
            return true
        })
        userActions = await UserAction.findOne({where: {user: selectedUser}})
        validateAsNew = true
    }

    // n-au trecut macar X minute de la ultimul token generat pt activare?
    if(!await checkTokenDelay(tokenInfo) && !validateAsNew){
        return [
            {
                field: "user",
                message: "You have to wait some time before being able to request another activation token.",
            },
        ]
    }

    return null

    //! --------------------
}