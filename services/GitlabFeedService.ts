import { GitlabTagBuilder } from "../builder/GitlabTagBuilder";
import { XmlManager } from "../util/XmlManager";

export class GitlabFeedService {
    private document: GoogleAppsScript.XML_Service.Document;
    private projectId: string;
    private static GITLAB_FEED_URL: string = "https://gitlab.com/api/v4/projects/{projectId}/repository/tags";

    constructor(projectId: string, type: "xml" | "json") {

        this.projectId = projectId;

        console.log('Visitando Feed de Tags do Gitlab: ' + this.getFeedUrl());

        //let response: GoogleAppsScript.URL_Fetch.HTTPResponse = this.getFeed("https://gitlab.com/gitlab-org/gitlab-foss/-/tags?format=atom");
        let response: GoogleAppsScript.URL_Fetch.HTTPResponse = this.getFeed("");        

        var responseText = response.getContentText();
        console.log(responseText);
        var responseObject = JSON.parse(responseText);
        console.log(responseObject[0]);
        console.info("Feed obtido com sucesso!");

        let xml = response.getContentText();

        //TODO console.info("XML obtido com sucesso!\n" + xml);

        this.document = XmlService.parse(xml);
    }


    private getFeed(url: string): GoogleAppsScript.URL_Fetch.HTTPResponse {
        try {
            return UrlFetchApp.fetch(url, {
                "headers": {
                    "Content-Type": "application/json",
                    "PRIVATE-TOKEN": "glpat-zNbNBJzMbJujQhYczEZx"
                }
            });
        } catch (error) {
            throw new Error("Erro ao obter feed! \n" + error);
        }
    }

    public getXmlDocument(): GoogleAppsScript.XML_Service.Document {
        return this.document;
    }

    public getXmlFeed(): GoogleAppsScript.XML_Service.Element {
        return this.getXmlDocument().getRootElement();
    }

    public getXmlTags(): GoogleAppsScript.XML_Service.Element[] {
        return XmlManager.getChildren(this.getXmlFeed(), 'entry');
    }

    public getLastXmlTag(): GoogleAppsScript.XML_Service.Element {
        return XmlManager.getChild(this.getXmlFeed(), 'entry');
    }

    public getLastTag(): GitlabTag {
        return new GitlabTagBuilder(this.getLastXmlTag());
    }

    public hasTags(): boolean {
        return this.getLastXmlTag() !== null;
    }

    private getFeedUrl(): string {
        return GitlabFeedService.GITLAB_FEED_URL.replace("{projectId}", this.projectId);
    }
}

