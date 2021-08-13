import { IClient } from '../client';
interface IFolder {
    getFolder(folderId: string): Promise<object>;
}
export declare class Folder implements IFolder {
    private client;
    constructor(client: IClient);
    /**
     * Get a list of forms in a folder, and other details about the form such as folder color.
     * @param folderId Folder ID.
     */
    getFolder: (folderId: string) => Promise<object>;
}
export {};
