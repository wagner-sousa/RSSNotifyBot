import { JsonManager } from "../util/JsonManager";
import { PropertyManager } from "../util/PropertyManager";
import { GoogleChatService } from "./GoogleChatService";
import { UrlService } from "./UrlService";

export class RssToJsonFeedService {
    private service = "https://api.rss2json.com/v1/api.json?rss_url=";

    constructor() {
        let feeds = PropertyManager.getProperty("RSS_URL", ";").split(";").filter(feed => feed.trim().length > 0);
        console.log("Feeds configurados: " + feeds.length);

        feeds.forEach(feed => {
            console.log('Visitando Feed ' + feed);

            let response: string = UrlService.getResponseText(this.mountFeedUrl(feed));        
            let data: RssToJsonFeed = JsonManager.mountJson(response);

            let message: GoogleChatMessageCard = {
                header: this.mountFeedHeader(data),
                sections: []
            };

            let last_item_timestamp = new Date(Date.parse(PropertyManager.getProperty(feed, data.items[data.items.length -1].pubDate)));
            console.log('Último item: ' + last_item_timestamp.toLocaleString('pt-BR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }));

            let last_item = data.items.find(item => new Date(Date.parse(item.pubDate)) > last_item_timestamp);
            if(last_item !== undefined)
            {
                message.sections = this.mountFeedItem(last_item);
                GoogleChatService.sendMessage(message);
                PropertyManager.setProperty(feed, last_item.pubDate);
            }
            else
            {
                console.warn('Nenhum item para ser enviado');
            }

            console.log('Feed finalizado');
        });
    }

    private mountFeedUrl(rss_url: string): string {
        return this.service.concat(rss_url);
    }

    private mountFeedHeader(data: RssToJsonFeed): GoogleChatMessageCardHeader {
        return {
            title: data.feed.title,
            subtitle: data.feed.description,
            imageUrl: data.feed.image,
            //imageType: "SQUARE"
        }
    }

    private mountFeedItem(item: RssToJsonFeedItem): Array<GoogleChatMessageCardSection> {
        return [{
            header: item.title,
            widgets: this.mountFeedItemBody(item)
        }]
    }

    private mountFeedItemBody(item: RssToJsonFeedItem): Array<GoogleChatMessageCardWidget> {
        return [
            { image: this.mountFeedItemImage(item.thumbnail, item.title) },
            { textParagraph: this.mountFeedItemParagraph(item.description, 2) },
            //{ divider: {} },
            //{ columns: { columnItems: this.mountFeedItemColumns(item) } },
            //{ divider: {} },
            //{ buttonList: { buttons: this.mountFeedItemButtons(item) } }
            { buttons: this.mountFeedItemButtons(item) }
            /*{
                    buttons: [{
                        "textButton": {
                        "text": "Veja mais detalhes da liberação",
                        "onClick": {
                            "openLink": {
                            "url": item.link
                            }
                        }
                        }
                    }]
            }*/
        ];
    }

    private mountFeedItemImage(thumbnail: string, altText?: string): GoogleChatMessageCardImage {
        return {
            imageUrl: thumbnail,
            altText: altText
        }
    }

    private mountFeedItemParagraph(text: string, maxLines?: number): GoogleChatMessageCardTextParagraph {
        return { 
            text: text, 
            //maxLines: maxLines
        };
    }

    private mountFeedItemColumns(item: RssToJsonFeedItem): Array<GoogleChatMessageCardColumnItem> {
        let post_date = new Date(item.pubDate);
        return [
            { 
                horizontalSizeStyle: "FILL_AVAILABLE_SPACE",
                horizontalAlignment: "START",
                widgets: [
                    { textParagraph: { text: post_date.toLocaleDateString('pt-BR') } }
                ]
            },
            { 
                horizontalSizeStyle: "FILL_AVAILABLE_SPACE",
                horizontalAlignment: "END",
                widgets: [
                    { textParagraph: { text: '<i>by '.concat(item.author, '</i>') } }
                ]
            }
        ];
    }

    private mountFeedItemButtons(item: RssToJsonFeedItem): Array<GoogleChatMessageCardButton> {
        return [
            {
                textButton: {
                    text: "Veja mais detalhes da liberação",
                    onClick: {
                        openLink: {
                            url: item.link
                        }
                    }
                },
                /*icon: {
                    materialIcon: {
                        name: "globe"
                    },
                    altText: "check calendar"
                },*/
                /*
                onClick: {
                    openLink: {
                        url: item.link
                    }
                }
                */
            }
        ];
    }
}

