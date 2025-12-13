import Collection = require('../util/Collection');
import ObjectAttributeDefinition = require('./ObjectAttributeDefinition');
import ObjectAttributeGroup = require('./ObjectAttributeGroup');

declare class ObjectTypeDefinition {
    attributeDefinitions: Collection<ObjectAttributeDefinition>
    displayName: string;
    ID: string;
    Syetem: boolean;

}


export = ObjectTypeDefinition;
