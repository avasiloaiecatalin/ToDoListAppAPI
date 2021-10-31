import jwt from 'jsonwebtoken'
import { Token } from "../../../entities/Token";
import { TokenUsageCase } from '../../../entities/TokenUsageCase';
import { User } from "../../../entities/User";
import { isTokenSendable } from "../../../utils/checkTokenDelay";
import { ACTIVATE_ACCOUNT_EXPIRATION, TOKEN_REQUEST_DELAY, TOKEN_USAGE_CASES } from "../../../utils/constants";
import { getConnection } from "typeorm";
import { isTokenValid } from "../fields/token";

export const createToken = async (selectedUser: User, expiration: string | number, usageCase: any, secret: string) => {
    const token = jwt.sign({ userId: selectedUser.id, usageCase }, secret, { expiresIn: expiration })
    const tokenRow = await Token.create({ token, user: selectedUser, usageCase }).save()
    return tokenRow
}

const deleteToken = async (tokenRow: Token, usageCase: any) => {
    return await getConnection().transaction(async (tm) => {
        return await tm.query(
            `DELETE FROM token WHERE id = ${tokenRow?.id} AND userId = ${tokenRow?.userId} AND usageCaseId = ${usageCase.id}`
        )
    })
}

export const validateAndGenerateUserActionToken = async (selectedUser: User | undefined, action: string, secret: string) => {
    // contul al carui email este prezentat sa existe si sa fie neactivat
    if (!selectedUser) {
        return null
    }

    if (action === TOKEN_USAGE_CASES.ACTIVATE_ACCOUNT) {
        if (selectedUser.isActivated) {
            return [
                {
                    field: "user",
                    message: "This account is already activated. You can login.",
                },
            ]
        }
    }

    const usageCase = await TokenUsageCase.findOne({ where: { usageCase: action } })

    var tokenRow = await Token.findOne({ where: { user: selectedUser, usageCase } })
    var validateAsNew = false
    if (!tokenRow) {
        // create and store tokenRow
        tokenRow = await createToken(selectedUser, ACTIVATE_ACCOUNT_EXPIRATION, usageCase, secret)
        validateAsNew = true
    }
    var tokenInfo = await isTokenValid(tokenRow!.token, secret)
    if (!tokenInfo) {
        // token is expired
        // recreate the token 
        //   - delete existing tokenRow from DB; 
        await deleteToken(tokenRow, usageCase)
        //   - create and store tokenRow;
        tokenRow = await createToken(selectedUser, ACTIVATE_ACCOUNT_EXPIRATION, usageCase, secret)
        //   - call isTokenValid and store the result to tokenInfo
        tokenInfo = await isTokenValid(tokenRow!.token, secret)
        validateAsNew = true
    }

    if (!await isTokenSendable(tokenRow!.sentAt, TOKEN_REQUEST_DELAY) && !validateAsNew) {
        return [
            {
                field: "user",
                message: "You have to wait some time before being able to make another request.",
            },
        ]
    }

    return null

}