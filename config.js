"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GUILD_ID = exports.SPLIT_EVERY = exports.DISPLAY_MSG = exports.EXCLUDE_PROPERTIES = exports.BEAUTIFY = exports.DATA_DIR = exports.LOG_DIR = exports.RETRY_AMOUNT = exports.WRITE_LOG = exports.ID_LIST = exports.DELAY = void 0;
const enum_1 = require("./types/enum");
const DELAY = 100;
exports.DELAY = DELAY;
const ID_LIST = [];
exports.ID_LIST = ID_LIST;
const GUILD_ID = "";
exports.GUILD_ID = GUILD_ID;
const LOG_DIR = "./log";
exports.LOG_DIR = LOG_DIR;
const DATA_DIR = "./data";
exports.DATA_DIR = DATA_DIR;
const RETRY_AMOUNT = 10;
exports.RETRY_AMOUNT = RETRY_AMOUNT;
const SPLIT_EVERY = 100000;
exports.SPLIT_EVERY = SPLIT_EVERY;
const WRITE_LOG = true;
exports.WRITE_LOG = WRITE_LOG;
const BEAUTIFY = false;
exports.BEAUTIFY = BEAUTIFY;
const EXCLUDE_PROPERTIES = [
    enum_1.MessageProperties.TYPE,
    enum_1.MessageProperties.TTS,
    enum_1.MessageProperties.ATTACHMENTS,
    enum_1.MessageProperties.EDITED_TIMESTAMP,
    enum_1.MessageProperties.MENTION_EVERYONE,
    enum_1.MessageProperties.EMBEDS,
    enum_1.MessageProperties.FLAGS,
    enum_1.MessageProperties.MENTION_ROLES,
    enum_1.MessageProperties.PINNED,
];
exports.EXCLUDE_PROPERTIES = EXCLUDE_PROPERTIES;
const DISPLAY_MSG = enum_1.DisplayMessageType.PARTIAL;
exports.DISPLAY_MSG = DISPLAY_MSG;
//# sourceMappingURL=config.js.map