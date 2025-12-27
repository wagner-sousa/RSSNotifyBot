import GoogleChatMessageHorizontalAlignment from "../emuns/GoogleChatMessageHorizontalAlignment";

interface GoogleChatMessageCardColumnItem {
    horizontalSizeStyle: "FILL_AVAILABLE_SPACE",
    horizontalAlignment: GoogleChatMessageHorizontalAlignment,
    widgets: GoogleChatMessageCardWidget[]
}

export default GoogleChatMessageCardColumnItem;