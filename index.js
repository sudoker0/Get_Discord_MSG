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
const API_KEY = process.env["API_KEY"] || "";
const wait = async (ms) => { return new Promise(resolve => { setTimeout(() => { resolve(); }, ms); }); };
const writeJSON = (f, c) => { fs.writeFileSync(f, JSON.stringify(c, null, CONF.BEAUTIFY ? 4 : 0)); };
async function fetchData() {
    var data = {};
    fs.mkdirSync(CONF.DATA_DIR, { recursive: true });
    fs.mkdirSync(CONF.LOG_DIR, { recursive: true });
    for (const id of CONF.ID_LIST) {
        var count = 0;
        var limit_count = 0;
        var file_count = 1;
        var retry = 0;
        var before = "";
        console.log(`Now fetching: ${id}`);
        await wait(CONF.DELAY);
        var logstream = null;
        if (CONF.WRITE_LOG) {
            fs.writeFileSync(`${CONF.LOG_DIR}/log-${id}.log`, "");
            logstream = fs.createWriteStream(`${CONF.LOG_DIR}/log-${id}.log`, { flags: "a" });
        }
        data[id] = [];
        while (true) {
            var log = "";
            await wait(CONF.DELAY);
            log += `-------------------------\n`;
            log += ` - Getting messages to end: ${before == "" ? "END" : before}\n`;
            var chat_link = CHAT_TEMPLATE.replace("$CHANNEL", id) + (before == "" ? "" : `&before=${before}`);
            var result = await (0, node_fetch_1.default)(chat_link, {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "en-US",
                    "authorization": API_KEY,
                },
                "method": "GET",
            });
            if (!result.ok) {
                if (retry < CONF.RETRY_AMOUNT) {
                    retry++;
                    log += ` - Retrying (Attempt ${retry})...\n`;
                    continue;
                }
                else {
                    console.error("Error: " + result.status);
                    break;
                }
            }
            var r = await result.json();
            if (r.length <= 0) {
                writeJSON(`${CONF.DATA_DIR}/data-${id}-${file_count}.json`, data);
                data[id] = [];
                break;
            }
            if (CONF.EXCLUDE_PROPERTIES.length > 0) {
                for (const m of r) {
                    for (const p of CONF.EXCLUDE_PROPERTIES) {
                        delete m[p];
                    }
                }
                log += ` - Excluded properties: ${CONF.EXCLUDE_PROPERTIES.join(", ")}\n`;
            }
            count += r.length;
            limit_count += r.length;
            log += ` - Successfully fetched message from ${r[0].timestamp} to ${r[r.length - 1].timestamp}\n`;
            log += ` - Message count: ${count}\n`;
            before = r[r.length - 1].id;
            switch (CONF.DISPLAY_MSG) {
                case enum_1.DisplayMessageType.PARTIAL:
                    console.log(r[0]);
                    break;
                case enum_1.DisplayMessageType.FULL:
                    console.log(...r);
                    break;
            }
            data[id].push(...r);
            if (limit_count > CONF.SPLIT_EVERY) {
                console.log(` - Splitting file ${file_count}`);
                writeJSON(`${CONF.DATA_DIR}/data-${id}-${file_count}.json`, data);
                file_count++;
                limit_count = 0;
                data[id] = [];
            }
            console.log(log);
            logstream?.write(log);
        }
        logstream?.end(`Total MSG in ${id}: ${count}`);
        console.log(`Total MSG in ${id}: ${count}`);
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