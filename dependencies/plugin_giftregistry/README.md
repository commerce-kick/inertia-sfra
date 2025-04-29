# plugin\_giftregistry: Storefront Reference Architecture (SFRA)

This is the repository for the plugin\_giftregistry plugin. This plugin enhances the app\_storefront\_base cartridge by providing Gift Registry functionality, including the following capabilities:

* Shoppers can define a private gift registry, and then make it public and viewable by other shoppers.
* Shoppers can search for, and page through, lists of public gift registries.
* Shoppers can hide specific items in their public gift registry from the view of other shoppers.
* Shoppers can add products to their gift registry from the product display page.
* Shoppers can purchase products listed in other shoppers' gift registries.

This plugin depends on the lib\_productlist cartridge, which can be found [here](https://github.com/SalesforceCommerceCloud/lib_productlist)

# Cartridge Path Considerations
The plugin\_giftregistry plugin requires the lib\_productlist cartridge and the app\_storefront\_base cartridge. In your cartridge path, include the cartridges in the following order:

```
plugin_giftregistry:lib_productlist:app_storefront_base
```

If you want to use the plugin\_giftregistry and plugin\_wishlists cartridges, create a customization cartridge and place it to the left of those cartridges on the cartridge path. For example:

```
my_customization_cartridge:plugin_giftregistry:plugin_wishlists:lib_productlist:app_storefront_base
```

# Template Conflicts

Each template in the following table is present in multiple cartridges. If the file exists in the app\_storefront\_base cartridge and in this plugin cartridge, the plugin template overrides the base template. The presence of a template file in multiple plugin cartridges indicates a conflict that you have to resolve in a customization cartridge. However, if you are using only one of the conflicting plugin cartridges, no action is necessary.

| Template File | Cartridge | Location |
| :--- | :--- | :--- |
|accountDashboard.isml|app\_storefront\_base|cartridge/templates/default/account/accountDashboard.isml|
|accountDashboard.isml|plugin\_datadownload|cartridge/templates/default/account/accountDashboard.isml|
|accountDashboard.isml|plugin\_giftregistry|cartridge/templates/default/account/accountDashboard.isml|
|accountDashboard.isml|plugin\_wishlists|cartridge/templates/default/account/accountDashboard.isml|
|cartProductCard.isml|app\_storefront\_base|cartridge/templates/default/cart/productCard/cartProductCard.isml|
|cartProductCard.isml|plugin\_giftregistry|cartridge/templates/default/cart/productCard/cartProductCard.isml|
|cartProductCard.isml|plugin\_instorepickup|cartridge/templates/default/cart/productCard/cartProductCard.isml|
|confirmationEmail.isml|app\_storefront\_base|cartridge/templates/default/checkout/confirmation/confirmationEmail.isml|
|confirmationEmail.isml|plugin\_giftregistry|cartridge/templates/default/checkout/confirmation/confirmationEmail.isml|
|dashboardProfileCards.isml|app\_storefront\_base|cartridge/templates/default/account/dashboardProfileCards.isml|
|dashboardProfileCards.isml|plugin\_giftregistry|cartridge/templates/default/account/dashboardProfileCards.isml|
|dashboardProfileCards.isml|plugin\_wishlists|cartridge/templates/default/account/dashboardProfileCards.isml|
|productAvailability.isml|app\_storefront\_base|cartridge/templates/default/product/components/productAvailability.isml|
|productAvailability.isml|plugin\_giftregistry|cartridge/templates/default/product/components/productAvailability.isml|
|productAvailability.isml|plugin\_instorepickup|cartridge/templates/default/product/components/productAvailability.isml|
|productAvailability.isml|plugin\_wishlists|cartridge/templates/default/product/components/productAvailability.isml|
|productCard.isml|app\_storefront\_base|cartridge/templates/default/checkout/productCard/productCard.isml|
|productCard.isml|plugin\_giftregistry|cartridge/templates/default/checkout/productCard/productCard.isml|
|productShippingCard.isml|app\_storefront\_base|cartridge/templates/default/checkout/productCard/productShippingCard.isml|
|productShippingCard.isml|plugin\_giftregistry|cartridge/templates/default/checkout/productCard/productShippingCard.isml|
|quickView.isml|app\_storefront\_base|cartridge/templates/default/product/quickView.isml|
|quickView.isml|plugin\_giftregistry|cartridge/templates/default/product/quickView.isml|
|updateProduct.isml|app\_storefront\_base|cartridge/templates/default/product/components/updateProduct.isml|
|updateProduct.isml|plugin\_giftregistry|cartridge/templates/default/product/components/updateProduct.isml|
|updateProduct.isml|plugin\_wishlists|cartridge/templates/default/product/components/updateProduct.isml|
|variationAttribute.isml|app\_storefront\_base|cartridge/templates/default/product/components/variationAttribute.isml|
|variationAttribute.isml|plugin\_giftregistry|cartridge/templates/default/product/components/variationAttribute.isml|


# Getting Started

1. Clone this repository. (The name of the top-level folder is plugin\_giftregistry.)
2. In the top-level plugin\_giftregistry folder, enter the following command: `npm install`. (This command installs all of the package dependencies required for this plugin.)
3. In the top-level plugin\_giftregistry folder, edit the paths.base property in the package.json file. This property should contain a relative path to the local directory containing the Storefront Reference Architecture repository. For example:
```
"paths": {
    "base": "../storefront-reference-architecture/cartridges/app_storefront_base/"
  }
```
4. In the top-level plugin\_giftregistry folder, enter the following command: `npm run compile:js && npm run compile:scss`
5. In the top-level plugin\_giftregistry folder, enter the following command: `npm run uploadCartridge`
6. In Business Manager, uncomment the "Go to Gift Registry" line in the footer-account content asset:
```
<h3><a class="title" href="#">Account</a></h3>
      <ul class="menu-footer content">
      <li><a href="$httpsURL('Account-Show')$" title="Go to My Account">My Account</a></li>
      <li><a href="$httpsURL('Order-History')$" title="Go to Check Order">Check Order</a></li>
      <!-- <li><a href="$httpsURL('Wishlist-Search')$" title="Go to Wishlist">Find a Wishlist</a></li> -->
      <!-- <li><a href="#" title="Go to Gift Registry">Gift Registry</a></li> -->
      </ul><!-- END: footer-account -->
```

# NPM scripts

* Use the provided NPM scripts to compile and upload changes to your Sandbox.

## Compiling your application

* npm run compile:scss - Compiles all scss files into css.
* npm run compile:js - Compiles all js files and aggregates them.

## Linting your code

* npm run lint - Execute linting for all JavaScript and SCSS files in the project. You should run this command before committing your code.

## Watching for changes and uploading

* npm run watch:static - Watches js and scss files for changes, recompiles them and uploads result to the sandbox. Requires a valid dw.json file at the root that is configured for the sandbox to upload.

* npm run watch:cartridge - Watches all cartridge files (except for static content) and uploads it to sandbox. Requires a valid dw.json file at the root that is configured for the sandbox to upload.

* npm run watch - Watches everything and recompiles (if necessary) and uploads to the sandbox. Requires a valid dw.json file at the root that is configured for the sandbox to upload.

## Running unit tests

* You can run npm test to execute all unit tests in the project. Run npm test --coverage to get coverage information. Coverage will be available in coverage folder under root directory.

## Running integration tests (assiming we have giftregistry and base cartridges configured)

* This cartridge's Integration tests are located in ../plugin_giftregistry/test/integration
* Base cartridge's Integration tests are located in ../storefront-reference-architecture/test/integration
* All Tests in both cartridges should run, if the same file name and same tests name has been found, the overlay cartridge test will run, the same test in base will be ignored.

To run integration tests you can use the following command:

```
npm run test:integration
```

**Note:** Please note that short form of this command will try to locate URL of your sandbox by reading `dw.json` file in the root directory of your project. If you don't have `dw.json` file, integration tests will fail.
sample dw.json file (this file needs to be in the root of your project)
{
    "hostname": "devxx-sitegenesis-dw.demandware.net"
}

You can also supply URL of the sandbox on the command line:

```
npm run test:integration -- --baseUrl devxx-sitegenesis-dw.demandware.net
```
