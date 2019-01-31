import { connect } from 'mongoose'
import { DifficultyPoS } from './handlers/DifficultyPoS'
import { DifficultyPoW } from './handlers/DifficultyPoW'
import { BlockModel } from './model/block'
import { StatisticModel } from './model/statistic'

const SYNC_THRESHOLD = 100
const SYNC_INTERVAL = 1000
const RETRY_INTERVAL = 5000
const URL = 'mongodb://localhost:27017/mvs'
let last: number = 1

// Set your handlers here
const BlockHandlers = [
    new DifficultyPoW(),
    new DifficultyPoS(),
]

async function calculateInterval() {
    console.info(`try with interval starting from ${last}`)
    if (!await BlockModel.findOne({ number: last + SYNC_INTERVAL + SYNC_THRESHOLD, orphan: 0 })) {
        return
    }
    const interval = await BlockModel.find({ number: { $lt: last + SYNC_INTERVAL, $gte: last }, orphan: 0 })
    const datapoints = await Promise.all(BlockHandlers.map((handler) => handler.calculate(interval)))
    datapoints.forEach(async (datapoint) => {
        if (datapoint) {
            await StatisticModel.update(
                { type: datapoint.type, height: datapoint.height },
                datapoint,
                { upsert: true, setDefaultsOnInsert: true }
            )
        }
    })
    last += SYNC_INTERVAL
    return datapoints
}

function sleep(millis: number) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), millis)
    })
}

// Main processing loop
(async () => {
    await connect(URL, { useNewUrlParser: true })
    while (true) {
        if (!await calculateInterval()) {
            await sleep(RETRY_INTERVAL)
        }
    }
})()