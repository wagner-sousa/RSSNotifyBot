export class XmlManager {
    public static ATOM = XmlService.getNamespace('http://www.w3.org/2005/Atom');

    public static getChild(element: GoogleAppsScript.XML_Service.Element, name: string): GoogleAppsScript.XML_Service.Element {
        return element.getChild(name, XmlManager.ATOM);
    }

    public static getChildren(element: GoogleAppsScript.XML_Service.Element, name: string): GoogleAppsScript.XML_Service.Element[] {
        return element.getChildren(name, XmlManager.ATOM);
    }
}