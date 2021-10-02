declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    PORT: string;
    SESSION_SECRET: string;
    ACTIVATE_ACCOUNT_SECRET: string;
    CHANGE_EMAIL_SECRET: string;
    EMAIL_USER: string;
    EMAIL_PASSWORD: string;
  }
}