Feature: Wishlist Plugin
    As a shopper, I want to shop for a product and fill out the correct
    shipping information/billing information in checkout.

@wishlist @guestUser
    Scenario: As a guest user I want to go through wishlist feature happy path
        When shopper selects yes or no for tracking consent
        Given Shopper searches for "Elbow Sleeve Ribbed Sweater"
        Then selects size "M"
        Then shopper adds the product to wishlist
        Then shopper views wishlist and sees the product
        Then shopper adds product to cart from wishlist
        Then shopper edits the product to "L" size in wishlist
        And deletes the product from wishlist
        And shopper verifies product in cart
        And adds the product to wishlist from cart and deletes that product from cart
        And logs in to see the guest wishlist becomes logged-in user wishlist
        Then deletes the product from wishlist

@wishlist @registeredUser @addItems @removeItems
    Scenario: John is able to add and remove items in his wishlist
        Given John adds items in wishlist through product tile, cart and products details page
        And he goes to wishlist from registered user menu
        Then he sees all added items in wishlist
        When he removes all items from wishlist
        And he sees the empty registered user wishlist

@wishlist @registeredUser @editItems
    Scenario: John is able to update items in his wishlist
        Given John adds items in wishlist through product tile, cart and products details page
        And he goes to wishlist from registered user menu
        And he edits an item in wishlist
        And he sees the updated item in wishlist

@wishlist @registeredUser @hideUnhideItems
    Scenario: John is able to hide/unhide items in his wishlist
        Given John adds items in wishlist through product tile, cart and products details page
        And he goes to wishlist from registered user menu
        And he hides unhides and verifies the wishlist and individual item

