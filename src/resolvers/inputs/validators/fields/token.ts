import jwt from 'jsonwebtoken'
import { ActionsWithToken } from '../../../../types'
import { UserAction } from '../../../../entities/UserAction'

export const isTokenInDB = async (token: string, usedFor: ActionsWithToken) => {
    var inDB
    switch(usedFor) {
        case ActionsWithToken.ACTIVATE_ACCOUNT:
            inDB = await UserAction.findOne({where: {activateAccount: token}})
            if(!inDB) {
                return false
            }
            break
        case ActionsWithToken.CHANGE_PASSWORD:
            inDB = await UserAction.findOne({where: {changePassword: token}})
            if(!inDB) {
                return false
            }
            break
        case ActionsWithToken.CHANGE_EMAIL:
            inDB = await UserAction.findOne({where: {changeEmail: token}})
            if(!inDB) {
                return false
            }
            break
        default: return false
    }
    return true
}

export const isTokenValid = async (token: string, secret: string) => {
    const res = (<any>await jwt.verify(token, secret, async (err, payload) => {
        if(err){
            return null
        }
       return payload
    }))

    if(res){
        return res
    }
    return null
}