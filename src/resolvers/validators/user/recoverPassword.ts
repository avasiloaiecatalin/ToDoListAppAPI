import jwt from 'jsonwebtoken'
import { CHANGE_PASSWORD_EXPIRATION, TOKEN_REQUEST_DELAY, TOKEN_USAGE_CASES } from "../../../utils/constants"
import { getConnection } from "typeorm"
import { User } from "../../../entities/User"
import { Token } from "../../../entities/Token"
import { isTokenValid } from "../fields/token"
import { isTokenSendable } from '../../../utils/checkTokenDelay'

export const validateRecoverAccountPassword = async (selectedUser?: User) => {
    if (!selectedUser) {
        return [
            {
                field: "user",
                message: "This account dosn't exist.",
            },
        ]
    }

    // check if exists another recover request

    const usageCaseId = await getConnection().transaction(async (tm) => {
        return await tm.query(
            `SELECT id FROM token_usage_case WHERE usageCase = "${TOKEN_USAGE_CASES.CHANGE_PASSWORD}"`
        )
    })

    var tokenRow = await Token.findOne({ where: { user: selectedUser, usageCase: usageCaseId[0].id } })
    var validateAsNew = false

    if (!tokenRow) {
        const changePassword = jwt.sign({ userId: selectedUser.id }, process.env.ACTIVATE_ACCOUNT_SECRET, { expiresIn: CHANGE_PASSWORD_EXPIRATION })
        tokenRow = await Token.create({ token: changePassword, user: selectedUser, usageCase: usageCaseId[0].id }).save()
        validateAsNew = true
    }

    const tokenInfo = await isTokenValid(tokenRow!.token, process.env.CHANGE_ACCOUNT_DETAILS_SECRET)
    if (!tokenInfo) {
        await getConnection().transaction(async (tm) => {
            return await tm.query(
                `DELETE FROM token WHERE id = ${tokenRow?.id} AND userId = ${tokenRow?.userId} AND usageCaseId = ${usageCaseId[0].id}`
            )
        })
        const changePassword = jwt.sign({ userId: selectedUser.id }, process.env.ACTIVATE_ACCOUNT_SECRET, { expiresIn: CHANGE_PASSWORD_EXPIRATION })
        await Token.create({ token: changePassword, user: selectedUser, usageCase: usageCaseId[0].id }).save()
        validateAsNew = true
    }

    if (!await isTokenSendable(tokenRow!.sentAt, TOKEN_REQUEST_DELAY) && !validateAsNew) {
        return [
            {
                field: "user",
                message: "You have to wait some time before being able to request another activation token.",
            },
        ]
    }

    return null

}