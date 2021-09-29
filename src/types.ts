import { Request, Response } from "express";
import { Session, SessionData } from "express-session";

export type MyContext = {
    req: Request & { session: Session & Partial<SessionData> & { userId?: number } },
    res: Response
}

export enum ActionsWithToken {
    ACTIVATE_ACCOUNT,
    CHANGE_PASSWORD,
    CHANGE_EMAIL
}