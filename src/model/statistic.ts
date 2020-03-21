import { Document, Model, model, Schema } from 'mongoose'
import { IDatapoint } from '../interfaces/datapoint'

export interface IStatisticModel extends Document, IDatapoint {
}

export const StatisticSchema: Schema = new Schema({
    height: Number,
    interval: Number,
    timestamp: Number,
    date: String,
    type: String,
    value: Number,
}, { collection: 'statistic' })
    .index({ type: 1, height: 1 }, { unique: true })
    .index({ type: 1, timestamp: 1 }, { unique: true })
    .index({ type: 1, date: 1 })

export const StatisticModel: Model<IStatisticModel> = model<IStatisticModel>('Statistic', StatisticSchema);
