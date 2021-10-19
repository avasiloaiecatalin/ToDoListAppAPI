import { Arg, Ctx, Field, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware } from "type-graphql";
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
import { validateReadTodo } from "./validators/todo/readTodo";

@ObjectType()
class PaginatedTodos {
    @Field(() => [Todo])
    todos: Todo[]
    @Field()
    hasMore: boolean
}

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
        }

        //* END UPDATE TODO MUTATION

        //! READ TODO QUERY  
        
        @Query(() => TodoResponse)
        @UseMiddleware(isAuth)
        @UseMiddleware(isActivated)
        async readTodo(
            @Ctx() {req}: MyContext,
            @Arg("todoId") todoId: number
        ): Promise<TodoResponse> {
            const errors = await validateReadTodo(todoId, req.session.userId!)
            if(errors){
                return {errors}
            }

            const todo = await Todo.findOne({where: {id: todoId}})
            if(todo){
                return {todo}
            }
            return {}
        }

        //* END READ TODO QUERY

        //! READ MULTIPLE TODOS MUTATION

        @Query(() => PaginatedTodos)
        @UseMiddleware(isAuth)
        @UseMiddleware(isActivated)
        async todos(
            @Arg("limit", () => Int) limit: number,
            @Arg("cursor", () => String, { nullable: true }) cursor: string | null
        ): Promise<PaginatedTodos> {
            const realLimit = Math.min(50, limit);
            const realLimitPlusOne = realLimit + 1;
            var myCursor

            if (cursor) {
                //myCursor = new Date(parseInt(cursor));
                myCursor = new Date(new Date().getTime())
            }

            console.log("c: ", myCursor)
            //myCursor = toMySQLDate(myCursor)
            myCursor = myCursor?.toISOString().slice(0, 19).replace('T', ' ')
            console.log("d: ", myCursor)

            const q = `select t.id as tid, t.createdAt, t.title, t.content, t.creatorId, u.id as uid, u.email as email
            from todo t, user u
            where u.id = t.creatorId
            ${cursor ? ` and t.createdAt < "${myCursor}"` : ""}
            order by t.createdAt DESC
            limit ${realLimitPlusOne}`

            const posts = await getConnection().query(q);
            const reshapedPosts = posts.map((element: any) => {
                const reshapedElement = {
                    id: element.tid,
                    title: element.title,
                    content: element.content, 
                    createdAt: element.createdAt,
                    creatorId: element.creatorId,
                    creator: {
                        id: element.uid,
                        email: element.email
                    }
                }
                return reshapedElement
            })

            return {
                todos: reshapedPosts.slice(0, realLimit),
                hasMore: reshapedPosts.length >= realLimitPlusOne,
            };
        }

        //* END READ MULTIPLE TODOS MUTATION
}