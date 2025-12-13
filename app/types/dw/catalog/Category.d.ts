import ExtensibleObject = require('../object/ExtensibleObject');
import Collection = require('../util/Collection');
import Recommendation = require('./Recommendation');
import CategoryAssignment = require('./CategoryAssignment');
import SortingRule = require('./SortingRule');
import MediaFile = require('../content/MediaFile');
import CategoryLink = require('./CategoryLink');
import Product = require('./Product');
import ProductAttributeModel = require('./ProductAttributeModel');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface Category extends CustomAttributes{
        }
    }
}

declare class Category extends ExtensibleObject<ICustomAttributes.Category> {
    /**
     * Constant representing the Variation Group Display Mode individual setting.
     */
    static readonly DISPLAY_MODE_INDIVIDUAL: 0;

    /**
     * Constant representing the Variation Group Display Mode merged setting.
     */
    static readonly DISPLAY_MODE_MERGED: 1;

    /**
     * All outgoing recommendations for this category. The recommendations are sorted by their explicitly set order.
     */
    readonly allRecommendations: Collection<Recommendation>;

    /**
     * A collection of category assignments of the category.
     */
    readonly categoryAssignments: Collection<CategoryAssignment>;

    /**
     * The default sorting rule configured for this category, or null if there is no default rule to be applied for it.
     * This method returns the default rule for the parent category if this category inherits one.
     */
    readonly defaultSortingRule: SortingRule;

    /**
     * The description of the catalog category for the current locale.
     */
    readonly description: string;

    /**
     * The Variation Groups Display Mode of the category or null if no display mode is defined.
     */
    displayMode: number;

    /**
     * The display name of the catalog category for the current locale.
     * This value is intended to be used as the external visible name of the catalog category.
     */
    readonly displayName: string;

    /**
     * The id of the category.
     */
    readonly ID: string;

    /**
     * The image reference of this catalog category.
     */
    readonly image: MediaFile;

    /**
     * The collection of CategoryLink objects for which this category is the target.
     * If the source category of a link belongs to a different catalog than the catalog owning this category, it is not returned.
     */
    readonly incomingCategoryLinks: Collection<CategoryLink>;

    /**
     * The value indicating whether the catalog category is "currently online".
     * A category is currently online if its online flag equals true and the current site date
     * is within the date range defined by the onlineFrom and onlineTo attributes.
     */
    readonly online: boolean;

    /**
     * A collection of category assignments of the category where the referenced product is currently online.
     * When checking the online status of the product, the online flag and the online from & to dates are taken into account.
     */
    readonly onlineCategoryAssignments: Collection<CategoryAssignment>;

    /**
     * The online status flag of the category.
     */
    readonly onlineFlag: boolean;

    /**
     * The date from which the category is online or valid.
     */
    readonly onlineFrom: Date;

    /**
     * The collection of CategoryLink objects for which this category is the target and the source category is currently online.
     */
    readonly onlineIncomingCategoryLinks: Collection<CategoryLink>;

    /**
     * The collection of CategoryLink objects for which this category is the source and the target category is currently online.
     */
    readonly onlineOutgoingCategoryLinks: Collection<CategoryLink>;

    /**
     * Returns online products assigned to this category. Offline products are not included in the returned collection.
     * The order of products in the returned collection corresponds to the defined explicit sorting of products in this category.
     */
    readonly onlineProducts: Collection<Product>;

    /**
     * A sorted collection of currently online subcategories of this catalog category.
     * The returned collection is sorted by position and contains direct subcategories only.
     */
    readonly onlineSubCategories: Collection<Category>;

    /**
     * The date until which the category is online or valid.
     */
    readonly onlineTo: Date;

    /**
     * A list of outgoing recommendations for this category that additionally filters out recommendations
     * for which the target product is unorderable according to its product availability model.
     */
    readonly orderableRecommendations: Collection<Recommendation>;

    /**
     * The collection of CategoryLink objects for which this category is the source.
     * The collection of links is sorted by the explicitly defined order for this category with unsorted links appearing at the end.
     */
    readonly outgoingCategoryLinks: Collection<CategoryLink>;

    /**
     * The page description of this category for the default locale or null if not defined.
     */
    readonly pageDescription: string;

    /**
     * The page keywords of this category for the default locale or null if not defined.
     */
    readonly pageKeywords: string;

    /**
     * The page title of this category for the default locale or null if not defined.
     */
    readonly pageTitle: string;

    /**
     * The page URL property of this category or null if not defined.
     */
    readonly pageURL: string;

    /**
     * The parent of this category.
     */
    readonly parent: Category;

    /**
     * Returns this category's ProductAttributeModel, which makes access to the category's attribute information convenient.
     * The model is calculated based on the attribute definitions assigned to this category and the global attribute definitions for the object type 'Product'.
     */
    readonly productAttributeModel: ProductAttributeModel;

    /**
     * All products assigned to this category. The order of products in the returned collection
     * corresponds to the defined explicit sorting of products in this category.
     */
    readonly products: Collection<Product>;

    /**
     * The outgoing recommendations for this category. Only recommendations for which the target product exists
     * and is assigned to the site catalog are returned. The recommendations are sorted by their explicitly set order.
     */
    readonly recommendations: Collection<Recommendation>;

    /**
     * Identifies if the category is the root category of its catalog.
     */
    readonly root: boolean;

    /**
     * The search placement of the category or null if no search placement is defined.
     */
    searchPlacement: number;

    /**
     * The search rank of the category or null if no search rank is defined.
     */
    searchRank: number;

    /**
     * The category's sitemap change frequency.
     */
    readonly siteMapChangeFrequency: string;

    /**
     * The category's sitemap inclusion.
     */
    readonly siteMapIncluded: number;

    /**
     * The category's sitemap priority.
     */
    readonly siteMapPriority: number;
    /**
     * A sorted collection of the subcategories of this catalog category, including both online and offline subcategories.
     * The returned collection is sorted by position and contains direct subcategories only.
     */
    readonly subCategories: Collection<Category>;

    /**
     * The template property value, which is the file name of the template used to display the catalog category.
     */
    readonly template: string;

    /**
     * The thumbnail image reference of this catalog category.
     */
    readonly thumbnail: MediaFile;

    /**
     * Returns true if the category is a top level category, but not the root category.
     */
    readonly topLevel: boolean;


}

export =  Category;
