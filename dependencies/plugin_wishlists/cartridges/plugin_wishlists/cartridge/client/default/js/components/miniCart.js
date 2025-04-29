'use strict';

var base = require('base/components/miniCart');

/**
 * appends params to a url
 * @param {string} data - data returned from the server's ajax call
 */
function displayMessageAndRemoveFromCart(data) {
    $.spinner().stop();
    var status = data.success ? 'alert-success' : 'alert-danger';

    if ($('.add-to-wishlist-messages').length === 0) {
        $('body').append('<div class="add-to-wishlist-messages "></div>');
    }
    $('.add-to-wishlist-messages')
        .append('<div class="add-to-wishlist-alert text-center ' + status + '">' + data.msg + '</div>');

    setTimeout(function () {
        $('.add-to-wishlist-messages').remove();
    }, 1500);
    var $targetElement = $('a[data-pid="' + data.pid + '"]').closest('.product-info').find('.remove-product');
    var itemToMove = {
        actionUrl: $targetElement.data('action'),
        productID: $targetElement.data('pid'),
        productName: $targetElement.data('name'),
        uuid: $targetElement.data('uuid')
    };
    $('body').trigger('afterRemoveFromCart', itemToMove);
    setTimeout(function () {
        $('.cart.cart-page #removeProductModal').modal();
    }, 2000);
}
/**
 * move items from Cart to wishlist
 * returns json object with success or error message
 */
function moveToWishlist() {
    $('body').on('click', '.product-move .move', function (e) {
        e.preventDefault();
        var url = $(this).attr('href');
        var pid = $(this).data('pid');
        var optionId = $(this).closest('.product-info').find('.lineItem-options-values').data('option-id');
        var optionVal = $(this).closest('.product-info').find('.lineItem-options-values').data('value-id');
        optionId = optionId || null;
        optionVal = optionVal || null;
        if (!url || !pid) {
            return;
        }

        $.spinner().start();
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data: {
                pid: pid,
                optionId: optionId,
                optionVal: optionVal
            },
            success: function (data) {
                displayMessageAndRemoveFromCart(data);
            },
            error: function (err) {
                displayMessageAndRemoveFromCart(err);
            }
        });
    });
}

module.exports = {
    base: base,
    moveToWishlist: moveToWishlist
};
