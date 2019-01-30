import { Block } from '../interfaces/block'
import { Datapoint } from '../interfaces/datapoint';
export class DifficultyPoS {
    constructor() {}
    calculate(interval: Block[]) : Datapoint{
        let result = null
        interval.some(function (block) {
            if (block.mixhash.length === 1) {
                result = {
                    type: 'DIFFICULTY_POS',
                    height: interval[0].number,
                    timestamp: interval[0].time_stamp,
                    value: interval[0].bits
                }
                return true
            }
            return false
        });
        return result;
    }
}