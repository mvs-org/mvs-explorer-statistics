import { IBlock } from '../interfaces/block'
import { IDatapoint } from '../interfaces/datapoint';
export class DifficultyPoS {
    public readonly type: string
    constructor(public suffix?: string) {
        this.type = 'DIFFICULTY_POS' + (suffix ? '_' + suffix : '')
    }
    public calculate(interval: IBlock[]): IDatapoint {
        let result = null
        interval.some((block) => {
            if (block.version === 2) {
                result = {
                    type: this.type,
                    value: block.bits,
                }
                return true
            }
            return false
        });
        return result
    }
}