"use strict";

/**
 * @namespace Home
 *
 * Feature showcase for the Inertia SFRA adapter (v3.3.0 parity).
 * Demonstrates: closure props, dot-notation props, shared props, optional,
 * defer (groups + rescue), merge/matchOn, prepend, once, flash, validation
 * error bags, session-backed clearHistory, and partial reloads/polling.
 */

const server = require("server");
server.extend(module.superModule);

var initInertia = require("*/cartridge/scripts/middleware/initInertia");
var shareData = require("*/cartridge/scripts/middleware/shareData");

var QUOTES = [
  "Build things that don't break the back button.",
  "The network is the enemy; ship less of it.",
  "Every prop you defer is a millisecond you gift the first paint.",
  "Cache invalidation, naming things, and asset versioning.",
];

server.replace("Show", initInertia.init, shareData, function (req, res, next) {
  var inertia = res.inertia;
  var now = Date.now();

  inertia.render("Home/Show", {
    // Plain closure prop — resolved on every render.
    serverNow: function () {
      return new Date().toISOString();
    },

    // Nested object + dot-notation prop merged into it (unpackDotProps).
    settings: { theme: "light" },
    "settings.flags.beta": function () {
      return true;
    },

    // OPTIONAL — omitted on first load; arrives only via
    // router.reload({ only: ['quote'] }).
    quote: inertia.optional(function () {
      return QUOTES[Math.floor(Math.random() * QUOTES.length)];
    }),

    // DEFERRED (grouped) — both resolve in ONE follow-up request for the
    // "sidebar" group after first paint.
    notifications: inertia.defer(function () {
      return [
        { id: 1, text: "Deferred prop loaded after first paint" },
        { id: 2, text: "Grouped with 'tip' in one request" },
      ];
    }, "sidebar"),
    tip: inertia.defer(function () {
      return "Props in the same defer group share a single XHR.";
    }, "sidebar"),

    // DEFERRED + RESCUE — the resolver throws, the response survives, and
    // the page reports it under rescuedProps instead of a 500.
    flaky: inertia.defer(
      function () {
        throw new Error("This prop always fails — rescued, not fatal");
      },
      "default",
      true
    ),

    // MERGE + matchOn — each partial reload appends new items client-side,
    // upserting by id. Reset with router.reload({ reset: ['feed'] }).
    feed: inertia
      .merge(function () {
        var batch = [];
        for (var i = 0; i < 3; i++) {
          var id = (now % 100000) + i;
          batch.push({ id: id, text: "Feed item #" + id });
        }
        return batch;
      })
      .matchOn("id"),

    // PREPEND — newest activity entries appear at the top on reload.
    activity: inertia.prepend(function () {
      return [{ id: now, text: "Server visit at " + new Date().toISOString() }];
    }),

    // ONCE — resolved once, remembered by the client for 60 seconds
    // (X-Inertia-Except-Once-Props), then re-fetched.
    bootTime: inertia
      .once(function () {
        return new Date().toISOString();
      })
      .until(60),
  });

  next();
});

/**
 * Demonstrates validation errors + flash data + redirect handling. Invalid
 * input flashes an error bag; valid input flashes a success message. Both
 * redirect back to Home-Show (Inertia follows and picks them up).
 */
server.post("Contact", initInertia.init, function (req, res, next) {
  var URLUtils = require("dw/web/URLUtils");

  var data = {};
  try {
    data = JSON.parse(req.body || "{}");
  } catch (e) {
    data = {};
  }

  var errors = {};
  if (!data.name) {
    errors.name = "Name is required";
  }
  if (!data.email || String(data.email).indexOf("@") === -1) {
    errors.email = "A valid email is required";
  }

  if (Object.keys(errors).length > 0) {
    res.inertia.flashErrors(errors);
  } else {
    res.inertia.flash("success", "Thanks " + data.name + " — message received!");
  }

  res.redirect(URLUtils.url("Home-Show"));
  next();
});

/**
 * Demonstrates the session-backed one-shot clearHistory flag: the next
 * rendered page carries clearHistory: true and the client wipes its history
 * state (e.g. after logout).
 */
server.post("ClearHistory", initInertia.init, function (req, res, next) {
  var URLUtils = require("dw/web/URLUtils");

  res.inertia.clearHistory();
  res.inertia.flash("info", "clearHistory flag set — delivered on this render.");

  res.redirect(URLUtils.url("Home-Show"));
  next();
});

server.get("Demo", initInertia.init, shareData, function (req, res, next) {
  var props = {
    user: { name: "John Doe" },
  };
  res.inertia.render("Home/Demo", props);

  next();
});

module.exports = server.exports();
