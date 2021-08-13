import { Method } from 'axios';
export declare type IClient = InstanceType<typeof Client>;
export declare class Client {
    private defaultHeaders;
    constructor();
    private setAxios;
    setApiKey: (apiKey: string) => void;
    Request: (method: Method, path: string, data?: object | undefined) => Promise<object>;
}
