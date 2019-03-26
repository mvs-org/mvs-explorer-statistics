import { IBlock } from '../interfaces/block'
import { Handler } from './handler'
import { IDatapoint } from '../interfaces/datapoint'

export class BlocktimeHandler implements Handler {
    public calculate(interval: IBlock[], suffix?: string): IDatapoint {
        let result = null
        if (interval.length >= 2) {
            result = {
                type: 'BLOCKTIME' + (suffix ? '_' + suffix : ''),
                value: (interval[interval.length-1].time_stamp - interval[0].time_stamp) / interval.length,
            }
        }
        return result
    }
}