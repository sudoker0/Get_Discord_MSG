import fetch from "node-fetch"
import dotenv from "dotenv"
import * as fs from "fs"
import * as CONF from "./config"
import { DisplayMessageType } from "./types/enum"

dotenv.config()

const CHAT_TEMPLATE = ` https://discord.com/api/v9/channels/$CHANNEL/messages?limit=100`
const API_KEY = process.env["API_KEY"] || ""
const wait = async (ms: number) => { return new Promise<void>(resolve => { setTimeout(() => { resolve() }, ms) }) }
const writeJSON = (f: string, c: any) => { fs.writeFileSync(f, JSON.stringify(c, null, CONF.BEAUTIFY ? 4 : 0)) }

async function fetchData() {
    var data: Chat = {}

    fs.mkdirSync(CONF.DATA_DIR, { recursive: true })
    fs.mkdirSync(CONF.LOG_DIR, { recursive: true })

    for (const id of CONF.ID_LIST) {
        var count = 0
        var limit_count = 0
        var file_count = 1
        var retry = 0

        var before = "" // ? ID of the last message in the API call
        console.log(`Now fetching: ${id}`)
        await wait(CONF.DELAY)
        var logstream = null
        if (CONF.WRITE_LOG) {
            // Reset log file
            fs.writeFileSync(`${CONF.LOG_DIR}/log-${id}.log`, "")
            logstream = fs.createWriteStream(`${CONF.LOG_DIR}/log-${id}.log`, { flags: "a" })
        }

        data[id] = []
        while (true) {
            var log = ""
            await wait(CONF.DELAY)
            log += `-------------------------\n`
            log += ` - Getting messages to end: ${before == "" ? "END" : before}\n`

            var chat_link = CHAT_TEMPLATE.replace("$CHANNEL", id) + (before == "" ? "" : `&before=${before}`)
            try {
                var result = await fetch(chat_link, {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "en-US",
                        "authorization": API_KEY,
                    },
                    "method": "GET",
                })
            }
            catch (e) {
                console.error(e)
                continue
            }

            if (!result.ok) {
                if (retry < CONF.RETRY_AMOUNT) {
                    retry++
                    log += ` - Retrying (Attempt ${retry})...\n`
                    continue
                } else {
                    console.error("Error: " + result.status)
                    break
                }
            }

            var r: Message[] = await result.json()
            if (r.length <= 0) {
                writeJSON(`${CONF.DATA_DIR}/data-${id}-${file_count}.json`, data)
                data[id] = []
                break
            }

            if (CONF.EXCLUDE_PROPERTIES.length > 0) {
                for (const m of r) {
                    for (const p of CONF.EXCLUDE_PROPERTIES) {
                        delete m[p]
                    }
                }
                log += ` - Excluded properties: ${CONF.EXCLUDE_PROPERTIES.join(", ")}\n`
            }

            count += r.length
            limit_count += r.length
            log += ` - Successfully fetched message from ${r[0].timestamp} to ${r[r.length - 1].timestamp}\n`
            log += ` - Message count: ${count}\n`
            before = r[r.length - 1].id

            switch (CONF.DISPLAY_MSG) {
                case DisplayMessageType.PARTIAL:
                    console.log(r[0])
                    break
                case DisplayMessageType.FULL:
                    console.log(...r)
                    break
            }

            data[id].push(...r)

            if (limit_count > CONF.SPLIT_EVERY) {
                console.log(` - Splitting file ${file_count}`)
                writeJSON(`${CONF.DATA_DIR}/data-${id}-${file_count}.json`, data)
                file_count++
                limit_count = 0
                data[id] = []
            }

            console.log(log)
            logstream?.write(log)
        }

        logstream?.end(`Total MSG in ${id}: ${count}`)
        console.log(`Total MSG in ${id}: ${count}`)

        data = {}
    }
}

(async () => {
    var start = new Date()
    await fetchData()
    var end = new Date()

    var time = end.getTime() - start.getTime()
    console.log(`Total time: ${time}ms`)
})();