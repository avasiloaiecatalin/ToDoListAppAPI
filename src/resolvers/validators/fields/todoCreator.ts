export const areYouTheNoteCreator = (userId: number, creatorId: number) => {
    if(creatorId === userId){
        return true
    }
    return false
}