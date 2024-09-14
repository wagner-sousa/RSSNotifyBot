import { PropertyManager } from "../util/PropertyManager";

export class GoogleChatService {

    public static sendMessage(message: GoogleChatMessageCard) {
        console.log(JSON.stringify({ cards: [ message ]}));
        
        var options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
            method : "post",
            contentType: "application/json",
            payload : JSON.stringify({ cards: [ message ]})
        };

        let webhooks = PropertyManager.getProperty("GOOGLE_CHAT_WEBHOOKS", "").split(";");

        webhooks.forEach(webhook => {         
            console.log('Enviando mensagem...');     
            UrlFetchApp.fetch(webhook.trim(), options);
            console.log('Mensagem enviada com sucesso!');
        })
    }
}