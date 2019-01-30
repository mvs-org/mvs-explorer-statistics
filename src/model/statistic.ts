import { Document, Schema, Model, model } from "mongoose";
import { Datapoint } from "../interfaces/datapoint";

export interface IStatisticModel extends Document, Datapoint {
}

export var StatisticSchema: Schema = new Schema({
    type: String,
    height: Number,
    timestamp: Number,
    value: Number
}, { collection: 'statistic' });
StatisticSchema.index({ type: 1, height: 1 }, { unique: true });

export const StatisticModel: Model<IStatisticModel> = model<IStatisticModel>("Statistic", StatisticSchema);


