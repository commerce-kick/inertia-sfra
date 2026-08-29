"use strict";

var BaseData = require("../BaseData");

/**
 * One option of a form field the site's form definition declares — the
 * states of an address, the months of a card expiry.
 *
 * Base rendered these straight out of the field's `options` collection into a
 * <select>; typed here they are the same list, so a React select is built
 * from the merchant's definition rather than from a hard-coded array.
 */
var FormOptionData = BaseData.extend({
  schema: {
    /** @type {string} the option's ID in the form definition */
    id: { type: "string", default: "" },
    /** @type {string} what the shopper reads */
    label: { type: "string", default: "" },
    /** @type {string} what is submitted */
    value: { type: "string", default: "" },
    /** @type {boolean} whether this option is the field's current choice */
    selected: { type: "boolean", default: false },
  },
});

/**
 * Map an SFRA form option to a plain FormOptionData object.
 * @param {Object} option - an entry of a wrapped form field's `options`
 * @returns {Object} plain FormOptionData object
 */
FormOptionData.fromOption = function (option) {
  return FormOptionData.from({
    id: option.id,
    label: option.label,
    value: option.htmlValue == null ? option.value : option.htmlValue,
    selected: option.selected,
  });
};

module.exports = FormOptionData;
