import { Document, Schema, Model, model} from "mongoose";
import { Block } from "../interfaces/block";

export interface IBlockModel extends Document, Block{

}

export var BlockSchema: Schema = new Schema({
  bits: String,
  hash: String,
  merkle_tree_hash: String,
  mixhash: String,
  nonde: String,
  number: Number,
  previous_block_hash: String,
  time_stamp: Number,
  transaction_count: Number,
  version: Number,
  orphan: Number,
  txs: [String]
}, {collection: 'block'} );

export const BlockModel: Model<IBlockModel> = model<IBlockModel>("Block", BlockSchema);


