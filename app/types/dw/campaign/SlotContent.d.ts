import Collection = require('../util/Collection');
import Map = require('../util/Map');
import MarkupText = require('../content/MarkupText');
import Content = require('../content/Content');

/**
 * Represents content for a slot.
 */
declare class SlotContent {
    private constructor();

    /**
     * The callout message for the slot.
     */
    readonly calloutMsg: MarkupText;

    /**
     * A collection of content based on the content type for the slot. The collection
     * will include one of the following types: Product, Content, Category, or MarkupText.
     */
    readonly content: Collection<Content>;

    /**
     * The custom attributes for the slot.
     */
    readonly custom: Map<string, any>;

    /**
     * The recommender name for slot.
     */
    readonly recommenderName: string;


}

export = SlotContent;
