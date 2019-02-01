import { IBlock } from '../interfaces/block'
import { IDatapoint } from '../interfaces/datapoint';
export class DifficultyPoS {
    public calculate(interval: IBlock[]): IDatapoint {
        let result = null
        interval.some( (block) => {
            if (block.version === 2) {
                result = {
                    type: 'DIFFICULTY_POS',
                    value: block.bits,
                }
                return true
            }
            return false
        });
        return result
    }
}