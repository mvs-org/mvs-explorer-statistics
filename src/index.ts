import { connect } from 'mongoose'
import { DifficultyPoS } from './handlers/difficulty-pos.handler'
import { DifficultyPoW } from './handlers/difficulty-pow.handler'
import { CountHandler } from './handlers/block-counter.handler'
import { Handler } from './handlers/handler'
import { BlocktimeHandler } from './handlers/blocktime.handler'
import { TransactionCounterHandler } from './handlers/transaction-counter.handler'
import { BlockModel } from './model/block'
import { StatisticModel } from './model/statistic'

const URL = (process.env.MONGO_URL) ? process.env.MONGO_URL : 'mongodb://localhost:27017/metaverse'
const RETRY_INTERVAL = (process.env.RETRY_INTERVAL) ? parseInt(process.env.RETRY_INTERVAL, 10) : 20 * 1000 // 20 sec

// Setup configuration for time based calculations
let lastTime: Date = new Date(process.env.START_DAY ? process.env.START_DAY : '2016-02-11')
// tslint:disable-next-line: max-line-length
const SYNC_TIME_INTERVAL = 1000 * (process.env.SYNC_TIME_INTERVAL ? parseInt(process.env.SYNC_TIME_INTERVAL, 10) : 60 * 60 * 24)
const DO_TIMEBASED = process.env.DO_TIMEBASED === 'true'
// Set your handlers here
const TimeHandlers: Array<Handler> = [
    new DifficultyPoW(),
    new DifficultyPoS(),
    new CountHandler(),
    new TransactionCounterHandler(),
]

// Setup configuration for time block calculations
let lastBlock: number = (process.env.START_HEIGHT) ? parseInt(process.env.START_HEIGHT, 10) : 0
const DO_HEIGHTBASED = process.env.DO_HEIGHTBASED === 'true'
const SYNC_HEIGHT_THRESHOLD = (process.env.SYNC_HEIGHT_THRESHOLD) ? parseInt(process.env.SYNC_HEIGHT_THRESHOLD, 10) : 100
const SYNC_HEIGHT_INTERVAL = (process.env.SYNC_HEIGHT_INTERVAL) ? parseInt(process.env.SYNC_HEIGHT_INTERVAL, 10) : 1000
// Set your handlers here
const BlockHandlers: Array<Handler> = [
    new DifficultyPoW(),
    new DifficultyPoS(),
    new BlocktimeHandler(),
]

async function calculateTimeInterval() {
    const lastDate = lastTime.toISOString().slice(0, 10)
    console.info(`try time based with interval starting from ${lastDate}`)
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
    }).sort({number: 1})
    const datapoints = await Promise.all(TimeHandlers.map((handler) => handler.calculate(interval, 'TIME')))
    datapoints.forEach(async (datapoint) => {
        if (datapoint) {
            datapoint.height = interval[0].number
            datapoint.interval = SYNC_TIME_INTERVAL / 1000
            datapoint.timestamp = lastTime.getTime() / 1000
            datapoint.date = lastDate
            await StatisticModel.update(
                { type: datapoint.type, timestamp: datapoint.timestamp, interval: datapoint.interval },
                datapoint,
                { upsert: true, setDefaultsOnInsert: true },
            )
        }
    })
    lastTime = nextDayDate
    return datapoints
}

async function calculateHeightInterval() {
    console.info(`try height based with interval starting from ${lastBlock}`)
    if (!await BlockModel.findOne({ number: lastBlock + SYNC_HEIGHT_INTERVAL + SYNC_HEIGHT_THRESHOLD, orphan: 0 })) {
        return
    }
    const interval = await BlockModel.find({ number: { $lt: lastBlock + SYNC_HEIGHT_INTERVAL, $gte: lastBlock }, orphan: 0 }).sort({number: 1})
    const datapoints = await Promise.all(BlockHandlers.map((handler) => handler.calculate(interval, 'HEIGHT')))
    datapoints.forEach(async (datapoint) => {
        if (datapoint) {
            datapoint.height = lastBlock
            datapoint.interval = SYNC_HEIGHT_INTERVAL
            datapoint.timestamp = interval[0].time_stamp
            await StatisticModel.update(
                { type: datapoint.type, height: datapoint.height, interval: datapoint.interval },
                datapoint,
                { upsert: true, setDefaultsOnInsert: true },
            )
        }
    })
    lastBlock += SYNC_HEIGHT_INTERVAL
    return datapoints
}

function sleep(millis: number) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), millis)
    })
}

async function heightSchedule() {
    while (true) {
        if (!await calculateHeightInterval()) {
            await sleep(RETRY_INTERVAL)
        }
    }
}

async function timeSchedule() {
    while (true) {
        if (!await calculateTimeInterval()) {
            await sleep(RETRY_INTERVAL)
        }
    }
}

// Main processing loop
(async () => {
    await connect(URL, { useNewUrlParser: true })
    console.log('conneted to database ' + URL)
    if (DO_HEIGHTBASED) {
        heightSchedule()
    }
    if (DO_TIMEBASED) {
        timeSchedule()
    }
})()
