import Variant = require('./Variant')
import Product = require('./Product')
import Collection = require('../util/Collection')
import VariationGroup = require('./VariationGroup')
import ProductVariationAttribute = require('./ProductVariationAttribute')
import ProductVariationAttributeValue = require('./ProductVariationAttributeValue')
import MediaFile = require('../content/MediaFile')
import List = require('../util/List')
import HashMap = require('../util/HashMap')
import URL = require('../web/URL')

/**
 * Manages product variation information for master products, including attributes,
 * values, variants, and customer selections. Only considers online, complete variants.
 */
declare class ProductVariationModel {


