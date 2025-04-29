# SiteGenesis Mobile-First #

This is the repository for the productlist helper cartridge.  This is ment to be used with the wishlist and gift registry cartridges for Mobile First Reference Architecture.

# Getting Started #

1. Clone this repository.
2. Install npm dependencies npm install
3. Upload the cartridges folder to the WebDav location for cartridges for your Sandbox through CyberDuck or any other WebDAV client.

# NPM scripts #

* Use the provided NPM scripts to compile and upload changes to your Sandbox.

# Linting your code #

* npm run lint - Execute linting for all JavaScript and SCSS files in the project. You should run this command before committing your code.

# Watching for changes and uploading #

* npm run watch:static - Watches js and scss files for changes, recompiles them and uploads result to the sandbox. Requires a valid dw.json file at the root that is configured for the sandbox to upload.

* npm run watch:cartridge - Watches all cartridge files (except for static content) and uploads it to sandbox. Requires a valid dw.json file at the root that is configured for the sandbox to upload.

* npm run watch - Watches everything and recompiles (if necessary) and uploads to the sandbox. Requires a valid dw.json file at the root that is configured for the sandbox to upload.

# Testing #

# Running unit tests #

* You can run npm test to execute all unit tests in the project. Run npm test --coverage to get coverage information. Coverage will be available in coverage folder under root directory.

# Running integration tests #

* Integration tests are located in ../sitegenesis-mobile-first/test/integration

* To run individual test, i.e. test1.js in storeLocator sub-suite: npm run test:integration -- --baseUrl https://hostname/on/demandware.store/Sites-SiteGenesis-Site/en_US test/integration/storeLocator/test1.js

* To run tests in sub-suite, i.e. storeLocator sub-suite: npm run test:integration -- --baseUrl https://hostname/on/demandware.store/Sites-SiteGenesis-Site/en_US test/integration/storeLocator

* To run tests in integration suite: npm run test:integration -- --baseUrl https://hostname/on/demandware.store/Sites-SiteGenesis-Site/en_US test/integration/*

# Running Appium UI tests: #

* These tests can only be run locally with Appium and Xcode installed; currently we have not configure for Jenkins to run these tests. Ideally we would like to use Sauce Labs to run these tests instead of installing Appium on Jenkins machine. However, we are still waiting for a valid Sauce Labs id. Follow this instruction to install Appium and Xcode: How to install Appium

* Appium UI Tests are located at ../sitegenesis-mobile-first/test/Appium

* npm run test:appium -- --url http://sbox01-realm1-company.demandware.net/s/SiteGenesis

* Note: always use the pretty storefront url when writing and running UI tests.

# Running Functional UI tests: #

* npm run test:functional -- --url http://sbox01-realm1-company.demandware.net/s/SiteGenesis --chrome Note: We have proof that the same tests can be applied to both Appium and Functional tests, the only time we might run into issues is when certain element is hidden on certain size of screen and visible on another size of screeen, then we will need to compile a different selector to accormodate that.