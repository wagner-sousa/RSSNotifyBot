export class UrlService {
    public static getResponse(url: string): GoogleAppsScript.URL_Fetch.HTTPResponse {
        try {
            return UrlFetchApp.fetch(url);
        } catch (error) {
            throw new Error("Erro ao obter feed! \n" + error);
        }
    }

    public static getResponseText(url: string): string {
        return UrlService.getResponse(url).getContentText();
    }
}