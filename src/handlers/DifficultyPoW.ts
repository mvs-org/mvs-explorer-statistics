import { IBlock } from '../interfaces/block'
import { IDatapoint } from '../interfaces/datapoint'
export class DifficultyPoW {
    public calculate(interval: IBlock[]): IDatapoint {
        let result = null
        interval.some((block) => {
            if (block.version === 1) {
                result = {
                    type: 'DIFFICULTY_POW',
                    value: block.bits,
                }
                return true
            }
            return false
        });
        return result
    }
}