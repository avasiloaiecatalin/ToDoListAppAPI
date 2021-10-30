export const __prod__ = process.env.NODE_ENV === "production";
export const ACTIVATE_ACCOUNT_EXPIRATION = '30m'
export const CHANGE_PASSWORD_EXPIRATION = '3h'
export const CHANGE_EMAIL_EXPIRATION = 1000 * 60 * 60 * 24 * 1
export const COOKIE_NAME = "uid"
export const TOKEN_REQUEST_DELAY = 1000 * 60 * 1
export const TOKEN_USAGE_CASES = {
    ACTIVATE_ACCOUNT: "ACTIVATE_ACCOUNT",
    CHANGE_PASSWORD: "CHANGE_PASSWORD"
}