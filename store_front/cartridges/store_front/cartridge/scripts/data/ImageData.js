"use strict";

var BaseData = require("../BaseData");

var ImageData = BaseData.extend({
  schema: {
    title: { type: "string" },
    url: { type: "string" },
    alt: { type: "string" },
    absURL: { type: "string" },
  },
});

module.exports = ImageData;
