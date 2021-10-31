import { TOKEN_USAGE_CASES } from "../../../utils/constants"
import { User } from "../../../entities/User"
import { isTokenInDB, isTokenValid } from "../fields/token"


export const validateToken = async (token: string, action: string, secret: string) => {
    const tokenInfo = await isTokenValid(token, secret)
    if (!await isTokenInDB(token, action) || !tokenInfo) {
        return [
            {
                field: "user",
                message: "The provided token is invalid.",
            },
        ]
    }

    //! nu e atat de necesara partea asta...

    const selectedUser = await User.findOne({ where: { id: tokenInfo.userId } })

    if (!selectedUser) {
        return [
            {
                field: "user",
                message: "This account dosn't exist.",
            },
        ]
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

    return null

    //! --------------------
}