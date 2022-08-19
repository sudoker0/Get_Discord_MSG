"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISPLAY_MSG = exports.EXCLUDE_PROPERTIES = exports.BEAUTIFY = exports.DATA_DIR = exports.LOG_DIR = exports.RETRY_AMOUNT = exports.SEPERATE_DATA = exports.WRITE_LOG = exports.ID_LIST = exports.DELAY = void 0;
const enum_1 = require("./types/enum");
const DELAY = 100;
exports.DELAY = DELAY;
const ID_LIST = [
    "1009790196490969180",
];
exports.ID_LIST = ID_LIST;
const LOG_DIR = "./log";
exports.LOG_DIR = LOG_DIR;
const DATA_DIR = "./data";
exports.DATA_DIR = DATA_DIR;
const RETRY_AMOUNT = 10;
exports.RETRY_AMOUNT = RETRY_AMOUNT;
const WRITE_LOG = true;
exports.WRITE_LOG = WRITE_LOG;
const SEPERATE_DATA = true;
exports.SEPERATE_DATA = SEPERATE_DATA;
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