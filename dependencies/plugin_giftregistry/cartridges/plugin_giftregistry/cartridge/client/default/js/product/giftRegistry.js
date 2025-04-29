'use strict';

var base = require('base/product/base');

/**
 * Displays the message returned in the response
 * @param {string} data - data returned from the server's ajax call
 */
function displayMessage(data) {
    var status;
    if (!data.error) {
        status = 'alert-success';
    } else {
        status = 'alert-danger';
    }

    if ($('.add-to-registry-message').length === 0) {
        $('body').append('<div class="add-to-registry-message" role="alert"></div>');
    }
    $('.add-to-registry-message').append(
        '<div class="add-to-registry-alert text-center ' + status + '">' + data.msg + '</div>'
    );

    setTimeout(function () {
        $('.add-to-registry-message').remove();
    }, 5000);
}

module.exports = {
    updateAddToRegistry: function () {
        $('body').on('product:updateAddToCart', function (e, response) {
            $('button.add-to-gift-registry', response.$productContainer).attr(
                'disabled',
                (!response.product.readyToOrder || !response.product.available)
            );
        });
    },

    updateGiftRegistryURLQuantity: function () {
        $('body').on('product:afterAttributeSelect', function (e, response) {
            $('.add-to-gift-registry', response.container).data('href', response.data.product.giftRegistryLink);
        });
    },

    addToGiftRegistry: function () {
        $('.add-to-gift-registry').on('click', function (e) {
            e.preventDefault();
            var element = $(this);
            var url = element.data('href');

            $.spinner().start();

            var args = {
                pid: base.getPidValue($(this)),
                qty: base.getQuantitySelected($(this)),
                prodSetPid: $('.product-set-detail').data('pid') || ''
            };

            var encodedArgs = encodeURIComponent(JSON.stringify(args));

            $.ajax({
                url: url,
                type: 'get',
                data: { args: encodedArgs },
                dataType: 'json',
                success: function (data) {
                    if (data.redirectUrl) {
                        window.location.href = data.redirectUrl;
                    } else {
                        displayMessage(data, element);
                    }

                    $.spinner().stop();
                },
                error: function (err) {
                    $.spinner().stop();
                    window.location.href = err.responseJSON.redirectUrl;
                }
            });
        });
    }
};
