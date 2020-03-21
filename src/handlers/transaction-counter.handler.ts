import { IBlock } from '../interfaces/block'
import { IDatapoint } from '../interfaces/datapoint'
import { Handler } from './handler'

export class TransactionCounterHandler implements Handler {
    public calculate(interval: IBlock[], suffix?: string): IDatapoint {
        let result = null
        if (interval.length) {
            result = {
                type: 'TX_COUNT' + (suffix ? '_' + suffix : ''),
                value: interval.reduce((acc, block) => acc + block.transaction_count, 0),
            }
        }
        return result
    }
}