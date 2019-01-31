import { Document, Model, model, Schema } from 'mongoose'
import { IDatapoint } from '../interfaces/datapoint'

export interface IStatisticModel extends Document, IDatapoint {
}

export const StatisticSchema: Schema = new Schema({
    height: Number,
    timestamp: Number,
    type: String,
    value: Number,
}, { collection: 'statistic' })
    .index({ type: 1, height: 1 }, { unique: true })

export const StatisticModel: Model<IStatisticModel> = model<IStatisticModel>('Statistic', StatisticSchema);


