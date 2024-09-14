import { UrlService } from "../services/UrlService";

export class JsonManager {
    public static mountJson(text: string): any {
        return JSON.parse(text);
    }   
}