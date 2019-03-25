export interface IDatapoint {
    height?: number,
    interval?: number | string,
    timestamp?: number,
    date?: string,
    type: string,   
    value: number
}