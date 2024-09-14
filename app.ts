import { RssToJsonFeedService } from "./services/RssToJsonFeedService";

function main() {
    try {
        console.log('Iniciando script de monitoramento...');
        new RssToJsonFeedService();
    } catch (error) {
        console.error(error.message);
    }
}

export { main };

export default main;