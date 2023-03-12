"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs = __importStar(require("fs"));
const CONF = __importStar(require("./config"));
const enum_1 = require("./types/enum");
const crypto_1 = require("crypto");
dotenv_1.default.config();
const CHAT_TEMPLATE = ` https://discord.com/api/v9/channels/$CHANNEL/messages?after=$AFTER&limit=100`;
const TOTAL_MSG_TEMPLATE = `https://discord.com/api/v9/guilds/${CONF.GUILD_ID}/messages/search?channel_id=$CHANNEL`;
const API_KEY = process.env["API_KEY"] || "";
const wait = async (ms) => { return new Promise(resolve => { setTimeout(() => { resolve(); }, ms); }); };
const writeJSON = (f, c) => {
    return new Promise((resolve, reject) => {
        try {
            fs.writeFile(f, JSON.stringify(c, null, CONF.BEAUTIFY ? 4 : 0), () => { resolve(); });
        }
        catch (e) {
            reject(e);
        }
    });
};
const readJSON = (f) => {
    return new Promise((resolve, reject) => {
        try {
            fs.readFile(f, "utf8", (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(JSON.parse(data));
            });
        }
        catch (e) {
            reject(e);
        }
    });
};
async function fetchData() {
    const SERVER_STORE_DIR = `${CONF.DATA_DIR}/server-${CONF.GUILD_ID}`;
    var data = {};
    fs.mkdirSync(CONF.DATA_DIR, { recursive: true });
    fs.mkdirSync(CONF.LOG_DIR, { recursive: true });
    bmain: for (const id of CONF.ID_LIST) {
        const DIR_TO_STORE_DATA = `${SERVER_STORE_DIR}/channel-${id}`;
        var filelist = {};
        var count = 0;
        var limit_count = 0;
        var file_count = 1;
        var retry = 0;
        var total_msg = 0;
        var logstream = null;
        var after_message_id = "0";
        var after_message_id_list = ["0"];
        await wait(CONF.DELAY);
        if (CONF.WRITE_LOG) {
            fs.writeFileSync(`${CONF.LOG_DIR}/log-${CONF.GUILD_ID}-${id}.log`, "");
            logstream = fs.createWriteStream(`${CONF.LOG_DIR}/log-${CONF.GUILD_ID}-${id}.log`, { flags: "a" });
        }
        const log = (msg) => {
            return new Promise((resolve, reject) => {
                console.log(msg);
                if (logstream == null)
                    resolve();
                logstream?.write(msg + '\n', (e) => {
                    if (e == null || e == undefined) {
                        resolve();
                    }
                    else {
                        reject(e);
                    }
                });
            });
        };
        const fretry = async (msg, error) => {
            if (retry < CONF.RETRY_AMOUNT) {
                await log(`${msg}: ${error}`);
                await log(` - Retrying (Attempt: ${retry})`);
                retry++;
                return true;
            }
            else {
                await log(` - Cannot continue: ${error}`);
                return false;
            }
        };
        if (CONF.SPLIT_EVERY % 100 != 0) {
            await log(" - An internal error has occurred: CONF.SPLIT_EVERY must be a multiple of 100");
            break bmain;
        }
        data[id] = [];
        await log(`=========================`);
        await log(`Server: ${CONF.GUILD_ID}`);
        await log(`-------------------------`);
        await log(`Now fetching channel: ${id}`);
        switch (CONF.WHAT_TO_DO_WITH_EXISTING_CHAT_DATA) {
            case enum_1.ExistingDataAction.NOTHING:
                if (fs.existsSync(DIR_TO_STORE_DATA)) {
                    await log(` - Warning: Chat data for channel ${id} in server ${CONF.GUILD_ID} already existed.`);
                    continue bmain;
                }
                break;
            case enum_1.ExistingDataAction.APPEND_NEW_DATA:
                await log(` - Warning: You should use NOTHING or OVERRIDE_DATA instead of APPEND_NEW_DATA.`);
                var path = `${DIR_TO_STORE_DATA}/metadata.json`;
                if (!fs.existsSync(path)) {
                    await log(` - Warning: Cannot find metadata (${path}). Fallback to creating new data instead.`);
                    break;
                }
                var readData = await readJSON(path);
                after_message_id_list = readData["begin_id"];
                after_message_id = after_message_id_list[after_message_id_list.length - 2];
                after_message_id_list.pop();
                await log(`Let's continue from message: ${after_message_id}`);
                file_count = readData["file_count"];
                count = readData["count"];
                fs.rmSync(`${DIR_TO_STORE_DATA}/data-${file_count}.json`);
                break;
            case enum_1.ExistingDataAction.OVERRIDE_DATA:
                fs.rmSync(DIR_TO_STORE_DATA, { recursive: true, force: true });
                break;
        }
        fetch_total_msg: while (true) {
            var number_of_msg = TOTAL_MSG_TEMPLATE.replace("$CHANNEL", id);
            try {
                var number_of_msg_fetch = await (0, node_fetch_1.default)(number_of_msg, {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "en-US",
                        "authorization": API_KEY,
                    },
                    "method": "GET",
                });
            }
            catch (e) {
                var r = await fretry(` - An internal error occured while fetching the total amount of messages`, e);
                if (r)
                    continue fetch_total_msg;
                else
                    continue bmain;
            }
            if (number_of_msg_fetch.ok) {
                retry = 0;
                var number_of_msg_json = await number_of_msg_fetch.json();
                total_msg = number_of_msg_json.total_results;
                break fetch_total_msg;
            }
            else {
                var r = await fretry(` - An error has occured`, number_of_msg_fetch.status);
                if (r)
                    continue fetch_total_msg;
                else
                    continue bmain;
            }
        }
        main: while (true) {
            await wait(CONF.DELAY);
            await log(`-------------------------`);
            await log(` - Getting messages after message ID: ${after_message_id == "0" ? "BEGIN_CHANNEL" : after_message_id}`);
            var chat_link = CHAT_TEMPLATE.replace("$CHANNEL", id).replace("$AFTER", after_message_id);
            var result = null;
            fetch_data: while (true) {
                try {
                    result = await (0, node_fetch_1.default)(chat_link, {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "en-US",
                            "authorization": API_KEY,
                        },
                        "method": "GET",
                    });
                }
                catch (e) {
                    var r = await fretry(` - An internal error occured while fetching the messages`, e);
                    if (r)
                        continue fetch_data;
                    else
                        break main;
                }
                if (result.ok) {
                    retry = 0;
                    break fetch_data;
                }
                else {
                    var r = await fretry(` - An error has occured`, result.status);
                    if (r)
                        continue fetch_data;
                    else
                        break main;
                }
            }
            if (result == null) {
                await log(` - Cannot continue: No response`);
                break main;
            }
            retry = 0;
            var res = await result.json();
            if (res.length <= 0) {
                if (data[id].length <= 0) {
                    await log(` - No more data to find, and no more data to write.`);
                    file_count--;
                }
                else {
                    await log(` - No more data to find, now writing the data to file #${file_count}...`);
                    var filename = (0, crypto_1.randomUUID)();
                    filelist[file_count] = filename;
                    fs.mkdirSync(DIR_TO_STORE_DATA, { recursive: true });
                    await writeJSON(`${DIR_TO_STORE_DATA}/${filename}.json`, data);
                }
                var extra_part_to_cut = count % CONF.SPLIT_EVERY;
                const metadata = {
                    comment: "This is a very important file, do not delete it. Or functionality like `CONTINUE_WRITING_TO_EXISTING_DATA` will fail.",
                    begin_id: after_message_id_list,
                    file_count: file_count,
                    count: count - (extra_part_to_cut == 0 ? CONF.SPLIT_EVERY : extra_part_to_cut)
                };
                await writeJSON(`${DIR_TO_STORE_DATA}/metadata.json`, metadata);
                data[id] = [];
                break;
            }
            if (CONF.EXCLUDE_PROPERTIES.length > 0) {
                for (const m of res) {
                    for (const p of CONF.EXCLUDE_PROPERTIES) {
                        delete m[p];
                    }
                }
                await log(` - Excluded properties: ${CONF.EXCLUDE_PROPERTIES.join(", ")}`);
            }
            count += res.length;
            limit_count += res.length;
            res.reverse();
            await log(` - Successfully fetched message from ${res[0].timestamp} to ${res[res.length - 1].timestamp}`);
            await log(` - Message count: ${count} / ${total_msg}`);
            after_message_id = res[res.length - 1].id;
            after_message_id_list.push(after_message_id);
            switch (CONF.DISPLAY_MSG) {
                case enum_1.DisplayMessageType.PARTIAL:
                    await log(` - Response content (partial):\n${JSON.stringify(res[0], null, 2)}`);
                    break;
                case enum_1.DisplayMessageType.FULL:
                    await log(` - Response content (full):\n${JSON.stringify(res, null, 2)}`);
                    break;
            }
            data[id].push(...res);
            if (limit_count >= CONF.SPLIT_EVERY) {
                await log(` - Maximum amount of data allow in one file reached, now writing the data to file #${file_count}...`);
                var filename = (0, crypto_1.randomUUID)();
                filelist[file_count] = filename;
                fs.mkdirSync(DIR_TO_STORE_DATA, { recursive: true });
                await writeJSON(`${DIR_TO_STORE_DATA}/${filename}.json`, data);
                file_count++;
                limit_count = 0;
                data[id] = [];
            }
        }
        await log(`Finalizing...`);
        for (const i in filelist) {
            fs.renameSync(`${DIR_TO_STORE_DATA}/${filelist[i]}.json`, `${DIR_TO_STORE_DATA}/data-${i}.json`);
        }
        await log(`Total MSG in channel ${id}: ${count}`);
        await log(`=========================`);
        logstream?.end();
        data = {};
    }
}
(async () => {
    var start = new Date();
    await fetchData();
    var end = new Date();
    var time = end.getTime() - start.getTime();
    console.log(`Total time: ${time}ms`);
})();
//# sourceMappingURL=index.js.map