"use strict";

var BaseData = require("../BaseData");
var ImageData = require("./ImageData");

var ImageGroupData = BaseData.extend({
  schema: {
    small: { type: "collection", of: ImageData, default: [] },
    large: { type: "collection", of: ImageData, default: [] },
  },
});

module.exports = ImageGroupData;
