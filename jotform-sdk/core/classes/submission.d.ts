import { IClient } from '../client';
interface ISubmission {
    getSubmission(submissionId: string): Promise<object>;
    editSubmission(submissionId: string, data: object): Promise<object>;
    deleteSubmission(submissionId: string): Promise<object>;
}
export declare class Submission implements ISubmission {
    private client;
    constructor(client: IClient);
    /**
     * Similar to **getFormSubmissions**. But only get a single submission.
     * @param submissionId Submission ID.
     */
    getSubmission: (submissionId: string) => Promise<object>;
    /**
     * Edit a single submission.
     * @param submissionId Submission ID.
     * @param data Submission data.
     */
    editSubmission: (submissionId: string, data: object) => Promise<object>;
    /**
     * Delete a single submission.
     * @param submissionId Submission ID.
     */
    deleteSubmission: (submissionId: string) => Promise<object>;
}
export {};
