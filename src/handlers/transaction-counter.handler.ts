import { IBlock } from '../interfaces/block'
import { Handler } from './handler'
import { IDatapoint } from '../interfaces/datapoint'

export class TransactionCounterHandler implements Handler {
    public calculate(interval: IBlock[], suffix?: string): IDatapoint {
        let result = null
        if (interval.length) {
            result = {
                type: 'TX_COUNT' + (suffix ? '_' + suffix : ''),
                value: interval.reduce((acc, block)=>acc+block.transaction_count, 0),
            }
        }
        return result
    }
}