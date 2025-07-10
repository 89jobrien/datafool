import type { DataRow } from "@/definitions/types";
import type { UploadSuccessResponse } from "@/definitions/apiResponses";


export interface DataVisualizationProps {
    data: DataRow[];
}

export interface FileUploadProps {
    onUploadSuccess: (response: UploadSuccessResponse) => void;
}

export interface QueryInterfaceProps {
    tableName: string;
}

export interface ChartRendererProps {
    chartType: string;
    data: any;
    options: any;
}