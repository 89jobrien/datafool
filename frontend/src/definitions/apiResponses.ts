import type { DataRow } from "types";

export interface UploadSuccessResponse {
    table_name: string;
    columns: string[];
    rows: number;
    filename: string;
}

export interface QueryResponse {
    query_generated: string;
    data: DataRow[];
}

export interface ErrorResponse {
    type: string;
    message: string;
}


export type SystemResponse = {
    type: 'success' | 'error';
    message: string;
};