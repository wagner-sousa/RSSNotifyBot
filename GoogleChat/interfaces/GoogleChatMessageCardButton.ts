interface GoogleChatMessageCardButton {
    text?: string,
    icon?: GoogleChatMessageCardMaterialIcon,
    textButton?: GoogleChatMessageCardButton,
    onClick?: {
        openLink: {
            url: string
        }
    }
}