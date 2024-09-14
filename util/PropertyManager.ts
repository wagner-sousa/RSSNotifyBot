export class PropertyManager {
    private static properties = PropertiesService.getScriptProperties();

    public static getProperty(propertyName: string, defaultValue: string = ''): string {
        console.log('Obtendo dados da propriedade: ' + propertyName);
        
        let property = this.properties.getProperty(propertyName);
        
        console.log('Valor da propriedade: ' + property);

        if (!property && defaultValue?.trim().length == 0) { 
            throw new Error('Propriedade ' + propertyName + ' não definida!');
        }
        else if (!property) {
            console.warn('Propriedade ' + propertyName + ' não encontrada. Usando: ' + defaultValue);
            property = defaultValue;
        }

        return property;
    }

    public static setProperty(propertyName: string, propertyValue: string): void {
        this.properties.setProperty(propertyName, propertyValue);
    }

    public static replaceProperty(propertyName: string, replace?: string, replaceValue?: string): string {
        let property = PropertyManager.getProperty(propertyName);

        let Raplacedproperty = property.replace(new RegExp(replace, 'g'), replaceValue);

        return Raplacedproperty;
    }
}