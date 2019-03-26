import { IBlock } from '../interfaces/block'
import { Handler } from './handler'
import { IDatapoint } from '../interfaces/datapoint'

export class DifficultyPoW implements Handler {
    public calculate(interval: IBlock[], suffix?: string): IDatapoint {
        let result = null
        interval.some((block) => {
            if (block.version === 1) {
                result = {
                    type: 'DIFFICULTY_POW' + (suffix ? '_' + suffix : ''),
                    value: block.bits,
                }
                return true
            }
            return false
        });
        return result
    }
}