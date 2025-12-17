"use strict";

var BaseData = require("../BaseData");
var ImageGroupData = require("./ImageGroupData");

var ProductData = BaseData.extend({
  schema: {
    id: { type: "string" },
    productName: { type: "string" },
    images: {
      type: "data",
      of: ImageGroupData,
    },
    price: {
      type: 'object'
    }
  },
});

module.exports = ProductData;
