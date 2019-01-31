import { IBlock } from '../interfaces/block'
import { IDatapoint } from '../interfaces/datapoint';
export class DifficultyPoS {
    public calculate(interval: IBlock[]): IDatapoint {
        let result = null
        interval.some( (block) => {
            if (block.mixhash.length === 1 && block.number !== 0) {
                result = {
                    height: interval[0].number,
                    timestamp: interval[0].time_stamp,
                    type: 'DIFFICULTY_POS',
                    value: interval[0].bits,
                }
                return true
            }
            return false
        });
        return result
    }
}