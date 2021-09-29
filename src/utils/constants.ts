export const __prod__ = process.env.NODE_ENV === "production";
export const ACTIVATE_ACCOUNT_EXPIRATION = '30m'
export const CHANGE_PASSWORD_EXPIRATION = 1000 * 60 * 60 * 24 * 3
export const CHANGE_EMAIL_EXPIRATION = 1000 * 60 * 60 * 24 * 1
export const COOKIE_NAME="uid"
export const REQUESTS_DELAY = 1000 * 60 * 3