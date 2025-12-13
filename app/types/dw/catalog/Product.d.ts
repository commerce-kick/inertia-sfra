import ExtensibleObject = require('../object/ExtensibleObject')
import ProductActiveData = require('./ProductActiveData')
import Collection = require('../util/Collection')
import Category = require('./Category')
import CategoryAssignment = require('./CategoryAssignment')
import ProductLink = require('./ProductLink')
import ProductAttributeModel = require('./ProductAttributeModel')
import ProductAvailabilityModel = require('./ProductAvailabilityModel')
import MarkupText = require('../content/MarkupText')
import Quantity = require('../value/Quantity')
import ProductOptionModel = require('./ProductOptionModel')
import Recommendation = require('./Recommendation')
import ProductPriceModel = require('./ProductPriceModel')
import Variant = require('./Variant')
import VariationGroup =  require('./VariationGroup')
import ProductVariationModel = require('./ProductVariationModel')
import Catalog = require('./Catalog')
import ProductInventoryList = require('./ProductInventoryList')
import MediaFile = require('../content/MediaFile')
import List = require('../util/List')
import CustomAttributes = require('../object/CustomAttributes');
import type PageMetaTag =  require('../web/PageMetaTag')

declare global {
    module ICustomAttributes {
        interface Product extends CustomAttributes{
        }
    }
}

/**
 * Represents a product in Commerce Cloud Digital. Products are identified by a unique product ID, sometimes called the SKU. There are several different types of product:

* * _Simple product_
* * _Master products_: This type of product defines a template for a set of related products which differ only by a set of defined "variation attributes", such as size or color. Master products are not orderable themselves. The variation information for a master product is available through its ProductVariationModel.
* * _Variant_: Variants are the actual orderable products that are related to a master product. Each variant of a master product has a unique set of values for the defined variation attributes. Variants are said to be "mastered" by the corresponding master product.
* * _Option products_: Option products define additional options, such as a warranty, which can be purchased for a defined price at the time the product is purchased. The option information for an option product is available through its ProductOptionModel.
* * _Product-sets_: A product-set is a set of products which the merchant can sell as a collection in the storefront, for example an outfit of clothes. Product-sets are not orderable and therefore do not define prices. They exist only to group the products together in the storefront UI. Members of the set are called "product-set-products".
* * _Products bundles_: A collection of products which can be ordered as a single unit and therefore can define its own price and inventory record.

Product price and availability information are retrievable through getPriceModel() and getAvailabilityModel() respectively. Attribute information is retrievable through getAttributeModel(). Products may reference other products, either as recommendations or product links. This class provides the methods for retrieving these referenced products.

Products belong to a catalog (the "owning" catalog) and are assigned to categories in other catalogs. Products assigned to categories in the site catalog are typically orderable on the site.

Any API method which returns products will return an instance of a Variant for variant products. This subclass contains methods which are specific to this type of product.
 */
declare class Product extends ExtensibleObject<ICustomAttributes.Product> {
    /**
     * The active data for this product, for the current site.
     */
    activeData  :  ProductActiveData

    /**
     * All categories to which this product is assigned.
     */
    allCategories  :  Collection<Category>

    /**
     * All category assignments for this product in any catalog.
     */
    allCategoryAssignments: Collection<CategoryAssignment>

    /**
     * All incoming ProductLinks.
     */
    allIncomingProductLinks  :  Collection<ProductLink>

    /**
     * All product links for this product.
     */
    allProductLinks: Collection<ProductLink>

    /**
     * True if the product is assigned to at least one category of the site catalog, false otherwise.
     */
    assignedToSiteCatalog  :  boolean

    /**
     * The ProductAttributeModel that encapsulates this product's custom attribute model.
     */
    attributeModel  :  ProductAttributeModel

    /**
     * True if the product is available (orderable) at the current site or false if not.
     * @deprecated Use getAvailabilityModel().isInStock() instead
     */
    available  :  boolean

    /**
     * Returns the available flag of the product.
     * @deprecated Use getAvailabilityModel() instead.
     */
    availableFlag  :  boolean

    /**
     * The ProductAvailabilityModel that encapsulates the product's availability.
     */
    availabilityModel  :  ProductAvailabilityModel

    /**
     * The brand of the product, null is returned if no brand is set.
     */
    brand  :  string | null

    /**
     * Indicates if the product is a bundle.
     */
    bundle  :  boolean

    /**
     * Indicates if the product is included in a bundle.
     */
    bundled  :  boolean

    /**
     * The bundled products of this product. If the product is no bundle an empty collection is returned.
     */
    bundledProducts  :  Collection<Product>

    /**
     * The bundles in which this product is included. If the product is not included in a bundle an empty collection is returned.
     */
    bundles  :  Collection<Product>

    /**
     * All categories this product is assigned to within the current site catalog.
     */
    categories  :  Collection<Category>

    /**
     * Returns true if the product is assigned to at least one category, false otherwise.
     */
    categorized  :  boolean

    /**
     * The category assignments of this product within the current site catalog.
     */
    categoryAssignments  :  Collection<CategoryAssignment>

    /**
     * The classification category of the product, null is returned if no classification category is set.
     */
    classificationCategory  :  Category | null

    /**
     * The European Article Number (EAN) of the product, null is returned if no EAN is set.
     */
    EAN  :  string | null

    /**
     * Returns true if the product is enabled for facebook, false otherwise.
     */
    facebookEnabled  :  boolean

    /**
     * The id of the product.
     */
    ID  :  string

    /**
     * The image of the product for the image type 'large', null is returned if no image is available.
     * @deprecated Use getImages(String) and getImage(String, Number) instead
     */
    image  :  MediaFile | null

    /**
     * The product links that reference this product.
     */
    incomingProductLinks  :  Collection<ProductLink>

    /**
     * The localized long description of the product, null is returned if no description is available.
     */
    longDescription  :  MarkupText | null

    /**
     * The manufacturer name of the product, null is returned if no manufacturer name is set.
     */
    manufacturerName  :  string | null

    /**
     * The manufacturer stock keeping unit (SKU) of the product, null is returned if no manufacturer SKU is set.
     */
    manufacturerSKU  :  string | null

    /**
     * Indicates if the product is a master product.
     */
    master  :  boolean

    /**
     * The minimum order quantity for this product.
     */
    minOrderQuantity  :  Quantity

    /**
     * The localized display name of the product, null is returned if no name is available.
     */
    name  :  string | null

    /**
     * Returns the online status of the product.
     */
    online  :  boolean

    /**
     * All online categories this product is assigned to within the current site catalog.
     */
    onlineCategories  :  Collection<Category>

    /**
     * The online flag of the product.
     */
    onlineFlag  :  boolean

    /**
     * The date from which the product is online, null is returned if no online-from date is set.
     */
    onlineFrom  :  Date | null

    /**
     * The date until which the product is online, null is returned if no online-to date is set.
     */
    onlineTo  :  Date | null

    /**
     * The ProductOptionModel that encapsulates the product option information.
     */
    optionModel  :  ProductOptionModel

    /**
     * Indicates if the product is an option product.
     */
    optionProduct  :  boolean

    /**
     * The orderable recommendations for this product for the current site.
     */
    orderableRecommendations  :  Collection<Recommendation>

    /**
     * The localized page description for this product to be used for SEO, null is returned if no page description is available.
     */
    pageDescription  :  string | null

    /**
     * The localized page keywords for this product to be used for SEO, null is returned if no page keywords are available.
     */
    pageKeywords  :  string | null

    /**
     * The localized page meta tags for this product to be used for SEO.
     */
    pageMetaTags  :  Array<PageMetaTag>

    /**
     * The localized page title for this product to be used for SEO, null is returned if no page title is available.
     */
    pageTitle  :  string | null

    /**
     * The localized page URL for this product to be used for SEO, null is returned if no page URL is available.
     */
    pageURL  :  string | null

    /**
     * Returns true if the product is enabled for pinterest, false otherwise.
     */
    pinterestEnabled  :  boolean

    /**
     * The ProductPriceModel that encapsulates the product's price information.
     */
    priceModel  :  ProductPriceModel

    /**
     * The primary category of this product within the current site catalog.
     */
    primaryCategory  :  Category | null

    /**
     * The primary category assignment of this product within the current site catalog.
     */
    primaryCategoryAssignment  :  CategoryAssignment | null

    /**
     * Indicates if the product is a standard product.
     */
    product  :  boolean

    /**
     * The product links for this product within the current site catalog.
     */
    productLinks  :  Collection<ProductLink>

    /**
     * Indicates if the product is a product set.
     */
    productSet  :  boolean

    /**
     * Indicates if the product is included in at least one product set.
     */
    productSetProduct  :  boolean

    /**
     * The products included in this product set. If the product is not a product set an empty collection is returned.
     */
    productSetProducts  :  Collection<Product>

    /**
     * The product sets in which this product is included. If the product is not included in a product set an empty collection is returned.
     */
    productSets  :  Collection<Product>

    /**
     * The recommendations for this product for the current site.
     */
    recommendations  :  Collection<Recommendation>

    /**
     * Indicates if the product is a product set.
     * @deprecated Use isProductSet() instead
     */
    retailSet  :  boolean

    /**
     * The searchable status of the product.
     */
    searchable  :  boolean

    /**
     * The searchable flag of the product.
     */
    searchableFlag  :  boolean

    /**
     * The searchable if unavailable flag of the product, null is returned if not set.
     */
    searchableIfUnavailableFlag  :  boolean | null

    /**
     * The search placement of the product.
     */
    searchPlacement  :  number

    /**
     * The search rank of the product.
     */
    searchRank  :  number

    /**
     * The localized short description of the product, null is returned if no description is available.
     */
    shortDescription  :  MarkupText | null

    /**
     * The change frequency for this product in the sitemap.
     */
    siteMapChangeFrequency  :  string

    /**
     * Returns 0 if the product is not included in the sitemap, 1 if the product is included in the sitemap.
     */
    siteMapIncluded  :  number

    /**
     * The priority for this product in the sitemap.
     */
    siteMapPriority  :  number

    /**
     * Indicates if the product is assigned to at least one category of the site catalog.
     * @deprecated Use isAssignedToSiteCatalog() instead
     */
    siteProduct  :  boolean

    /**
     * The step quantity for this product, i.e. the quantity a customer must buy.
     */
    stepQuantity  :  Quantity

    /**
     * The store receipt name of the product, null is returned if no receipt name is set.
     */
    storeReceiptName  :  string | null

    /**
     * The store tax class of the product, null is returned if no tax class is set.
     */
    storeTaxClass  :  string | null

    /**
     * The tax class id of the product, null is returned if no tax class is set.
     */
    taxClassID  :  string | null

    /**
     * The template of the product, null is returned if no template is set.
     */
    template  :  string | null

    /**
     * The image of the product for the image type 'small', null is returned if no image is available.
     * @deprecated Use getImages(String) and getImage(String, Number) instead
     */
    thumbnail  :  MediaFile | null

    /**
     * The unit in which the product is measured, such as each, ounces, etc.
     */
    unit  :  string

    /**
     * The unit quantity for this product, i.e. the number of units per product.
     */
    unitQuantity  :  Quantity

    /**
     * The Universal Product Code (UPC) of the product, null is returned if no UPC is set.
     */
    UPC  :  string | null

    /**
     * Indicates if the product is a variant product.
     */
    variant  :  boolean

    /**
     * The variants of this master product. If the product is no master an empty collection is returned.
     */
    variants  :  Collection<Variant>

    /**
     * Indicates if the product is a variation group.
     */
    variationGroup  :  boolean

    /**
     * The variation groups of this master product. If the product is no master an empty collection is returned.
     */
    variationGroups  :  Collection<VariationGroup>

    /**
     * The ProductVariationModel that encapsulates this product's product variations.
     */
    variationModel  :  ProductVariationModel


}

export = Product
