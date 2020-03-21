import { IBlock } from '../interfaces/block'
import { IDatapoint } from '../interfaces/datapoint'
import { Handler } from './handler'

export class CountHandler implements Handler {
    public calculate(interval: IBlock[], suffix?: string): IDatapoint {
        let result = null
        if (interval.length) {
            result = {
                type: 'COUNT' + (suffix ? '_' + suffix : ''),
                value: interval.length,
            }
        }
        return result
    }
}
