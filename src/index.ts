import { connect, Mongoose } from 'mongoose'
import { BlockModel } from './model/block'
import { DifficultyPoW } from './handlers/DifficultyPoW';
import { DifficultyPoS } from './handlers/DifficultyPoS';

const SYNC_THRESHOLD = 100
const SYNC_INTERVAL = 1000
const RETRY_INTERVAL = 5000
const URL = 'mongodb://localhost:27017/mvs'

let BlockHandlers = [
    new DifficultyPoW(),
    new DifficultyPoS()
]
let last: number = 0
let db: Mongoose

async function calculateInterval() {
    console.log(`try with interval starting from ${last}`)
    let endblock = await BlockModel.findOne({ number: last + SYNC_INTERVAL + SYNC_THRESHOLD, orphan: 0 })
    if (!endblock) {
        return
    }
    let interval = await BlockModel.find({ number: { $lt: last + SYNC_INTERVAL, $gte: last }, orphan: 0 })
    let result = await Promise.all(BlockHandlers.map(handler => handler.calculate(interval)))
    last += SYNC_INTERVAL
    return result
}

function sleep(millis: number) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), millis)
    })
}

(async () => {
    db = await connect(URL, { useNewUrlParser: true });
    while (true) {
        let result = await calculateInterval()
        if (result)
            console.log(result)
        else
            await sleep(RETRY_INTERVAL)
    }
})()

process.stdin.resume();//so the program will not close instantly

function exitHandler(options: any, exitCode: number) {
    console.info('exiting')
    try {
        db.disconnect()
        console.info('Database connection closed')
    } catch (error) {
        console.error(error)
    }
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));