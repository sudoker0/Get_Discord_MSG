import fetch, { Response } from "node-fetch"
import dotenv from "dotenv"
import * as fs from "fs"
import * as CONF from "./config"
import { DisplayMessageType } from "./types/enum"
dotenv.config()

const CHAT_TEMPLATE = ` https://discord.com/api/v9/channels/$CHANNEL/messages?limit=100`
const TOTAL_MSG_TEMPLATE = `https://discord.com/api/v9/guilds/${CONF.GUILD_ID}/messages/search?channel_id=$CHANNEL`
const API_KEY = process.env["API_KEY"] || ""

const wait = async (ms: number) => { return new Promise<void>(resolve => { setTimeout(() => { resolve() }, ms) }) }
const writeJSON = (f: string, c: any) => {
    return new Promise<void>((resolve, reject) => {
        try {
            fs.writeFile(f, JSON.stringify(c, null, CONF.BEAUTIFY ? 4 : 0), () => { resolve() })
        }
        catch (e) {
            reject(e)
        }
    })
}

async function fetchData() {
    var data: Chat = {}
    fs.mkdirSync(CONF.DATA_DIR, { recursive: true })
    fs.mkdirSync(CONF.LOG_DIR, { recursive: true })

    bmain: for (const id of CONF.ID_LIST) {
        var count = 0
        var limit_count = 0
        var file_count = 1
        var retry = 0
        var total_msg = 0
        var logstream: fs.WriteStream | null = null
        var before = "" // ? ID of the last message in the API call

        await wait(CONF.DELAY)
        if (CONF.WRITE_LOG) {
            // Reset log file
            fs.writeFileSync(`${CONF.LOG_DIR}/log-${id}.log`, "")
            logstream = fs.createWriteStream(`${CONF.LOG_DIR}/log-${id}.log`, { flags: "a" })
        }

        const log = (msg: string) => {
            return new Promise<void>((resolve, reject) => {
                console.log(msg)
                if (logstream == null) resolve()
                logstream?.write(msg + '\n', (e) => {
                    if (e == null || e == undefined) {
                        resolve()
                    } else {
                        reject(e)
                    }
                })
            })
        }

        const fretry = async (msg: string, error: any) => {
            if (retry < CONF.RETRY_AMOUNT) {
                await log(`${msg}: ${error}`)
                await log(` - Retrying (Attempt: ${retry})`)
                retry++
                return true
            } else {
                await log(` - Cannot continue: ${error}`)
                return false
            }
        }

        data[id] = []
        await log(`=========================`)
        await log(`Now fetching: ${id}`)

        fetch_total_msg: while (true) {
            var number_of_msg = TOTAL_MSG_TEMPLATE.replace("$CHANNEL", id)
            try {
                var number_of_msg_fetch = await fetch(number_of_msg, {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "en-US",
                        "authorization": API_KEY,
                    },
                    "method": "GET",
                })
            }
            catch (e) {
                var r = await fretry(` - An internal error occured while fetching the total amount of messages`, e)
                if (r) continue fetch_total_msg
                else continue bmain
            }

            if (number_of_msg_fetch.ok)
            {
                retry = 0
                var number_of_msg_json = await number_of_msg_fetch.json()
                total_msg = number_of_msg_json.total_results
                break fetch_total_msg
            }
            else {
                var r = await fretry(` - An error has occured`, number_of_msg_fetch.status)
                if (r) continue fetch_total_msg
                else continue bmain
            }
        }

        main: while (true) {
            await wait(CONF.DELAY)
            await log(`-------------------------`)
            await log(` - Getting messages from ID: ${before == "" ? "END_CHANNEL" : before}`)

            var chat_link = CHAT_TEMPLATE.replace("$CHANNEL", id) + (before == "" ? "" : `&before=${before}`)
            var result: Response | null = null

            fetch_data: while (true) {
                try {
                    result = await fetch(chat_link, {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "en-US",
                            "authorization": API_KEY,
                        },
                        "method": "GET",
                    })
                }
                catch (e) {
                    var r = await fretry(` - An internal error occured while fetching the messages`, e)
                    if (r) continue fetch_data
                    else break main
                }

                if (result.ok)
                {
                    retry = 0
                    break fetch_data
                }
                else {
                    var r = await fretry(` - An error has occured`, result.status)
                    if (r) continue fetch_data
                    else break main
                }
            }

            if (result == null) {
                await log(` - Cannot continue: No response`)
                break main
            }
            retry = 0

            var res: Message[] = await result.json()
            if (res.length <= 0) {
                await log(` - No more data to find, now writing the data to file #${file_count}...`)
                await writeJSON(`${CONF.DATA_DIR}/data-${id}-${file_count}.json`, data)
                data[id] = []
                break
            }

            if (CONF.EXCLUDE_PROPERTIES.length > 0) {
                for (const m of res) {
                    for (const p of CONF.EXCLUDE_PROPERTIES) {
                        delete m[p]
                    }
                }
                await log(` - Excluded properties: ${CONF.EXCLUDE_PROPERTIES.join(", ")}`)
            }

            count += res.length
            limit_count += res.length
            await log(` - Successfully fetched message from ${res[0].timestamp} to ${res[res.length - 1].timestamp}\n`)
            await log(` - Message count: ${count} / ${total_msg}`)
            before = res[res.length - 1].id

            switch (CONF.DISPLAY_MSG) {
                case DisplayMessageType.PARTIAL:
                    await log(` - Response content (partial):\n${JSON.stringify(res[0], null, 2)}`)
                    break
                case DisplayMessageType.FULL:
                    await log(` - Response content (full):\n${JSON.stringify(res, null, 2)}`)
                    break
            }
            data[id].push(...res)

            if (limit_count > CONF.SPLIT_EVERY) {
                await log(` - Maximum amount of data allow in one file reached, now writing the data to file #${file_count}...`)
                await writeJSON(`${CONF.DATA_DIR}/data-${id}-${file_count}.json`, data)
                file_count++
                limit_count = 0
                data[id] = []
            }
        }

        await log(`Total MSG in ${id}: ${count}`)
        await log(`=========================`)
        logstream?.end()
        data = {}
    }
}

(async () => {
    var start = new Date()
    await fetchData()
    var end = new Date()

    var time = end.getTime() - start.getTime()
    console.log(`Total time: ${time}ms`)
})()