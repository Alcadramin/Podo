import { User } from './core/classes/user';
import { Form } from './core/classes/form';
import { Submission } from './core/classes/submission';
import { Report } from './core/classes/report';
import { Folder } from './core/classes/folder';
import { System } from './core/classes/system';
export declare class JotForm {
    private client;
    user: User;
    form: Form;
    submission: Submission;
    report: Report;
    folder: Folder;
    system: System;
    constructor();
    /**
     * @param apiKey Your personal API key.
     */
    setApiKey: (apiKey: string) => void;
}
