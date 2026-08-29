"use strict";

/**
 * The fields every basket line item shares, whatever kind it is: the one
 * image the line-item model carries, the variation values it was ordered
 * with, and its selected product options.
 *
 * Shared by CartLineItemData and CartBonusLineItemData — base repeated the
 * same three loops across cartProductCard.isml and
 * cartNestedBonusProductCard.isml.
 */

/**
 * The line item's single image. The productLineItem model asks the images
 * decorator for one 'small' image, so there is exactly one to find — but a
 * product whose category is unassigned arrives with base's no-image
 * placeholder in the same slot, which is still a usable image.
 * @param {Object} images - the line item model's images bag
 * @returns {{url: string, alt: string} | null} the image, or null
 */
function toImage(images) {
  var group = images && (images.small || images.medium || images.large);
  if (!group || !group.length || !group[0].url) return null;
  return { url: group[0].url.toString(), alt: group[0].alt || "" };
}

/**
 * The variation values the line item was ordered with — "Color: Black".
 * The model decorates with `attributes: 'selected'`, so every entry already
 * names one chosen value.
 * @param {Array} attributes - the line item model's variationAttributes
 * @returns {Array<{displayName: string, displayValue: string}>} ordered values
 */
function toVariationAttributes(attributes) {
  if (!attributes || !attributes.length) return [];
  return attributes.map(function (attribute) {
    return {
      displayName: attribute.displayName || "",
      displayValue: attribute.displayValue || "",
    };
  });
}

/**
 * The product options chosen for this line item.
 * @param {Array} options - the line item model's options
 * @returns {Array<{optionId: string, selectedValueId: string, displayName: string}>} chosen options
 */
function toOptions(options) {
  if (!options || !options.length) return [];
  return options.filter(Boolean).map(function (option) {
    return {
      optionId: option.optionId || "",
      selectedValueId: option.selectedValueId || "",
      displayName: option.displayName || "",
    };
  });
}

module.exports = {
  toImage: toImage,
  toVariationAttributes: toVariationAttributes,
  toOptions: toOptions,
};
