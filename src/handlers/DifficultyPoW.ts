import { IBlock } from '../interfaces/block'
import { IDatapoint } from '../interfaces/datapoint'
export class DifficultyPoW {
    public calculate(interval: IBlock[]): IDatapoint {
        let result = null
        interval.some((block) => {
            if (block.mixhash.length > 1) {
                result = {
                    height: interval[0].number,
                    timestamp: interval[0].time_stamp,
                    type: 'DIFFICULTY_POW',
                    value: interval[0].bits,
                }
                return true
            }
            return false
        });
        return result
    }
}