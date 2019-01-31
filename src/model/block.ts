import { Document, Model, model, Schema} from 'mongoose'
import { IBlock } from '../interfaces/block'

export interface IBlockModel extends Document, IBlock {

}

export const BlockSchema: Schema = new Schema({
  bits: String,
  hash: String,
  merkle_tree_hash: String,
  mixhash: String,
  nonde: String,
  number: Number,
  orphan: Number,
  previous_block_hash: String,
  time_stamp: Number,
  transaction_count: Number,
  txs: [String],
  version: Number,
}, {collection: 'block'} )

export const BlockModel: Model<IBlockModel> = model<IBlockModel>('Block', BlockSchema)

