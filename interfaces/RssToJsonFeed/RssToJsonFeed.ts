interface RssToJsonFeed {
    status: string,
    feed: {
        title: string,
        description: string,
        image: string
    },
    items: Array<RssToJsonFeedItem>
}