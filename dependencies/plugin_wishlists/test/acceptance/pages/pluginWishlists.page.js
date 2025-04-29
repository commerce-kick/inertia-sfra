'use strict';

const I = actor();

module.exports = {
    locators: {
        consentTrackAffirm: '.modal-content .affirm.btn.btn-primary',
        wishlistButtonDesktop: '.user.hidden-md-down',
        burgerMenu: '.navbar-toggler.d-md-none',
        wishlistIcon: '.popover.show .fa.fa-heart',
        wishlistButtonMobileTablet: '.nav-item.d-lg-none span',
        searchField: 'input.form-control.search-field',
        searchedImage: '.swatch-circle.hidden-xs-down',
        selectSize: '.select-size',
        addToWishlistBtn: '.btn.btn-block.btn-outline-primary.add-to-wish-list',
        addToWishlistMessages: '.add-to-wishlist-messages .alert-success',
        productCardHeader: '.line-item-header .line-item-name',
        wishlistAddToCartBtn: '.add-to-cart.btn.btn-primary',
        miniCartIcon: '.minicart-icon.fa.fa-shopping-bag',
        cartHeader: '.cart-header',
        removeProductBox: '.hidden-md-down',
        removeProductBtn: '.remove-btn-lg.remove-product.btn.btn-light',
        removeProductModal: '.modal.fade.show',
        removeProductModalHeader: '.modal-header.delete-confirmation-header',
        removeProductModalConfirm:
            '.btn.btn-primary.cart-delete-confirmation-btn',
        updateEditWishlist: '.btn-update-wishlist-product',
        itemAttributes: '.line-item-attributes',
        removeFromWishlist: '.remove-btn-lg.remove-from-wishlist.btn.btn-light',
        wishlistItems: '.wishlistItemCards',
        moveToWishlistBtn: '.product-move a.move',
        emailLogin: '#login-form-email',
        passwordLogin: '#login-form-password',
        primaryButton: '.btn.btn-block.btn-primary',
        loggedInUserPopover: '.user .fa.fa-sign-in',
        pageTitle: '.page-title',
        wishlistOwner: '.wishlist-owner',
        prdTileWishlistIcon: '.fa-heart-o',
        addToCartBtn: '.add-to-cart',
        popoverWishlistLink: '.test-wishlist-link',
        popoverMenuItems: '.popover.show',
        wishlistCheckbox: '#isPublicList',
        wishlistCheckboxLabel: '.wishlist-checkbox',
        wishlistItemCheckbox: ' .wishlist-item-checkbox',
        editModal: '.quick-view-dialog .modal-content',
        pid: '.pid-',
        editLink: ' .edit'
    },
    accept() {
        I.waitForElement(this.locators.consentTrackAffirm);
        I.click(this.locators.consentTrackAffirm);
    },
    search(product) {
        I.fillField(this.locators.searchField, product);
        I.waitForElement(this.locators.searchedImage)
        I.click(this.locators.searchedImage);
    },
    selectSize(size) {
        I.waitForElement(this.locators.selectSize);
        I.selectOption(this.locators.selectSize, size);
    },
    addToWishlist() {
        I.waitForElement(this.locators.addToWishlistBtn);
        I.click(this.locators.addToWishlistBtn);
    },
    viewWishlist(wishlistShowURL) {
        I.amOnPage(wishlistShowURL);
    },
    addToCartFromWishlist() {
        I.click(this.locators.wishlistAddToCartBtn);
    },
    viewCart() {
        I.scrollPageToTop();
        I.seeElement(this.locators.miniCartIcon);
        I.click(this.locators.miniCartIcon);
        I.waitForElement(this.locators.cartHeader);
    },
    editWishlistItem(pid, size) {
        I.click(this.locators.pid + pid + this.locators.editLink);
        I.waitForElement(this.locators.editModal);
        this.selectSize(size);
        I.wait(1) // This wait is needed. Without this, selenium will click update before the edit modal updates for the selected size.
        within(this.locators.editModal, () => {
            I.click(this.locators.updateEditWishlist);
        });
        I.waitForInvisible(this.locators.editModal)
    },
    deleteWishlistItem() {
        this.deleteItems(1);
    },
    moveFromCartToWishlist() {
        I.click(this.locators.moveToWishlistBtn);
        I.waitForText('Remove Product')
        within(this.locators.removeProductModal, () => {
            I.click(this.locators.removeProductModalConfirm);
        });
    },
    login(email, password) {
        // fill login form
        I.waitForElement(this.locators.emailLogin);
        I.waitForElement(this.locators.passwordLogin);
        I.fillField(this.locators.emailLogin, email);
        I.fillField(this.locators.passwordLogin, password);
        // click login
        I.waitForElement(this.locators.primaryButton);
        I.click(this.locators.primaryButton);
    },
    addToWishlistFromProductTile(homePageUrl, pid) {
        I.amOnPage(homePageUrl);
        let prdTile = '[data-pid = "' + pid + '"]';
        I.waitForElement(prdTile);
        within(prdTile, () => {
            I.click(this.locators.prdTileWishlistIcon);
        });
    },
    selectColor(color) {
        let colorButton = '[aria-label = "Select Color ' + color + '"]';
        I.waitForElement(colorButton);
        I.click(colorButton);
    },
    addToWishlistFromPDP(size, color, pdpUrl) {
        I.amOnPage(pdpUrl);
        this.selectSize(size);
        this.selectColor(color);
        I.click(this.locators.addToWishlistBtn);
    },
    addToCartFromPDP(size, pdpUrl) {
        I.amOnPage(pdpUrl);
        this.selectSize(size);
        I.waitForEnabled(this.locators.addToCartBtn);
        I.click(this.locators.addToCartBtn);
        this.viewCart();
    },
    clickWishlistFromUserMenu() {
        I.click(this.locators.loggedInUserPopover);
        I.waitForElement(this.locators.popoverMenuItems);
        within(this.locators.popoverMenuItems, () => {
            I.click(this.locators.popoverWishlistLink);
        });
    },
    hideWishlist() {
        I.checkOption(this.locators.wishlistCheckboxLabel);
    },
    unhideWishlist() {
        I.uncheckOption(this.locators.wishlistCheckbox);
    },
    hideWishlistItem(pid) {
        let checkbox =
            this.locators.pid + pid + this.locators.wishlistItemCheckbox;
        I.checkOption(checkbox);
    },
    unhideWishlistItem(pid) {
        let checkbox =
            this.locators.pid + pid + this.locators.wishlistItemCheckbox;
        I.uncheckOption(checkbox);
    },
    deleteAllWishlistItems() {
        this.deleteItems(3);
    },
    deleteItems(numOfItems) {
        for (var i = 0; i < numOfItems; i++) {
            I.click(this.locators.removeFromWishlist);
            I.wait(2) // This wait is needed to give the wishlist time to re-render without the deleted item.
        }
    },
    verifyWishlistMenu(wishlistText) {
        I.wait(1); // This wait is needed. Without this, selenium will occasionally click the user drop down before it is rendered.
        I.click(this.locators.loggedInUserPopover);
        I.waitForElement(this.locators.wishlistIcon);
        I.seeElement(this.locators.wishlistIcon);
        I.see(wishlistText, this.locators.popoverMenuItems);
    }
};
