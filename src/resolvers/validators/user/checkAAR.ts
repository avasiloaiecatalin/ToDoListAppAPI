import { User } from "../../../entities/User";

//* trebuie de pus rank cand o fi cazul

export const checkAAR = (needsLogin: boolean, selectedUser?: User, needsActivation?: boolean, needsRank?: boolean) => {
    if (needsLogin) {
        if (!selectedUser) {
            return [
                {
                    field: "user",
                    message: "You need to be logged in to perform this action.",
                },
            ]
        } else {
            if (needsActivation) {
                if (!selectedUser.isActivated) {
                    return [
                        {
                            field: "user",
                            message: "You need to activate your account to perform this action.",
                        },
                    ]
                } else {
                    if (needsRank) {
                        // check for rank
                    }
                }
            }
        }
    }
    return null
}