export const isTokenSendable = async (sentAt: Date, delay: number) => {
    const dateNow = new Date()
    const diffTime = Math.abs(dateNow.getTime() - sentAt.getTime())
    if (diffTime > delay) {
        return true
    }

    return false
}