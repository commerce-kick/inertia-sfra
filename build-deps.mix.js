let mix = require("laravel-mix");

const { resolve } = require("path");
let glob = require("glob");
const { remove } = require("fs-extra");
let { dirname, join } = require("path");

let cartridgesPath = [
  "./dependencies/storefront-reference-architecture",
  "./dependencies/plugin_loyalty",
];
let sassConfig = {
  sassOptions: {
    includePaths: [
      resolve(
        "dependencies/storefront-reference-architecture/node_modules/flag-icon-css/sass"
      ),
    ],
  }
};

mix.before(() => {
  cartridgesPath.forEach(function (cartridge) {
    let folders = glob.sync(
      `${cartridge}/cartridges/**/cartridge/static/*/!(images|experience|fonts)/`
    );
    folders.forEach((dir) => {
      remove(dir);
    });
  });
});

mix.options({
  processCssUrls: false,
});

mix.webpackConfig({
  resolve: {
    alias: {
      base: [
        resolve(
          "./dependencies/storefront-reference-architecture/cartridges/app_storefront_base/cartridge/client/default/scss"
        ),
        resolve(
          "./dependencies/storefront-reference-architecture/cartridges/app_storefront_base/cartridge/client/default/js"
        ),
      ],
    },
    modules: cartridgesPath.map((cartridge) => `${cartridge}/node_modules/`),
  },
});

cartridgesPath.forEach((cartridge) => {
  glob
    .sync(`${cartridge}/cartridges/**/cartridge/client/**/!(_*).scss`)
    .map(function (file) {
      let pt = dirname(file).split("/scss");

      let dist = join(pt[0].replace("client", "static"), "css", pt[1]);
      mix.sass(file, dist, sassConfig);
    });

  glob
    .sync(`${cartridge}/cartridges/**/cartridge/client/**/!(_*).js`)
    .map(function (file) {
      let pt = dirname(file).split("/js");

      let dist = join(pt[0].replace("client", "static"), "js", pt[1]);
      mix.js(file, dist);
    });
});

mix.sourceMaps(false, "source-map");

mix.disableNotifications();
