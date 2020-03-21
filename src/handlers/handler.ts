import { IBlock } from '../interfaces/block'
import { IDatapoint } from '../interfaces/datapoint'

export interface Handler {
    calculate(interval: IBlock[], suffix?: string): IDatapoint
}