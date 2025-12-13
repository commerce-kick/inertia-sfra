import ObjectTypeDefinition = require('./ObjectTypeDefinition');
import SeekableIterator = require('../util/SeekableIterator');
import Profile = require('../customer/Profile');
import Store = require('../catalog/Store');
import SourceCodeGroup = require('../campaign/SourceCodeGroup');
import Order = require('../order/Order');
import ProductList = require('../customer/ProductList');
import GiftCertificate = require('../order/GiftCertificate');
import Map = require('../util/Map');

// todo - implement

/**
 * Manager class which provides methods for querying for system objects with meta data using the Commerce Cloud Digital query language. See individual API methods for details on the query language.

Note: Other manager classes such as CustomerMgr, ProductMgr, etc provide more specific and fine-grained querying methods that can not be achieved using the general query language.

To search for custom objects, use CustomObjectMgr. Note: this class allows access to sensitive information through operations that retrieve the Profile and Order objects. Pay attention to appropriate legal and regulatory requirements related to this data.
 */
declare class SystemObjectMgr {


}
export = SystemObjectMgr;
