import { Todo } from "../../../entities/Todo";
import { CreateTodoInput } from "../../../resolvers/inputs/TodoInputs";
import { isTodoContentValid } from "../fields/todoContent";
import { areYouTheNoteCreator } from "../fields/todoCreator";
import { isTodoTitleValid } from "../fields/todoTitle";

export const validateUpdateTodo = async(fields: CreateTodoInput, todoId: number, userId: number) => {
    const todo = await Todo.findOne(todoId)
    var updateSomething = false
    if(!todo){
        return [
            {
                field: "todo",
                message: "This todo doesn't exist."
            }
        ]
    }

    if(!areYouTheNoteCreator(userId, todo.creatorId)){
        return [
            {
              field: "todo",
              message: "You don't have the rights to update this todo.",
            },
        ]
    }

    if(fields?.title){
        updateSomething = true
        if(!isTodoTitleValid(fields.title)){
            return [
                {
                  field: "title",
                  message: "The todo title is invalid.",
                },
            ]
        }
    }

    if(fields?.content){
        updateSomething = true
        if(!isTodoContentValid(fields.content)){
            return [
                {
                  field: "content",
                  message: "The todo content is invalid",
                },
            ]
        }
    }

    if(!updateSomething){
        return [
            {
              field: "todo",
              message: "You must complete at least one field.",
            },
        ]
    }

    return null
}