import { Todo } from "../../../entities/Todo"
import { areYouTheNoteCreator } from "../fields/todoCreator"

export const validateDeleteTodo = async (id: number, userId: number) => {
    const todo = await Todo.findOne({where: {id}})
    if(!todo){
        return [
            {
              field: "todo",
              message: "This todo doesn't exist.",
            },
        ]
    }
    if(!areYouTheNoteCreator(userId, todo.creatorId)){
        return [
            {
              field: "todo",
              message: "You don't have the rights to delete this todo.",
            },
        ]
    }
    return null
}