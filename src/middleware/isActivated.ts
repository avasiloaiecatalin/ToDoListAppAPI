import { User } from "../entities/User";
import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql";

export const isActivated: MiddlewareFn<MyContext> = async ({context}, next) => {
    const user = await User.findOne(context.req.session.userId)
    if(!user?.isActivated){
        throw new Error("Your account isn't activated.")
    }
    return next()
}