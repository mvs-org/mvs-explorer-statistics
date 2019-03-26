import { IBlock } from '../interfaces/block'
import { Handler } from './handler'
import { IDatapoint } from '../interfaces/datapoint'

export class DifficultyPoS implements Handler {
    public calculate(interval: IBlock[], suffix?: string): IDatapoint {
        let result = null
        interval.some((block) => {
            if (block.version === 2) {
                result = {
                    type: 'DIFFICULTY_POS' + (suffix ? '_' + suffix : ''),
                    value: block.bits,
                }
                return true
            }
            return false
        });
        return result
    }
}