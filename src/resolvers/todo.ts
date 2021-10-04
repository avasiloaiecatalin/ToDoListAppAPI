import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { isAuth } from "../middleware/isAuth";
import { isActivated } from "../middleware/isActivated";
import { CreateTodoInput } from "./inputs/TodoInputs";
import { MyContext } from "../types";
import { TodoResponse } from "./responses/TodoResponse";
import { Todo } from "../entities/Todo";
import { validateCreateTodo } from "./validators/todo/createTodo";
import { BooleanResponse } from "./responses/BooleanResponse";
import { validateDeleteTodo } from "./validators/todo/deleteTodo";
import { validateUpdateTodo } from "./validators/todo/updateTodo";
import { getConnection } from "typeorm";

@Resolver(Todo)
export class TodoResolver {
        //! CREATE TODO MUTATION
        @Mutation(() => TodoResponse)
        @UseMiddleware(isAuth)
        @UseMiddleware(isActivated)
        async createTodo(
            @Arg("fields") fields: CreateTodoInput,
            @Ctx() { req }: MyContext
        ): Promise<TodoResponse> {
            const errors = await validateCreateTodo(fields)
            if(errors){
                return {errors}
            }
    
            const todo = await Todo.create({
                ...fields,
                creatorId: req.session.userId,
            }).save()
    
            return {todo}
        }

        //* END CREATE TODO MUTATION

        //! DELETE TODO MUTATION
        @Mutation(() => BooleanResponse)
        @UseMiddleware(isAuth)
        @UseMiddleware(isActivated)
        async deleteTodo(
            @Arg("id") id: number,
            @Ctx() { req }: MyContext
        ): Promise<BooleanResponse> {
            const errors = await validateDeleteTodo(id, req.session.userId!)
            if(errors){
                return {errors}
            }
    
            try{
                await Todo.delete({id, creatorId: req.session.userId})
                return {
                    isDone: true
                }
            } catch(err){
                return {
                    isDone: false
                }
            }
        }
        //* END DELETE TODO MUTATION

        //! UPDATE TODO MUTATION
        
        @Mutation(() => TodoResponse)
        @UseMiddleware(isActivated)
        @UseMiddleware(isAuth)
        async updateTodo(
            @Ctx() {req}: MyContext,
            @Arg("fields") fields: CreateTodoInput,
            @Arg("todoId") todoId: number
        ): Promise<TodoResponse> {
            const errors = await validateUpdateTodo(fields, todoId, req.session.userId!)
            if(errors){
                return {errors}
            }

            // const todo = await Todo.findOne({where: {id: todoId}})
            var updateString = ''
            var firstField = false
            if(fields.title){
                updateString += (firstField ? `, `: ``) + `title = "${fields.title}"`
                firstField = true
            }

            if(fields.content){
                updateString += (firstField ? `, `: ``) + `content = "${fields.content}"`
                firstField = true
            }

            if(firstField){
                await getConnection().transaction(async (tm) => {
                    await tm.query(
                    `UPDATE todo SET ${updateString} WHERE id = ${todoId}`
                    )
                    return true
                })
            }

            const todo = await Todo.findOne({where: {id: todoId}})
            return {todo}

            // const user = await User.findOne(req.session.userId)
            // if(!user){
            //     return {}
            // }
            // if(fields?.email){
            //     const changeEmail = jwt.sign({userId: user.id, newEmail: fields.email}, process.env.CHANGE_EMAIL_SECRET, {expiresIn: CHANGE_EMAIL_EXPIRATION})
            //     const rChangeEmail = await getConnection().transaction(async (tm) => {
            //         await tm.query(
            //         `UPDATE user_action SET changeEmail = "${changeEmail}" where userId = ${user.id}`
            //         )
            //         return true
            //     })
            //     if(rChangeEmail){
            //         await sendEmail(fields.email, "Confirm your email change.", `${process.env.CORS_ORIGIN}/change-email/${changeEmail}`)
            //     }
            // }

            // if(fields?.newPassword){
            //     const hashedPassword = await argon2.hash(fields.newPassword)
            //     await getConnection().transaction(async (tm) => {
            //         await tm.query(
            //         `UPDATE user SET password = "${hashedPassword}" where id = ${user.id}`
            //         )
            //         return true
            //     })
            //     await sendEmail(user.email, "Your password has been changed.", `Not you? Recover your password now.`)
            // }

            // if(image){
            //     if(user.avatar){
            //         await removeAvatar(getActualAvatarId(user.avatar))
            //     }
            //     const avatar = await uploadAvatar(image)
            //     await getConnection().transaction(async (tm) => {
            //         await tm.query(
            //         `UPDATE user SET avatar = "${avatar}" where id = ${user.id}`
            //         )
            //         return true
            //     })
            // }

            // const newUser = await User.findOne(req.session.userId)

            // return {user: newUser}
        
        }

        //* END UPDATE TODO MUTATION
}