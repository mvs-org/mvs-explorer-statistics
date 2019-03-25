import { connect } from 'mongoose'
import { DifficultyPoS } from './handlers/DifficultyPoS'
import { DifficultyPoW } from './handlers/DifficultyPoW'
import { BlockModel } from './model/block'
import { StatisticModel } from './model/statistic'

const URL = (process.env.MONGO_URL) ? process.env.MONGO_URL : 'mongodb://localhost:27017/mvs'
const RETRY_INTERVAL = (process.env.RETRY_INTERVAL) ? parseInt(process.env.RETRY_INTERVAL, 10) : 20 * 1000 // 20 sec

// Setup configuration for time based calculations
let lastTime: Date = new Date(process.env.START_DAY ? process.env.START_DAY : '2016-02-11')
// tslint:disable-next-line: max-line-length
const SYNC_TIME_INTERVAL = 1000 * (process.env.SYNC_TIME_INTERVAL ? parseInt(process.env.SYNC_TIME_INTERVAL, 10) : 60 * 60 * 24)
const DO_TIMEBASED = process.env.DO_TIMEBASED === 'true'
// Set your handlers here
const TimeHandlers = [
    new DifficultyPoW('TIME'),
    new DifficultyPoS('TIME'),
]

// Setup configuration for time block calculations
let lastBlock: number = (process.env.START_HEIGHT) ? parseInt(process.env.START_HEIGHT, 10) : 0
const DO_BLOCKBASED = process.env.DO_BLOCKBASED === 'true'
const SYNC_BLOCK_THRESHOLD = (process.env.SYNC_BLOCK_THRESHOLD) ? parseInt(process.env.SYNC_BLOCK_THRESHOLD, 10) : 100
const SYNC_BLOCK_INTERVAL = (process.env.SYNC_BLOCK_INTERVAL) ? parseInt(process.env.SYNC_BLOCK_INTERVAL, 10) : 1000
// Set your handlers here
const BlockHandlers = [
    new DifficultyPoW('BLOCK'),
    new DifficultyPoS('BLOCK'),
]

async function calculateTimeInterval() {
    console.info(`try time based with interval starting from ${lastTime}`)
    const latestBlock = await BlockModel.findOne({ orphan: 0 }).sort({ number: -1 })
    const latestBlockDate = new Date(latestBlock.time_stamp * 1000)

    if ((new Date(latestBlockDate).getTime() - lastTime.getTime()) / SYNC_TIME_INTERVAL < 1) {
        return
    }
    const nextDayDate = new Date(lastTime.getTime() + SYNC_TIME_INTERVAL)

    const interval = await BlockModel.find({
        orphan: 0,
        time_stamp: {
            $gte: lastTime.getTime() / 1000,
            $lt: nextDayDate.getTime() / 1000,
        },
    })
    const datapoints = await Promise.all(TimeHandlers.map((handler) => handler.calculate(interval)))
    datapoints.forEach(async (datapoint) => {
        if (datapoint) {
            datapoint.height = interval[0].number
            datapoint.interval = SYNC_TIME_INTERVAL / 1000
            datapoint.timestamp = lastTime.getTime() / 1000
            await StatisticModel.update(
                { type: datapoint.type, height: datapoint.height, interval: datapoint.interval },
                datapoint,
                { upsert: true, setDefaultsOnInsert: true },
            )
        }
    })
    lastTime = nextDayDate
    return datapoints
}

async function calculateBlockInterval() {
    console.info(`try block based with interval starting from ${lastBlock}`)
    if (!await BlockModel.findOne({ number: lastBlock + SYNC_BLOCK_INTERVAL + SYNC_BLOCK_THRESHOLD, orphan: 0 })) {
        return
    }
    const interval = await BlockModel.find({ number: { $lt: lastBlock + SYNC_BLOCK_INTERVAL, $gte: lastBlock }, orphan: 0 })
    const datapoints = await Promise.all(BlockHandlers.map((handler) => handler.calculate(interval)))
    datapoints.forEach(async (datapoint) => {
        if (datapoint) {
            datapoint.height = lastBlock
            datapoint.interval = SYNC_BLOCK_INTERVAL
            datapoint.timestamp = interval[0].time_stamp
            await StatisticModel.update(
                { type: datapoint.type, height: datapoint.height, interval: datapoint.interval },
                datapoint,
                { upsert: true, setDefaultsOnInsert: true },
            )
        }
    })
    lastBlock += SYNC_BLOCK_INTERVAL
    return datapoints
}

function sleep(millis: number) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), millis)
    })
}

async function blockSchedule() {
    while (true) {
        if (!await calculateBlockInterval()) {
            await sleep(RETRY_INTERVAL)
        }
    }
}

async function daySchedule() {
    while (true) {
        if (!await calculateTimeInterval()) {
            await sleep(RETRY_INTERVAL)
        }
    }
}

// Main processing loop
(async () => {
    await connect(URL, { useNewUrlParser: true })
    while (true) {
        if (false && DO_BLOCKBASED) {
            blockSchedule()
        }
        if (DO_TIMEBASED) {
            daySchedule()
        }
    }
})()
