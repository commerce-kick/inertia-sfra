'use strict';

const { I, data, pluginWishlists } = inject();

When('shopper selects yes or no for tracking consent', () => {
    I.amOnPage(data.wishlists.homePage);
    pluginWishlists.accept();
});

Then('shopper sees the wishlist account next to user login button for guest user on desktop', () => {
    I.seeElement(pluginWishlists.locators.wishlistIcon);
    I.see(data.wishlists.wishlistText, pluginWishlists.locators.wishlistButtonDesktop);
});

Then('shopper sees the wishlist account next to user login button for guest user on mobile', () => {
    I.click(pluginWishlists.locators.burgerMenu);
    I.seeElement(pluginWishlists.locators.wishlistIcon);
    I.see(data.wishlists.wishlistText, pluginWishlists.locators.wishlistButtonMobileTablet);
});

Then('shopper sees the wishlist account next to user login button for guest user on tablet', () => {
    I.click(pluginWishlists.locators.burgerMenu);
    I.seeElement(pluginWishlists.locators.wishlistIcon);
    I.see(data.wishlists.wishlistText, pluginWishlists.locators.wishlistButtonMobileTablet);
});

Then('Shopper searches for {string}', (inputProduct) => {
    pluginWishlists.search(inputProduct);
});

Then('selects size {string}', (size) => {
    pluginWishlists.selectSize(size);
});

Then('shopper adds the product to wishlist', () => {
    pluginWishlists.addToWishlist();
    I.waitForText(data.wishlists.addedToWishlistMsg)
    I.see(data.wishlists.addedToWishlistMsg);
});

Then('shopper views wishlist and sees the product', () => {
    pluginWishlists.viewWishlist(data.wishlists.wishlistShowURL);
    I.see(data.product.name, pluginWishlists.locators.productCardHeader);
});

Then('shopper adds product to cart from wishlist', () => {
    pluginWishlists.addToCartFromWishlist(data.product.name);
    I.waitForText(data.wishlists.addedToCartMsg)
    I.see(data.wishlists.addedToCartMsg);
});

Then('shopper edits the product to {string} size in wishlist', (size) => {
    pluginWishlists.editWishlistItem(data.product.pid, size);
    I.waitForText(data.product.size, pluginWishlists.locators.itemAttributes);
});

Then('deletes the product from wishlist', () => {
    pluginWishlists.deleteWishlistItem();
    I.waitForText(data.wishlists.emptyWishlistMsg)
    I.see(data.wishlists.emptyWishlistMsg, pluginWishlists.locators.wishlistItems);
});

Then('shopper verifies product in cart', () => {
    pluginWishlists.viewCart();
    I.see(data.product.name, pluginWishlists.locators.productCardHeader);
});

Then('adds the product to wishlist from cart and deletes that product from cart', () => {
    pluginWishlists.moveFromCartToWishlist();
});

Then('logs in to see the guest wishlist becomes logged-in user wishlist', () => {
    I.amOnPage(data.login.loginPage);
    pluginWishlists.login(data.login.email, data.login.password);
    I.click(pluginWishlists.locators.loggedInUserPopover);
    I.waitForElement(pluginWishlists.locators.popoverMenuItems);
    I.waitForText(data.wishlists.wishlistText, pluginWishlists.locators.popoverMenuItems);
    within(pluginWishlists.locators.popoverMenuItems, () => {
        I.click(pluginWishlists.locators.popoverWishlistLink);
    });
    I.waitForText(data.product.name, pluginWishlists.locators.productCardHeader);
});

Given('John adds items in wishlist through product tile, cart and products details page', () => {
    I.amOnPage(data.login.loginPage);
    pluginWishlists.accept();
    pluginWishlists.login(data.login.email, data.login.password);

    pluginWishlists.verifyWishlistMenu(data.wishlists.wishlistText);

    pluginWishlists.addToWishlistFromProductTile(data.wishlists.homePage, data.productTile.pid);

    pluginWishlists.addToWishlistFromPDP(data.pdp.size, data.pdp.color, data.pdp.url);

    pluginWishlists.addToCartFromPDP(data.pdp2.size, data.pdp2.url);
    pluginWishlists.moveFromCartToWishlist();
});

When('he goes to wishlist from registered user menu', () => {
    pluginWishlists.clickWishlistFromUserMenu();
});

Then('he sees all added items in wishlist', () => {
    I.see(data.productTile.name, pluginWishlists.locators.productCardHeader);
    I.see(data.pdp.name, pluginWishlists.locators.productCardHeader);
    I.see(data.pdp2.name, pluginWishlists.locators.productCardHeader);
});

When('he removes all items from wishlist', () => {
    pluginWishlists.deleteAllWishlistItems();
});

Then('he sees the empty registered user wishlist', () => {
    I.see(data.wishlists.wishlistText, pluginWishlists.locators.pageTitle);
    I.see(data.wishlists.wishlistText, pluginWishlists.locators.wishlistOwner);
});

When('he edits an item in wishlist', () => {
    pluginWishlists.editWishlistItem(data.pdp.pid, data.pdp.sizeUpdated);
});

Then('he sees the updated item in wishlist', () => {
    I.see(data.pdp.itemAttSizeUpdted, pluginWishlists.locators.itemAttributes);
});

Then('he hides unhides and verifies the wishlist and individual item', async () => {
    pluginWishlists.hideWishlist();
    I.waitForElement(pluginWishlists.locators.addToWishlistMessages)
    I.seeTextEquals(data.wishlists.wishlistStatusMsg, pluginWishlists.locators.addToWishlistMessages);
    I.refreshPage();
    pluginWishlists.hideWishlistItem(data.pdp2.pid);
    I.waitForElement(pluginWishlists.locators.addToWishlistMessages)
    I.seeTextEquals(data.wishlists.itemStatusMsg, pluginWishlists.locators.addToWishlistMessages);
});

After(function (config) {
    if (config.tags.includes('@registeredUser') && !config.tags.includes('@removeItems')) {
        pluginWishlists.deleteAllWishlistItems();
    }
});
