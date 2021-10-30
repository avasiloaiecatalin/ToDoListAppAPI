import { TOKEN_USAGE_CASES } from "../../../utils/constants"
import { User } from "../../../entities/User"
import { isTokenInDB, isTokenValid } from "../fields/token"


export const validateAccountActivation = async (token: string) => {
    const tokenInfo = await isTokenValid(token, process.env.ACTIVATE_ACCOUNT_SECRET)
    if (!await isTokenInDB(token, TOKEN_USAGE_CASES.ACTIVATE_ACCOUNT) || !tokenInfo) {
        return [
            {
                field: "token",
                message: "The provided token is invalid.",
            },
        ]
    }

    //! nu e atat de necesara partea asta...

    const selectedUser = await User.findOne({ where: { id: tokenInfo.userId } })

    if (selectedUser) {
        if (!selectedUser.isActivated) {
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