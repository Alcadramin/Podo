import { IClient } from '../client';
interface IReport {
    getReport(reportId: string): Promise<object>;
    deleteReport(reportId: string): Promise<object>;
}
export declare class Report implements IReport {
    private client;
    constructor(client: IClient);
    /**
     * Get more information about a data report.
     * @param reportId Report ID.
     */
    getReport: (reportId: string) => Promise<object>;
    /**
     * Delete an existing report.
     * @param reportId Report ID.
     */
    deleteReport: (reportId: string) => Promise<object>;
}
export {};
