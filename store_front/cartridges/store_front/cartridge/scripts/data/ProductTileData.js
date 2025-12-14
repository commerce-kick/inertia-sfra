"use strict";

var BaseData = require("../BaseData");
var ImageGroupData = require("./ImageGroupData");

var ProductTileData = BaseData.extend({
  schema: {
    id: { type: "string" },
    productName: { type: "string" },
    images: {
      type: "data",
      of: ImageGroupData,
    },
  },
});

module.exports = ProductTileData;
