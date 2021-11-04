import { CreateTodoInput } from "src/resolvers/inputs/TodoInputs"
import { isTodoContentValid } from "../fields/todoContent"
import { isTodoTitleValid } from "../fields/todoTitle"

export const validateCreateTodo = async (fields: CreateTodoInput) => {
    if (!isTodoTitleValid(fields.title)) {
        return [
            {
                field: "title",
                message: "The todo title must have between 3 and 255 characters.",
            },
        ]
    }

    if (!isTodoContentValid(fields.content)) {
        return [
            {
                field: "content",
                message: "The todo content must have at most 255 characters.",
            },
        ]
    }

    return null
}