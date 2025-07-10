

export type DataRow = { [key: string]: string | number | boolean | null };

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter';



export type ChartData = {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string;
        borderColor?: string;
        borderWidth?: number;
    }>;
};

export type ChartOptions = {
    scales?: {
        x?: {
            type: 'linear' | 'category';
            beginAtZero?: boolean;
        };
        y?: {
            type: 'linear' | 'category';
            beginAtZero?: boolean;
        };
    };
    tooltips?: {
        enabled?: boolean;
        mode?: 'index' | 'nearest';
    };
    legend?: {
        display?: boolean;
        position?: 'top' | 'bottom' | 'left' | 'right';
    };
};





// export type FunctionCall = {
//     name: string;
//     arguments: string;
// };


// export type FunctionCallResponse = {
//     name: string;
//     arguments: string;
// };

// export type LLM = {
//     name: string;
//     description: string;
//     max_tokens: number;
//     temperature: number;
//     top_p: number;
//     frequency_penalty: number;
//     presence_penalty: number;
// };

// export type UserMessage = {
//     id: string;
//     user_id: string;
//     role: 'user';
//     content: string;
//     timestamp: string;
// };

// export type AssistantMessage = {
//     id: string;
//     model: LLM;
//     role: 'assistant';
//     content: string;
//     timestamp: string;
// };

// export type SystemMessage = {
//     id: string;
//     role: 'system';
//     content: string;
//     timestamp: string;
// };

// export type Message = UserMessage | AssistantMessage | SystemMessage;