export interface IBlock {
    bits: number
    hash: string
    merkle_tree_hash: string
    mixhash: string
    nonce: string
    number: number
    previous_block_hash: string
    time_stamp: number
    transaction_count: number
    version: number
    orphan?: number
    txs: string[]
}
