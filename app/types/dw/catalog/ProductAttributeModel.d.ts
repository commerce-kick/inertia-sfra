import Collection = require('../util/Collection');
import ObjectAttributeGroup = require('../object/ObjectAttributeGroup');
import ObjectAttributeDefinition = require('../object/ObjectAttributeDefinition');

declare class ProductAttributeModel {
    attributeGroups  :  Collection<ObjectAttributeGroup>;
    orderRequiredAttributeDefinitions  :  Collection<ObjectAttributeGroup>;
    visibleAttributeGroups  :  Collection<ObjectAttributeGroup>;

}

export = ProductAttributeModel;
