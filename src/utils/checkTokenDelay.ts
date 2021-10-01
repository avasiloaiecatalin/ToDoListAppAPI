import { TOKEN_REQUEST_DELAY } from "./constants"

export const checkTokenDelay = async (tokenInfo: any) => {
    const dateNow = new Date()
    const tokenTime = tokenInfo.exp
    const dateToken = new Date(tokenTime * 1000)
    // getTimeFromTS(dateNow.getTime())
    // getTimeFromTS(tokenTime* 1000)
    
    // console.log(dateNow)
    // console.log(tokenTime * 1000)
    // console.log("====")
    // console.log(tokenTime * 1000 - dateNow.getTime())

    console.log(dateNow + '\n'+ dateToken+'\n'+new Date(dateNow.getTime() + TOKEN_REQUEST_DELAY))
    // if(dateToken.getTime() - dateNow.getTime() > TOKEN_REQUEST_DELAY){
    //     return true
    // }

    return false
}