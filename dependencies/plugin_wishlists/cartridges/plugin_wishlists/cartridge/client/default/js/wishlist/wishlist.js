'use strict';

var base = require('base/product/base');
var focusHelper = require('base/components/focus');

/**
 * Updates the Mini-Cart quantity value after the customer has pressed the "Add to Cart" button
 * @param {string} response - ajax response from clicking the add to cart button
 */
function handlePostCartAdd(response) {
    $('.minicart').trigger('count:update', response);
    var messageType = response.error ? 'alert-danger' : 'alert-success';

    if ($('.add-to-cart-messages').length === 0) {
        $('body').append('<div class="add-to-cart-messages"></div>');
    }

    $('.add-to-cart-messages').append(
        '<div class="alert ' +
            messageType +
            ' add-to-basket-alert text-center" role="alert">' +
            response.message +
            '</div>'
    );

    setTimeout(function () {
        $('.add-to-basket-alert').remove();
    }, 5000);
}

/**
 * Generates the modal window on the first call.
 *
 */
function getModalHtmlElement() {
    if ($('#editProductModal').length !== 0) {
        $('#editProductModal').remove();
    }
    var htmlString =
        '<!-- Modal -->' +
        '<div class="modal fade" id="editWishlistProductModal" tabindex="-1" role="dialog">' +
        '<span class="enter-message sr-only" ></span>' +
        '<div class="modal-dialog quick-view-dialog">' +
        '<!-- Modal content-->' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '    <button type="button" class="close pull-right" data-dismiss="modal">' +
        '        <span aria-hidden="true">&times;</span>' +
        '        <span class="sr-only"> </span>' +
        '    </button>' +
        '</div>' +
        '<div class="modal-body"></div>' +
        '<div class="modal-footer"></div>' +
        '</div>' +
        '</div>' +
        '</div>';
    $('body').append(htmlString);
}

/**
 * Parses the html for a modal window
 * @param {string} html - representing the body and footer of the modal window
 *
 * @return {Object} - Object with properties body and footer.
 */
function parseHtml(html) {
    var $html = $('<div>').append($.parseHTML(html));

    var body = $html.find('.product-quickview');
    var footer = $html.find('.modal-footer').children();

    return { body: body, footer: footer };
}

/**
 * replaces the content in the modal window for product variation to be edited.
 * @param {string} editProductUrl - url to be used to retrieve a new product model
 */
function fillModalElement(editProductUrl) {
    $('#editWishlistProductModal').spinner().start();

    $.ajax({
        url: editProductUrl,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            var parsedHtml = parseHtml(data.renderedTemplate);

            $('#editWishlistProductModal .modal-body').empty();
            $('#editWishlistProductModal .modal-body').html(parsedHtml.body);
            $('#editWishlistProductModal .modal-footer').html(
                parsedHtml.footer
            );
            $('#editWishlistProductModal .modal-header .close .sr-only').text(
                data.closeButtonText
            );
            $('#editWishlistProductModal .enter-message').text(
                data.enterDialogMessage
            );
            $('#editWishlistProductModal').modal('show');
            $('body').trigger('editwishlistproduct:ready');
            $.spinner().stop();
        },
        error: function () {
            $('#editWishlistProductModal').spinner().stop();
        }
    });
}

/**
 * show toast response
 * @param {Object} res - from the call to set the public status of a list or item in a list
 */
function showResponseMsg(res) {
    $.spinner().stop();
    var status;

    if (res.success) {
        status = 'alert-success';
    } else {
        status = 'alert-danger';
    }

    if ($('.add-to-wishlist-messages').length === 0) {
        $('body').append('<div class="add-to-wishlist-messages "></div>');
    }

    $('.add-to-wishlist-messages').append(
        '<div role="alert" class="add-to-wishlist-alert text-center ' +
            status +
            '">' +
            res.msg +
            '</div>'
    );

    setTimeout(function () {
        $('.add-to-wishlist-messages').remove();
    }, 3000);
}

/**
 * toggles the public / private status of the item or wishlist item
 * @param {string} listID - the order model
 * @param {string} itemID - the customer model
 * @param {Object} callback - function to run if the ajax call returns with an
 *                        error so that the checkbox can be reset to it's original state
 */
function updatePublicStatus(listID, itemID, callback) {
    var url = $('#isPublicList').data('url');
    $.spinner().start();
    $.ajax({
        url: url,
        type: 'post',
        dataType: 'json',
        data: {
            listID: listID,
            itemID: itemID
        },
        success: function (data) {
            if (callback && !data.success) {
                callback();
            }
            showResponseMsg(data, null);
        },
        error: function (err) {
            if (callback) {
                callback();
            }
            showResponseMsg(err);
        }
    });
}
/**
 * @param {Object} $elementAppendTo - The element to append error html to
 * @param {string} msg - The error message
 * display error message if remove item from wishlist failed
 */
function displayErrorMessage($elementAppendTo, msg) {
    if ($('.remove-from-wishlist-messages').length === 0) {
        $elementAppendTo.append(
            '<div class="remove-from-wishlist-messages "></div>'
        );
    }
    $('.remove-from-wishlist-messages').append(
        '<div class="remove-from-wishlist-alert text-center alert-danger">' +
            msg +
            '</div>'
    );

    setTimeout(function () {
        $('.remove-from-wishlist-messages').remove();
    }, 3000);
}

/**
 * renders the list up to a given page number
 * @param {number} pageNumber - current page number
 * @param {boolean} spinner - if the spinner has already started
 * @param {string} focusElementSelector - selector of the element to focus on
 */
function renderNewPageOfItems(pageNumber, spinner, focusElementSelector) {
    var publicView = $('.wishlistItemCardsData').data('public-view');
    var listUUID = $('.wishlistItemCardsData').data('uuid');
    var url = $('.wishlistItemCardsData').data('href');
    if (spinner) {
        $.spinner().start();
    }
    var scrollPosition = document.documentElement.scrollTop;
    var newPageNumber = pageNumber;
    $.ajax({
        url: url,
        method: 'get',
        data: {
            pageNumber: ++newPageNumber,
            publicView: publicView,
            id: listUUID
        }
    })
        .done(function (data) {
            $('.wishlistItemCards').empty();
            $('body .wishlistItemCards').append(data);

            if (focusElementSelector) {
                $(focusElementSelector).focus();
            } else {
                document.documentElement.scrollTop = scrollPosition;
            }
        })
        .fail(function () {
            $('.more-wl-items').remove();
        });
    $.spinner().stop();
}

module.exports = {
    removeFromWishlist: function () {
        $('body').on('click', '.remove-from-wishlist', function (e) {
            e.preventDefault();
            var url = $(this).data('url');
            var elMyAccount = $('.account-wishlist-item').length;

            // If user is in my account page, call removeWishlistAccount() end point, re-render wishlist cards
            if (elMyAccount > 0) {
                $('.wishlist-account-card').spinner().start();
                $.ajax({
                    url: url,
                    type: 'get',
                    dataType: 'html',
                    data: {},
                    success: function (html) {
                        $('.wishlist-account-card>.card').remove();
                        $('.wishlist-account-card').append(html);
                        $('.wishlist-account-card').spinner().stop();
                    },
                    error: function () {
                        var $elToAppend = $('.wishlist-account-card');
                        $elToAppend.spinner().stop();
                        var msg = $elToAppend.data('error-msg');
                        displayErrorMessage($elToAppend, msg);
                    }
                });
                // else user is in wishlist landing page, call removeProduct() end point, then remove this card
            } else {
                $.spinner().start();
                $.ajax({
                    url: url,
                    type: 'get',
                    dataType: 'json',
                    data: {},
                    success: function () {
                        var pageNumber =
                            $('.wishlistItemCardsData').data('page-number') - 1;
                        renderNewPageOfItems(pageNumber, false);
                    },
                    error: function () {
                        $.spinner().stop();
                        var $elToAppendWL = $('.wishlistItemCards');
                        var msg = $elToAppendWL.data('error-msg');
                        displayErrorMessage($elToAppendWL, msg);
                    }
                });
            }
        });
    },

    viewProductViaEdit: function () {
        $('body').on('click', '.edit-add-to-wishlist .edit', function (e) {
            e.preventDefault();

            var editProductUrl = $(this).attr('href');
            $(e.target).trigger('editwishlistproduct:show');
            getModalHtmlElement();
            fillModalElement(editProductUrl);
        });
    },

    viewProductViaSelectAttribute: function () {
        $('body').on('click', '.select-attributes-btn', function (e) {
            e.preventDefault();

            var editProductUrl = $(this).data('get-product-url');
            getModalHtmlElement();
            fillModalElement(editProductUrl);
        });
    },

    focusEditWishlistProductModal: function () {
        $('body').on(
            'shown.bs.modal',
            '#editWishlistProductModal',
            function () {
                $('#editWishlistProductModal')
                    .siblings()
                    .attr('aria-hidden', 'true');
                $('#editWishlistProductModal .close').focus();
            }
        );
    },

    onClosingEditWishlistProductModal: function () {
        $('body').on(
            'hidden.bs.modal',
            '#editWishlistProductModal',
            function () {
                $('#editWishlistProductModal').remove();
                $('.modal-backdrop').remove();
                $('body').removeClass('modal-open');

                $('#editWishlistProductModal')
                    .siblings()
                    .attr('aria-hidden', 'false');
            }
        );
    },

    trapEditWishlistProductModalFocus: function () {
        $('body').on('keydown', '#editWishlistProductModal', function (e) {
            var focusParams = {
                event: e,
                containerSelector: '#editWishlistProductModal',
                firstElementSelector: '.close',
                lastElementSelector: '.btn-update-wishlist-product',
                nextToLastElementSelector: '.select-size'
            };
            focusHelper.setTabNextFocus(focusParams);
        });
    },

    updateWishlistUpdateButton: function () {
        $('body').on('product:updateAddToCart', function (e, response) {
            response.$productContainer
                .find('.btn-update-wishlist-product')
                .attr(
                    'disabled',
                    !response.product.readyToOrder ||
                        !response.product.available
                );
        });
    },

    updateWishListItem: function () {
        $('body').on('click', '.btn-update-wishlist-product', function (e) {
            e.preventDefault();

            var updateButtonBlock = $(this)
                .closest('.wishlist-item-update-button-block')
                .find('.update-wishlist-url');
            var updateProductUrl = updateButtonBlock.val();
            var uuid = updateButtonBlock.data('uuid');

            var form = {
                uuid: uuid,
                pid: base.getPidValue($(this))
            };

            $('#editWishlistProductModal').spinner().start();

            $.ajax({
                url: updateProductUrl,
                type: 'post',
                context: this,
                data: form,
                dataType: 'json',
                success: function () {
                    $.spinner().start();
                    $('#editWishlistProductModal').spinner().stop();
                    $('#editWishlistProductModal').remove();
                    $('.modal-backdrop').remove();
                    $('body').removeClass('modal-open');
                    var pageNumber =
                        $('.wishlistItemCardsData').data('page-number') - 1;
                    renderNewPageOfItems(
                        pageNumber,
                        false,
                        '.product-info .edit-add-to-wishlist .edit:first'
                    );
                },
                error: function () {
                    var msg = $('.btn-update-wishlist-product').data(
                        'error-msg'
                    );

                    $('#editWishlistProductModal').spinner().stop();
                    $('#editWishlistProductModal').remove();
                    $('.modal-backdrop').remove();
                    $('body').removeClass('modal-open');

                    if ($('.update-wishlist-messages').length === 0) {
                        $('body').append(
                            '<div class="update-wishlist-messages "></div>'
                        );
                    }

                    $('.update-wishlist-messages').append(
                        '<div class="update-wishlist-alert text-center alert-danger">' +
                            msg +
                            '</div>'
                    );

                    setTimeout(function () {
                        $('.update-wishlist-messages').remove();
                    }, 5000);
                }
            });
        });
    },

    toggleWishlistStatus: function () {
        $('#isPublicList').on('click', function () {
            var listID = $('#isPublicList').data('id');
            updatePublicStatus(listID, null, null);
        });
    },

    toggleWishlistItemStatus: function () {
        $('body').on('click', '.wishlist-item-checkbox', function () {
            var itemID = $(this)
                .closest('.wishlist-hide')
                .find('.custom-control-input')
                .data('id');
            var el = $(this).siblings('input');
            var resetCheckBox = function () {
                return el.prop('checked')
                    ? el.prop('checked', false)
                    : el.prop('checked', true);
            };

            updatePublicStatus(null, itemID, resetCheckBox);
        });
    },

    addToCartFromWishlist: function () {
        $('body').on('click', '.add-to-cart', function () {
            var pid;
            var addToCartUrl;
            var pidsQty;

            $('body').trigger('product:beforeAddToCart', this);

            pid = $(this).data('pid');
            addToCartUrl = $(this).data('url');
            pidsQty = parseInt(
                $(this).closest('.product-info').find('.quantity').val(),
                10
            );

            var form = {
                pid: pid,
                quantity: pidsQty
            };

            if ($(this).data('option')) {
                form.options = JSON.stringify($(this).data('option'));
            }

            $(this).trigger('updateAddToCartFormData', form);
            if (addToCartUrl) {
                $.ajax({
                    url: addToCartUrl,
                    method: 'POST',
                    data: form,
                    success: function (data) {
                        handlePostCartAdd(data);
                        $('body').trigger('product:afterAddToCart', data);
                        $.spinner().stop();
                        base.miniCartReportingUrl(
                            data.reportingURL,
                            data.error
                        );
                    },
                    error: function () {
                        $.spinner().stop();
                    }
                });
            }
        });
    },
    moreWLItems: function () {
        $('body').on('click', '.more-wl-items', function () {
            var pageNumber = $('.wishlistItemCardsData').data('page-number');
            renderNewPageOfItems(pageNumber, true);
        });
    },
    copyWishlistLink: function () {
        $('body').on('click', '#copyShareUrlBtn', function () {
            var $btn = $('#copyShareUrlBtn');
            var shareUrl = $btn.data('url');
            navigator.clipboard.writeText(shareUrl);
            $('.copy-link-message').removeClass('d-none');
            setTimeout(function () {
                $('.copy-link-message').addClass('d-none');
            }, 3000);
        });
    },
    submitWishlistSearch: function () {
        $('body').on('click', '#wishlist-search button', function (e) {
            var firstName = $('#wishlist-search-first-name').val();
            var lastName = $('#wishlist-search-last-name').val();
            var email = $('#wishlist-search-email').val();

            if (
                (!firstName && !lastName && !email) ||
                (firstName && !lastName && !email) ||
                (!firstName && lastName && !email)
            ) {
                e.preventDefault();
                $('.wishlist-error-search div').addClass('alert alert-danger');
                var errorText = $('.wishlist-error-search').data('error-msg');
                $('.wishlist-error-search div').html(errorText);
            }
        });
    },
    moreWLSearchResults: function () {
        $('body').on('click', '.more-wl-results', function () {
            var firstName = $(this).data('search-fname');
            var lastName = $(this).data('search-lname');
            var pageNumber = $(this).data('page-number');
            var uuids = [];
            $('.wl-hit').each(function () {
                uuids.push($(this).find('a').data('id'));
            });
            var url = $(this).data('url');
            $.spinner().start();
            $.ajax({
                url: url,
                method: 'POST',
                data: {
                    firstName: firstName,
                    lastName: lastName,
                    uuids: JSON.stringify(uuids),
                    pageNumber: ++pageNumber
                },
                success: function (data) {
                    if (data.results.changedList) {
                        $('.wl-hits .wl-hit').remove();
                    }
                    $('#result-count').html(data.results.totalString);
                    data.results.hits.forEach(function (hit) {
                        var divString =
                            '<div class="row wl-hit">' +
                            '<div class="text-left col-6">' +
                            hit.firstName +
                            ' ' +
                            hit.lastName +
                            '</div>' +
                            '<div class="text-right col-6">' +
                            '<a href="' +
                            hit.url +
                            '" title="' +
                            hit.urlTitle +
                            '" data-id="' +
                            hit.id +
                            '">' +
                            hit.urlText +
                            '</a>' +
                            '</div>' +
                            '</div>';
                        $('.wl-hits').append(divString);
                    });
                    if (data.results.showMore) {
                        $('.find-another-wl .more-wl-results').data(
                            'page-number',
                            data.results.pageNumber
                        );
                    } else {
                        $('.find-another-wl .more-wl-results').remove();
                    }
                    $.spinner().stop();
                },
                error: function () {
                    $.spinner().stop();
                }
            });
        });
    }
};
