"use strict";

/**
 * LazyProp Class
 * @param {Function} callback
 */
function LazyProp(callback) {
  this.callback = callback;
}
LazyProp.prototype.isLazy = true;

/**
 * AlwaysProp Class
 * @param {Object} value
 */
function AlwaysProp(value) {
  this.value = value;
}
AlwaysProp.prototype.isAlways = true;

/**
 * DeferProp Class
 * @param {Function} callback
 * @param {String} group
 */
function DeferProp(callback, group) {
  this.callback = callback;
  this.group = group || "default";
  this.shouldMerge = false;
  this.shouldDeepMerge = false;
  this.shouldAppend = true;
  this.shouldPrepend = false;
}
DeferProp.prototype.isDefer = true;

DeferProp.prototype.merge = function () {
  this.shouldMerge = true;
  return this;
};

DeferProp.prototype.deep = function () {
  this.shouldMerge = true;
  this.shouldDeepMerge = true;
  return this;
};

DeferProp.prototype.prepend = function () {
  this.shouldMerge = true;
  this.shouldAppend = false;
  this.shouldPrepend = true;
  return this;
};

/**
 * MergeProp Class
 * @param {Object} value
 */
function MergeProp(value) {
  this.value = value;
  this.shouldMerge = true;
  this.shouldDeepMerge = false;
  this.shouldAppend = true; // default
  this.shouldPrepend = false;
}
MergeProp.prototype.isMerge = true;

MergeProp.prototype.deep = function () {
  this.shouldDeepMerge = true;
  return this;
};

MergeProp.prototype.prepend = function () {
  this.shouldAppend = false;
  this.shouldPrepend = true;
  return this;
};

/**
 * OptionalProp Class
 * @param {Function} callback
 */
function OptionalProp(callback) {
  this.callback = callback;
}

OptionalProp.prototype.isOptional = true;

/**
 * ScrollProp Class (for infinite scroll)
 * @param {Function|Object} value
 */
function ScrollProp(value) {
  this.value = value;
  this.isScroll = true;
  this.merge = true;
}

module.exports = {
  LazyProp: LazyProp,
  AlwaysProp: AlwaysProp,
  DeferProp: DeferProp,
  MergeProp: MergeProp,
  OptionalProp: OptionalProp,
  ScrollProp: ScrollProp,
};
