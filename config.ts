import { DisplayMessageType, MessageProperties } from "./types/enum"

// ? The delay between requests.
const DELAY = 100

// ? The list of channel IDs to get the messages from.
const ID_LIST: string[] = [

]

// ? The directories to save the logs and the data relative to the root of the project.
const LOG_DIR = "./log"
const DATA_DIR = "./data"

// ? The amount of times to retry the request if it fails.
const RETRY_AMOUNT = 10

// ? The maximum amount of data to write to the JSON file
const SPLIT_EVERY = 100000

// ? Should the log be saved to a file?
const WRITE_LOG = true

// ? Should the JSON be pretty printed?
const BEAUTIFY = false

// ? Since Discord API returnes a lot of properties of a chat that can be unneeded, this list will be used to filter out the unneeded properties.
const EXCLUDE_PROPERTIES: MessageProperties[] = [
    MessageProperties.TYPE,
    MessageProperties.TTS,
    MessageProperties.ATTACHMENTS,
    MessageProperties.EDITED_TIMESTAMP,
    MessageProperties.MENTION_EVERYONE,
    MessageProperties.EMBEDS,
    MessageProperties.FLAGS,
    MessageProperties.MENTION_ROLES,
    MessageProperties.PINNED,
]

// ? Display the content of the message into stdout.
const DISPLAY_MSG: DisplayMessageType = DisplayMessageType.PARTIAL
export { DELAY, ID_LIST, WRITE_LOG, RETRY_AMOUNT, LOG_DIR, DATA_DIR, BEAUTIFY, EXCLUDE_PROPERTIES, DISPLAY_MSG, SPLIT_EVERY }