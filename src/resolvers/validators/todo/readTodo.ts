import { Todo } from "../../../entities/Todo"
import { areYouTheNoteCreator } from "../fields/todoCreator"

export const validateReadTodo = async(todoId: number, userId: number) => {
    const todo = await Todo.findOne(todoId)
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
              message: "You don't have the rights to see this todo.",
            },
        ]
    }

    return null
}