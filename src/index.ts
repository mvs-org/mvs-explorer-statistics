import { connect, Mongoose } from 'mongoose'
import { BlockModel } from './model/block'
import { StatisticModel } from './model/statistic'
import { DifficultyPoW } from './handlers/DifficultyPoW';
import { DifficultyPoS } from './handlers/DifficultyPoS';

const SYNC_THRESHOLD = 100
const SYNC_INTERVAL = 1000
const RETRY_INTERVAL = 5000
const URL = 'mongodb://localhost:27017/mvs'

//Set your handlers here
let BlockHandlers = [
    new DifficultyPoW(),
    new DifficultyPoS()
]

async function calculateInterval(last: number) {
    console.log(`try with interval starting from ${last}`)
    let endblock = await BlockModel.findOne({ number: last + SYNC_INTERVAL + SYNC_THRESHOLD, orphan: 0 })
    if (!endblock) {
        return
    }
    let interval = await BlockModel.find({ number: { $lt: last + SYNC_INTERVAL, $gte: last }, orphan: 0 })
    let datapoints = await Promise.all(BlockHandlers.map(handler => handler.calculate(interval)))
    datapoints.forEach(async (datapoint) => {
        if (datapoint)
            await StatisticModel.update({ type: datapoint.type, height: datapoint.height }, datapoint, { upsert: true, setDefaultsOnInsert: true });
    })
    last += SYNC_INTERVAL
    return datapoints
}

function sleep(millis: number) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), millis)
    })
}

// Main processing loop
(async () => {
    let last: number = 0
    let db: Mongoose = await connect(URL, { useNewUrlParser: true });
    while (true) {
        let result = await calculateInterval(last)
        if (!result)
            await sleep(RETRY_INTERVAL)
    }
})()