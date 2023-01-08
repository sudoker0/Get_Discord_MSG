export enum MessageProperties {
    ID = "id",
    TYPE = "type",
    CONTENT = "content",
    CHANNEL_ID = "channel_id",
    AUTHOR = "author",
    ATTACHMENTS = "attachments",
    EMBEDS = "embeds",
    MENTIONS = "mentions",
    MENTION_ROLES = "mention_roles",
    PINNED = "pinned",
    MENTION_EVERYONE = "mention_everyone",
    TTS = "tts",
    TIMESTAMP = "timestamp",
    EDITED_TIMESTAMP = "edited_timestamp",
    FLAGS = "flags",
    COMPONENTS = "components",
    MESSAGE_REFERENCE = "message_reference",
    REFERENCED_MESSAGE = "referenced_message",
    REACTIONS = "reactions",
}

export enum DisplayMessageType {
    NONE = 0,
    PARTIAL = 1,
    FULL = 2,
}

export enum ExistingDataAction {
    NOTHING = 0,
    APPEND_NEW_DATA = 1,
    OVERRIDE_DATA = 2,
}
