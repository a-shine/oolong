export type Task = {
    id: string;
    projectId: string;
    content: string;
    createdAt: number;
    updatedAt: number;
    due: number; // use the timestamp and get the between range for the specified dates + 0 for undefined
    withTime: boolean;
    reacurence: number;
    complete: boolean;
}