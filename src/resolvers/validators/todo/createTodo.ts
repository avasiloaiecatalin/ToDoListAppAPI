import { CreateTodoInput } from "src/resolvers/inputs/TodoInputs"
import { isTodoContentValid } from "../fields/todoContent"
import { isTodoTitleValid } from "../fields/todoTitle"

export const validateCreateTodo = async (fields: CreateTodoInput) => {
    if(!isTodoTitleValid(fields.title)){
        return [
            {
              field: "title",
              message: "The todo title is invalid.",
            },
        ]
    }

    if(!isTodoContentValid(fields.content)){
        return [
            {
              field: "content",
              message: "The todo content is invalid",
            },
        ]
    }

    return null
}