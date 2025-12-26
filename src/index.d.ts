import 'express';

export interface IdType {
    id: string;
}

declare module 'express' {
    export interface Request {
        user?: IdType;
        device?: IdType;
    }
}
