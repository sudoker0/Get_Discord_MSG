declare global {

    type User = {
        id: string;
        username: string;
        avatar: string;
        avatar_decoration: null;
        discriminator: string;
        public_flags: number;
    }

    type Reaction = {
        emoji: {
            id: string | null;
            name: string;
        };
        count: number;
        me: boolean;
    }

    type Attachment = {
        id: string;
        filename: string;
        size: number;
        url: string;
        proxy_url: string;
        height: number;
        width: number;
        content_type: string;
    }

    type Message = {
        id: string;
        type: number;
        content: string;
        channel_id: string;
        author: User;
        attachments: Attachment[];
        embeds: any[];
        mentions: User[] | [];
        mention_roles: string[];
        pinned: boolean;
        mention_everyone: boolean;
        tts: boolean;
        timestamp: string;
        edited_timestamp: string | null;
        flags: number;
        components: any[];
        message_reference: {
            channel_id: string;
            guild_id: string;
            message_id: string;
        } | null;
        referenced_message: Message;
        reactions: Reaction[] | null;
    }

    type Chat = {
        [key in string]: Message[];
    }

}

export {}