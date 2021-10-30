import jwt from 'jsonwebtoken'
import { Token } from '../../../entities/Token'
import { TOKEN_USAGE_CASES } from '../../../utils/constants'
import { getConnection } from 'typeorm'

export const isTokenInDB = async (token: string, usedFor: string) => {
    var inDB
    var usageCase
    switch (usedFor) {
        case TOKEN_USAGE_CASES.ACTIVATE_ACCOUNT:
            usageCase = await getConnection().transaction(async (tm) => {
                return await tm.query(
                    `SELECT * FROM token_usage_case WHERE usageCase = "${TOKEN_USAGE_CASES.ACTIVATE_ACCOUNT}"`
                )
            })
            inDB = await Token.findOne({ where: { token, usageCase: usageCase[0] } })
            if (!inDB) {
                return false
            }
            break
        case TOKEN_USAGE_CASES.CHANGE_PASSWORD:
            usageCase = await getConnection().transaction(async (tm) => {
                return await tm.query(
                    `SELECT * FROM token_usage_case WHERE usageCase = "${TOKEN_USAGE_CASES.CHANGE_PASSWORD}"`
                )
            })
            inDB = await Token.findOne({ where: { token, usageCase: usageCase[0] } })
            if (!inDB) {
                return false
            }
            break
        // case ActionsWithToken.CHANGE_PASSWORD:
        //     inDB = await UserAction.findOne({where: {changePassword: token}})
        //     if(!inDB) {
        //         return false
        //     }
        //     break
        // case ActionsWithToken.CHANGE_EMAIL:
        //     inDB = await UserAction.findOne({where: {changeEmail: token}})
        //     if(!inDB) {
        //         return false
        //     }
        //     break
        default: return false
    }
    return true
}

export const isTokenValid = async (token: string, secret: string) => {
    if (token) {
        const res = (<any>await jwt.verify(token, secret, async (err, payload) => {
            if (err) {
                return null
            }
            return payload
        }))

        if (res) {
            return res
        }
        return null
    }
    return null
}