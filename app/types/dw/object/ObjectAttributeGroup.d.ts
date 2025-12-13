import Collection = require('../util/Collection');
import ObjectAttributeDefinition = require('./ObjectAttributeDefinition');
import ObjectTypeDefinition = require('./ObjectTypeDefinition');

declare class ObjectAttributeGroup {
    attributeDefinitions: Collection<ObjectAttributeDefinition>;
    description: string;
    displayName: string;
    ID: string;
    objectTypeDefinition: ObjectTypeDefinition;
    system: Boolean;

}

export = ObjectAttributeGroup;
