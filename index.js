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
dotenv_1.default.config();
const CHAT_TEMPLATE = ` https://discord.com/api/v9/channels/$CHANNEL/messages?limit=100`;
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
async function fetchData() {
    var data = {};
    fs.mkdirSync(CONF.DATA_DIR, { recursive: true });
    fs.mkdirSync(CONF.LOG_DIR, { recursive: true });
    bmain: for (const id of CONF.ID_LIST) {
        var count = 0;
        var limit_count = 0;
        var file_count = 1;
        var retry = 0;
        var total_msg = 0;
        var logstream = null;
        var before = "";
        await wait(CONF.DELAY);
        if (CONF.WRITE_LOG) {
            fs.writeFileSync(`${CONF.LOG_DIR}/log-${id}.log`, "");
            logstream = fs.createWriteStream(`${CONF.LOG_DIR}/log-${id}.log`, { flags: "a" });
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
        data[id] = [];
        await log(`=========================`);
        await log(`Now fetching: ${id}`);
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
            await log(` - Getting messages from ID: ${before == "" ? "END_CHANNEL" : before}`);
            var chat_link = CHAT_TEMPLATE.replace("$CHANNEL", id) + (before == "" ? "" : `&before=${before}`);
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
                await log(` - No more data to find, now writing the data to file #${file_count}...`);
                await writeJSON(`${CONF.DATA_DIR}/data-${id}-${file_count}.json`, data);
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
            await log(` - Successfully fetched message from ${res[0].timestamp} to ${res[res.length - 1].timestamp}\n`);
            await log(` - Message count: ${count} / ${total_msg}`);
            before = res[res.length - 1].id;
            switch (CONF.DISPLAY_MSG) {
                case enum_1.DisplayMessageType.PARTIAL:
                    await log(` - Response content (partial):\n${JSON.stringify(res[0], null, 2)}`);
                    break;
                case enum_1.DisplayMessageType.FULL:
                    await log(` - Response content (full):\n${JSON.stringify(res, null, 2)}`);
                    break;
            }
            data[id].push(...res);
            if (limit_count > CONF.SPLIT_EVERY) {
                await log(` - Maximum amount of data allow in one file reached, now writing the data to file #${file_count}...`);
                await writeJSON(`${CONF.DATA_DIR}/data-${id}-${file_count}.json`, data);
                file_count++;
                limit_count = 0;
                data[id] = [];
            }
        }
        await log(`Total MSG in ${id}: ${count}`);
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