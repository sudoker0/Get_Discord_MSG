"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExistingDataAction = exports.DisplayMessageType = exports.MessageProperties = void 0;
var MessageProperties;
(function (MessageProperties) {
    MessageProperties["ID"] = "id";
    MessageProperties["TYPE"] = "type";
    MessageProperties["CONTENT"] = "content";
    MessageProperties["CHANNEL_ID"] = "channel_id";
    MessageProperties["AUTHOR"] = "author";
    MessageProperties["ATTACHMENTS"] = "attachments";
    MessageProperties["EMBEDS"] = "embeds";
    MessageProperties["MENTIONS"] = "mentions";
    MessageProperties["MENTION_ROLES"] = "mention_roles";
    MessageProperties["PINNED"] = "pinned";
    MessageProperties["MENTION_EVERYONE"] = "mention_everyone";
    MessageProperties["TTS"] = "tts";
    MessageProperties["TIMESTAMP"] = "timestamp";
    MessageProperties["EDITED_TIMESTAMP"] = "edited_timestamp";
    MessageProperties["FLAGS"] = "flags";
    MessageProperties["COMPONENTS"] = "components";
    MessageProperties["MESSAGE_REFERENCE"] = "message_reference";
    MessageProperties["REFERENCED_MESSAGE"] = "referenced_message";
    MessageProperties["REACTIONS"] = "reactions";
})(MessageProperties = exports.MessageProperties || (exports.MessageProperties = {}));
var DisplayMessageType;
(function (DisplayMessageType) {
    DisplayMessageType[DisplayMessageType["NONE"] = 0] = "NONE";
    DisplayMessageType[DisplayMessageType["PARTIAL"] = 1] = "PARTIAL";
    DisplayMessageType[DisplayMessageType["FULL"] = 2] = "FULL";
})(DisplayMessageType = exports.DisplayMessageType || (exports.DisplayMessageType = {}));
var ExistingDataAction;
(function (ExistingDataAction) {
    ExistingDataAction[ExistingDataAction["NOTHING"] = 0] = "NOTHING";
    ExistingDataAction[ExistingDataAction["APPEND_NEW_DATA"] = 1] = "APPEND_NEW_DATA";
    ExistingDataAction[ExistingDataAction["OVERRIDE_DATA"] = 2] = "OVERRIDE_DATA";
})(ExistingDataAction = exports.ExistingDataAction || (exports.ExistingDataAction = {}));
//# sourceMappingURL=enum.js.map