import { TOKEN_REQUEST_DELAY } from "./constants"

export const checkTokenDelay = async (tokenInfo: any) => {
    const dateNow = new Date()
    const tokenTime = tokenInfo.iat * 1000
    const dateToken = new Date(tokenTime)           

    const diffTime = Math.abs(dateNow.getTime() - dateToken.getTime())
    console.log(diffTime)

    if(diffTime > TOKEN_REQUEST_DELAY){
        return true
    }

    return false
}