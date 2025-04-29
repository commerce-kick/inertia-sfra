# plugin\_wishlists: Storefront Reference Architecture (SFRA)

This is the repository for the plugin\_wishlists plugin. This plugin enhances the app\_storefront\_base cartridge by providing wishlist functionality, including the following capabilities:

* Guest shoppers can add products to and delete products from a temporary wishlist.
* Guest shoppers can convert their temporary wishlists to persistent wishlists by logging into the storefront as a registered user.
* Registered shoppers can add products to their wishlist and delete products from their wishlist.
* Registered shoppers can control whether their wishlists are publicly searchable and publicly viewable by other storefront shoppers
* Shoppers can search for public wishlists by entering an email address or by entering a shopper's first name and last name.
* Shoppers can add wishlist products to their carts.

This plugin depends on the lib\_productlist cartridge.

# Cartridge Path Considerations
The plugin\_wishlists plugin requires the lib\_productlist cartridge and the app\_storefront\_base cartridge. In your cartridge path, include the cartridges in the following order:

```
plugin_wishlists:lib_productlist:app_storefront_base
```

If you want to use both the plugin\_wishlists and plugin\_giftregistry cartridges, create a customization cartridge and place it to the left of those cartridges on the cartridge path. For example:

```
my_customization_cartridge:plugin_wishlists:plugin_giftregistry:lib_productlist:app_storefront_base
```

# Template Conflicts

Each template in the following table is present in multiple cartridges. If the file
exists in the app\_storefront\_base cartridge and in this plugin cartridge,
the plugin template overrides the base template. The presence
of a template file in multiple plugin cartridges indicates a conflict that you
have to resolve in a customization cartridge. However, if you are using
only one of the conflicting plugin cartridges, no action is necessary.

| Template File | Cartridge | Location |
| :--- | :--- | :--- |
|accountDashboard.isml|app\_storefront\_base|cartridge/templates/default/account/accountDashboard.isml|
|accountDashboard.isml|plugin\_datadownload|cartridge/templates/default/account/accountDashboard.isml|
|accountDashboard.isml|plugin\_giftregistry|cartridge/templates/default/account/accountDashboard.isml|
|accountDashboard.isml|plugin\_wishlists|cartridge/templates/default/account/accountDashboard.isml|
|availabilityBundleContainer.isml|app\_storefront\_base|cartridge/templates/default/product/components/availabilityBundleContainer.isml|
|availabilityBundleContainer.isml|plugin\_wishlists|cartridge/templates/default/product/components/availabilityBundleContainer.isml|
|cartProductCardEdit.isml|app\_storefront\_base|cartridge/templates/default/cart/productCard/cartProductCardEdit.isml|
|cartProductCardEdit.isml|plugin\_wishlists|cartridge/templates/default/cart/productCard/cartProductCardEdit.isml|
|dashboardProfileCards.isml|app\_storefront\_base|cartridge/templates/default/account/dashboardProfileCards.isml|
|dashboardProfileCards.isml|plugin\_giftregistry|cartridge/templates/default/account/dashboardProfileCards.isml|
|dashboardProfileCards.isml|plugin\_wishlists|cartridge/templates/default/account/dashboardProfileCards.isml|
|header.isml|app\_storefront\_base|cartridge/templates/default/account/header.isml|
|header.isml|plugin\_wishlists|cartridge/templates/default/account/header.isml|
|mobileHeader.isml|app\_storefront\_base|cartridge/templates/default/account/mobileHeader.isml|
|mobileHeader.isml|plugin\_wishlists|cartridge/templates/default/account/mobileHeader.isml|
|productAvailability.isml|app\_storefront\_base|cartridge/templates/default/product/components/productAvailability.isml|
|productAvailability.isml|plugin\_giftregistry|cartridge/templates/default/product/components/productAvailability.isml|
|productAvailability.isml|plugin\_instorepickup|cartridge/templates/default/product/components/productAvailability.isml|
|productAvailability.isml|plugin\_wishlists|cartridge/templates/default/product/components/productAvailability.isml|
|productTileImage.isml|app\_storefront\_base|cartridge/templates/default/product/components/productTileImage.isml|
|productTileImage.isml|plugin\_wishlists|cartridge/templates/default/product/components/productTileImage.isml|
|updateProduct.isml|app\_storefront\_base|cartridge/templates/default/product/components/updateProduct.isml|
|updateProduct.isml|plugin\_giftregistry|cartridge/templates/default/product/components/updateProduct.isml|
|updateProduct.isml|plugin\_wishlists|cartridge/templates/default/product/components/updateProduct.isml|

# Getting Started

1. Clone this repository. (The name of the top-level folder is plugin\_wishlists.)
2. In the top-level plugin\_wishlists folder, enter the following command: `npm install`. (This command installs all of the package dependencies required for this plugin.)
3. In the top-level plugin\_wishlists folder, edit the paths.base property in the package.json file. This property should contain a relative path to the local directory containing the Storefront Reference Architecture repository. For example:
```
"paths": {
    "base": "../storefront-reference-architecture/cartridges/app_storefront_base/"
  }
```
4. In the top-level plugin\_wishlists folder, enter the following command: `npm run compile:js && npm run compile:scss`
5. In the top-level plugin\_wishlists folder, enter the following command: `npm run uploadCartridge`
6. In Business Manager, uncomment the "Find a Wishlist" line in the footer-account content asset:
```
<h3><a class="title" href="#">Account</a></h3>
      <ul class="menu-footer content">
      <li><a href="$httpsURL('Account-Show')$" title="Go to My Account">My Account</a></li>
      <li><a href="$httpsURL('Order-History')$" title="Go to Check Order">Check Order</a></li>
      <!-- <li><a href="$httpsURL('Wishlist-Search')$" title="Go to Wishlist">Find a Wishlist</a></li> -->
      <li><a href="#" title="Go to Gift Registry">Gift Registry</a></li>
      </ul><!-- END: footer-account -->
```


# NPM Scripts

* Use the provided NPM scripts to compile and upload changes to your Sandbox.

## Compile Client-Side Code and SCSS

* npm run compile:scss - Compiles all scss files into css.

* npm run compile:js - Compiles all js files and aggregates them.

## Lint Your Code

* npm run lint - Execute linting for all JavaScript and SCSS files in the project. You should run this command before committing your code.

## Watch for Changes and Uploading

* npm run watch:static - Watches js and scss files for changes, recompiles them and uploads result to the sandbox. Requires a valid dw.json file at the root that is configured for the sandbox to upload.

* npm run watch:cartridge - Watches all cartridge files (except for static content) and uploads it to sandbox. Requires a valid dw.json file at the root that is configured for the sandbox to upload.

* npm run watch - Watches everything and recompiles (if necessary) and uploads to the sandbox. Requires a valid dw.json file at the root that is configured for the sandbox to upload.

## Run Unit Tests

* You can run npm test to execute all unit tests in the project. Run npm test --coverage to get coverage information. Coverage will be available in coverage folder under root directory.

## Run Integration Tests (assuming you have wishlist and base cartridge configured)

* This cartridge's Integration tests are located in ../plugin_wishlist/test/integration
* Base cartridge's Integration tests are located in ../storefront-reference-architecture/test/integration
* All tests in both cartridges should run. If the same file name and test name are found, the overlay cartridge test is run, and the same test in the base cartridge is ignored.

To run integration tests, use the following command:

```
npm run test:integration
```

**Note:** This command locates the URL of your sandbox by reading the `dw.json` file in the root directory of your project. If you don't have this file at the expected location, the integration tests will fail.
{
    "hostname": "devxx-sitegenesis-dw.demandware.net"
}

You can also supply URL of the sandbox on the command line:

```
npm run test:integration -- --baseUrl devxx-sitegenesis-dw.demandware.net
```

## Run Acceptance Tests

**Note:** The acceptance tests use Selenium, which requires java. Before running the tests, make sure Java is installed with `java -version`

To run acceptance tests, use the following command:

```
npm run test:acceptance
```

Just like the integration tests, this command will run the tests against the URL you have defined in `dw.json`.