import { IClient } from '../client';
interface ISystem {
    getPlans(plan: string): Promise<object>;
}
export declare class System implements ISystem {
    private client;
    constructor(client: IClient);
    /**
     * Get limit and prices of a plan.
     * @param plan  Name of the requested plan. Must be one of the following: | **FREE** | **BRONZE** | **SILVER** | **GOLD** | **PLATINUM** |
     */
    getPlans: (plan: string) => Promise<object>;
}
export {};
