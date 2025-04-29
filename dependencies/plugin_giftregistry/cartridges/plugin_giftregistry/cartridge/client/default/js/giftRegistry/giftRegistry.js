'use strict';

var base = require('base/product/base');
var focusHelper = require('base/components/focus');

var giftRegistryLib = require('./giftRegistryLib');
var dateValidation = require('../components/dateInput');
var formValidation = require('base/components/formValidation');
var location = window.location;
/**
 * Handles the displaying of address form and filling of appropriate values
 * @param {Object} $form - The form to show hide
 * @param {Object} $selectedOption - Option selected in address selector dropdown
 */
function handleGiftRegistryAddressForms($form, $selectedOption) {
    var $cardBody = $selectedOption.parents('.card-body');
    if ($selectedOption.val() === 'new') {
        $form.removeClass('d-none');
        $cardBody.find('.addressID').val('');
        $cardBody.find('.firstName').val('');
        $cardBody.find('.lastName').val('');
        $cardBody.find('.address1').val('');
        $cardBody.find('.address2').val('');
        $cardBody.find('.country').val('');
        $cardBody.find('.stateCode').val('');
        $cardBody.find('.city_address').val('');
        $cardBody.find('.postalCode').val('');
        $cardBody.find('.phone_address').val('');
        $cardBody.find('.address-saved').val('new');
    } else {
        $form.addClass('d-none');
        $cardBody.find('.addressID').val($cardBody.find('.grAddressSelector').val());
        $cardBody.find('.firstName').val($selectedOption.data('first-name'));
        $cardBody.find('.lastName').val($selectedOption.data('last-name'));
        $cardBody.find('.address1').val($selectedOption.data('address1'));
        $cardBody.find('.address2').val($selectedOption.data('address2'));
        $cardBody.find('.country').val($selectedOption.data('country-code'));
        $cardBody.find('.stateCode').val($selectedOption.data('state-code'));
        $cardBody.find('.city_address').val($selectedOption.data('city'));
        $cardBody.find('.postalCode').val($selectedOption.data('postal-code'));
        $cardBody.find('.phone_address').val($selectedOption.data('phone'));
        $cardBody.find('.address-saved').val('saved');
    }
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

    if ($('.giftregistry-messages').length === 0) {
        $('body').append(
            '<div class="giftregistry-messages " role="alert"></div>'
        );
    }

    $('.giftregistry-messages')
        .append('<div class="giftregistry-alert text-center ' + status + '" role="alert">' + res.msg + '</div>');

    setTimeout(function () {
        $('.giftregistry-messages').remove();
    }, 3000);
}

/**
 * toggles the public / private status of the item or giftregistry item
 * @param {string} listID - the order model
 * @param {string} itemID - the customer model
 * @param {Object} callback - function to run if the ajax call returns with an
 *                        error so that the checkbox can be reset to it's original state
 */
function updatePublicStatus(listID, itemID, callback) {
    var url = $('#makePublic').data('url');
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
            if (callback && !data.success) { callback(); }
            showResponseMsg(data, null);
        },
        error: function (err) {
            if (callback) { callback(); }
            showResponseMsg(err);
        }
    });
}

/**
  * Create an alert to display the error message
  * @param {Object} message - Error message to display
  */
function createErrorNotification(message) {
    var errorHtml = '<div class="alert alert-danger alert-dismissible valid-cart-error '
    + 'fade show" role="alert">'
    + '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'
    + '<span aria-hidden="true">&times;</span>'
    + '</button>' + message + '</div>';

    $('.error-messaging').append(errorHtml);
}

var createGiftRegistry = {
    initialize: function (dateFormat) {
        dateValidation.handleDateInput(dateFormat);
        var steps = [
            {
                state: 'edit',
                action: $('.validate-event-info'),
                fieldset: $('.event-and-registrant'),
                summary: $('.event-and-registrant-summary'),
                editButton: $('.event-and-registrant-summary .edit-button'),
                submit: function (step, success, failure) {
                    var url = $(step.action).closest('fieldset').data('action');
                    var formData = dateValidation.serializeData($('.create-gift-registry-form'));

                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        data: formData,
                        success: success,
                        error: failure
                    });
                },
                populateSummary: function (step, payload) {
                    var eventForm = payload.giftRegistryEvent.eventForm;
                    var registrantForm = payload.giftRegistryEvent.registrantForm;
                    var coRegistrantForm = payload.giftRegistryEvent.coRegistrantForm;

                    // populate summary
                    $('.event-name-summary').text(eventForm.eventName);
                    $('.event-date-summary').text(eventForm.eventDate);
                    $('.event-country-summary').text(eventForm.eventCountry);
                    $('.event-city-summary').text(eventForm.eventCity);

                    if (eventForm.eventState) {
                        $('.event-state-summary').text(eventForm.eventState);
                    }

                    $('.registrant-summary .registrant-role-summary').text(registrantForm.role);
                    $('.registrant-summary .registrant-first-name-summary').text(registrantForm.firstName);
                    $('.registrant-summary .registrant-last-name-summary').text(registrantForm.lastName);
                    $('.registrant-summary .registrant-email-summary').text(registrantForm.email);

                    if (coRegistrantForm) {
                        $('.co-registrant-summary-row').removeClass('d-none');

                        $('.co-registrant-summary .registrant-role-summary').text(coRegistrantForm.role);
                        $('.co-registrant-summary .registrant-first-name-summary').text(coRegistrantForm.firstName);
                        $('.co-registrant-summary .registrant-last-name-summary').text(coRegistrantForm.lastName);
                        $('.co-registrant-summary .registrant-email-summary').text(coRegistrantForm.email);
                    }
                }
            },
            {
                state: 'none',
                action: $('.validate-shipping-info'),
                fieldset: $('.event-shipping'),
                summary: $('.event-shipping-summary'),
                editButton: $('.event-shipping-summary .edit-button'),
                submit: function (step, success, failure) {
                    var url = $(step.action).closest('fieldset').data('action');
                    var formData = $('.create-gift-registry-form').serialize();

                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        data: formData,
                        success: success,
                        error: failure
                    });
                },
                populateSummary: function (step, payload) {
                    var preShippingAddress = payload.preEventShippingAddress;
                    var postShippingAddress = payload.postEventShippingAddress;

                    // populate summary'
                    $('.pre-event-shipping-summary .lname').text(preShippingAddress.lastName.htmlValue);
                    $('.pre-event-shipping-summary .fname').text(preShippingAddress.firstName.htmlValue);
                    $('.pre-event-shipping-summary .summary-addr-1').text(preShippingAddress.address1.htmlValue);
                    $('.pre-event-shipping-summary .summary-addr-2').text(preShippingAddress.address2.htmlValue);
                    $('.pre-event-shipping-summary .city').text(preShippingAddress.city.htmlValue);
                    $('.pre-event-shipping-summary .zip').text(preShippingAddress.postalCode.htmlValue);
                    $('.pre-event-shipping-summary .phone').text(preShippingAddress.phone.htmlValue);
                    $('.pre-event-shipping-summary .address-tittle-summary').text(preShippingAddress.addressId.htmlValue);

                    if (preShippingAddress.states) {
                        $('.pre-event-shipping-summary .state').text(preShippingAddress.states.stateCode.htmlValue);
                    }

                    if (payload.hasPostShippingAddress) {
                        $('.post-event-shipping-summary-row').removeClass('d-none');

                        $('.post-event-shipping-summary .lname').text(postShippingAddress.lastName.htmlValue);
                        $('.post-event-shipping-summary .fname').text(postShippingAddress.firstName.htmlValue);
                        $('.post-event-shipping-summary .summary-addr-1').text(postShippingAddress.address1.htmlValue);
                        $('.post-event-shipping-summary .summary-addr-2').text(postShippingAddress.address2.htmlValue);
                        $('.post-event-shipping-summary .city').text(postShippingAddress.city.htmlValue);
                        $('.post-event-shipping-summary .zip').text(postShippingAddress.postalCode.htmlValue);
                        $('.post-event-shipping-summary .phone').text(postShippingAddress.phone.htmlValue);
                        $('.post-event-shipping-summary .address-tittle-summary').text(postShippingAddress.addressId.htmlValue);

                        if (postShippingAddress.states) {
                            $('.post-event-shipping-summary .state').text(postShippingAddress.states.stateCode.htmlValue);
                        }
                    }
                }
            },
            {
                state: 'none',
                action: $('.create-registry-action'),
                fieldset: $('.preview'),
                summary: null,
                editButton: null,
                success: function (data) {
                    if (data.success) {
                        window.location = data.url;
                    } else {
                        giftRegistryLib.switchState(steps[data.index], steps, data.index);

                        if (data.addressAlreadyExists) {
                            var $shippingAddressField = $('#dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress');
                            $shippingAddressField.addClass('is-invalid');
                            $shippingAddressField.siblings('.invalid-feedback').text(data.errorMsg);
                        }

                        if (data.postAddressAlreadyExists) {
                            var $postShippingAddressField = $('#dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress');
                            $postShippingAddressField.addClass('is-invalid');
                            $postShippingAddressField.siblings('.invalid-feedback').text(data.errorMsg);
                        }

                        if (!data.addressAlreadyExists && !data.postAddressAlreadyExists) {
                            $('.failedAttempt').text(data.errorMsg);
                            $('.failedAttempt').removeClass('d-none');
                        }
                    }
                },
                submit: function (step, success, failure) {
                    var url = $('.create-registry-action').data('url');
                    var formData = $('.create-gift-registry-form').serialize();
                    $.ajax({
                        url: url,
                        type: 'POST',
                        dataType: 'json',
                        data: formData,
                        success: success,
                        error: failure
                    });
                }
            }
        ];

        giftRegistryLib.initialize(steps, $('.create-gift-registry-form'));
    }
};

/**
 * @param {Object} $elementAppendTo - The element to append error html to
 * @param {string} msg - The error message
 * display error message if remove gift registry failed
 */
function displayErrorMessage($elementAppendTo, msg) {
    if ($('.remove-gift-registry-error-messages').length === 0) {
        $elementAppendTo.append(
            '<div class="remove-gift-registry-error-messages "></div>'
        );
    }
    $('.remove-gift-registry-error-messages')
        .append('<div class="remove-gift-registry-error-alert text-center alert-danger">' + msg + '</div>');

    setTimeout(function () {
        $('.remove-gift-registry-error-messages').remove();
    }, 3000);
}

/**
 * Generates the modal window on the first call.
 *
 */
function getModalHtmlElement() {
    if ($('#editGiftRegistryProductModal').length !== 0) {
        $('#editGiftRegistryProductModal').remove();
    }
    var htmlString = '<!-- Modal -->'
        + '<div class="modal fade" id="editGiftRegistryProductModal" role="dialog">'
        + '<span class="enter-message sr-only" ></span>'
        + '<div class="modal-dialog quick-view-dialog">'
        + '<!-- Modal content-->'
        + '<div class="modal-content">'
        + '<div class="modal-header">'
        + '    <button type="button" class="close pull-right" data-dismiss="modal">'
        + '        <span aria-hidden="true">&times;</span>'
        + '        <span class="sr-only"> </span>'
        + '    </button>'
        + '</div>'
        + '<div class="modal-body"></div>'
        + '<div class="modal-footer"></div>'
        + '</div>'
        + '</div>'
        + '</div>';
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
    $('#editGiftRegistryProductModal').spinner().start();

    $.ajax({
        url: editProductUrl,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            var parsedHtml = parseHtml(data.renderedTemplate);

            $('#editGiftRegistryProductModal .modal-body').empty();
            $('#editGiftRegistryProductModal .modal-body').html(parsedHtml.body);
            $('#editGiftRegistryProductModal .modal-footer').html(parsedHtml.footer);
            $('#editGiftRegistryProductModal .modal-header .close .sr-only').text(data.closeButtonText);
            $('#editGiftRegistryProductModal .enter-message').text(data.enterDialogMessage);
            $('#editGiftRegistryProductModal').modal('show');
            $('body').trigger('giftregistryproduct:ready');
            $.spinner().stop();
        },
        error: function () {
            $('#editGiftRegistryProductModal').spinner().stop();
        }
    });
}

module.exports = function (dateFormat) {
    // initialize app
    $(document).ready(function () {
        createGiftRegistry.initialize(dateFormat);

        $('.hasCoRegistrant').on('change', function (e) {
            e.preventDefault();

            if (this.checked) {
                $('.co-registrant-row').removeClass('d-none');
            } else {
                $('.co-registrant-row').addClass('d-none');
                $('.co-registrant-summary-row').addClass('d-none');
            }
        });

        $('.hasPostShippingAddress').on('change', function (e) {
            e.preventDefault();

            if (this.checked) {
                $('.post-event-shipping-row').removeClass('d-none');
            } else {
                $('.post-event-shipping-row').addClass('d-none');
                $('.post-event-shipping-summary-row').addClass('d-none');
            }
        });

        $('.grAddressSelector').on('change', function (e) {
            e.preventDefault();

            var $selectedOption = $(this).find(':selected');
            var $form = $(this).parent().siblings('.event-shipping-form');

            handleGiftRegistryAddressForms($form, $selectedOption);
        });

        $('body').on('click', '.remove-gift-registry', function (e) {
            e.preventDefault();
            $('.gift-registry-to-remove').empty().text($(this).data('name'));
            var url = $(this).data('url');
            var $deleteConfirmBtn = $('.gift-registry-remove-confirmation-btn');
            $deleteConfirmBtn.data('action', url);
            $deleteConfirmBtn.data('name', $('.gift-registry-to-remove').data('name'));
        });

        $('body').on('click', '.gift-registry-remove-confirmation-btn', function (f) {
            f.preventDefault();
            var $manageList = $('.gift-registry-manage-list');

            $manageList.spinner().start();

            var url = $(this).data('action');

            $.ajax({
                url: url,
                type: 'get',
                dataType: 'json',
                success: function (data) {
                    $manageList.empty();
                    $manageList.append(data.renderHTML);
                    if (data.listIsEmpty === 0) {
                        $('.gift-registry-not-found-footer').removeClass('d-none');
                        $('.gift-registry-footer-border').addClass('d-none');
                    }
                    $manageList.spinner().stop();
                },
                error: function (error) {
                    if (error.responseJSON.redirectUrl) {
                        window.location.href = error.responseJSON.redirectUrl;
                    } else {
                        var $elToAppend = $manageList;
                        $elToAppend.spinner().stop();
                        var msg = $elToAppend.data('error-msg');
                        displayErrorMessage($elToAppend, msg);
                    }
                }
            });
        });

        $('body').on('click', '.clear-list-btn', function (e) {
            e.preventDefault();
            var url = $(this).data('url');
            $('.gift-registry-clear-list-confirmation-btn').data('action', url);
        });

        $('body').on('click', '.gift-registry-clear-list-confirmation-btn', function (e) {
            e.preventDefault();
            var $elToAppend = $('.gr-item-cards');
            $elToAppend.spinner().start();
            var url = $(this).data('action');

            $.ajax({
                url: url,
                type: 'get',
                dataType: 'json',
                success: function (data) {
                    if (data.listIsEmpty) {
                        $elToAppend.empty();
                        $('.add-items-to-gift-registry').removeClass('d-none');
                        $('.clear-list-btn').addClass('d-none');
                        $elToAppend.spinner().stop();
                        $('.modal-backdrop').remove();
                    }
                },
                error: function (err) {
                    if (err.responseJSON.redirectUrl) {
                        window.location.href = err.responseJSON.redirectUrl;
                    } else {
                        createErrorNotification(err.responseJSON.errorMessage);
                        $elToAppend.spinner().stop();
                    }
                }
            });
        });

        $('body').on('click', '.giftregistry-form-check-input', function () {
            var listID = $('#isPublicList').data('id');
            updatePublicStatus(listID, null, null);
        });

        $('body').on('click', '.giftregistry-item-checkbox', function () {
            var itemID = $(this).closest('.giftregistry-hide').find('.custom-control-input').data('id');
            var el = $(this).siblings('input');
            var resetCheckBox = function () {
                return el.prop('checked')
                    ? el.prop('checked', false)
                    : el.prop('checked', true);
            };

            updatePublicStatus(null, itemID, resetCheckBox);
        });

        $('body').on('click', '.add-to-cart', function () {
            $.spinner().start();

            var pid = $(this).data('pid');
            var url = $(this).data('url');
            var plid = $(this).data('list-id');
            var qty = $(this).closest('.product-info').find('.quantity').val();

            var formData = {
                pid: pid,
                qty: qty,
                plid: plid
            };

            if (url) {
                $.ajax({
                    url: url,
                    method: 'POST',
                    data: formData,
                    success: function (data) {
                        showResponseMsg(data);
                        $('.minicart').trigger('count:update', data);
                        $('body').trigger('cart:update');
                        base.miniCartReportingUrl(data.reportingURL, data.error);
                    },
                    error: function (err) {
                        showResponseMsg(err);
                    }
                });
            }
        });

        $('body').on('click', '.remove-item-from-gift-registry', function (e) {
            e.preventDefault();
            $('.gift-registry-item-to-remove').empty().append($(this).data('name'));

            var url = $(this).data('url');
            var $deleteConfirmBtn = $('.gift-registry-item-remove-confirmation-btn');
            $deleteConfirmBtn.data('action', url);
        });

        $('body').on('click', '.gift-registry-item-remove-confirmation-btn', function (e) {
            e.preventDefault();

            $('.gr-item-cards').spinner().start();
            var url = $(this).data('action');

            $.ajax({
                url: url,
                type: 'get',
                dataType: 'json',
                data: {},
                success: function (data) {
                    $('.uuid-' + data.UUID).remove();
                    if (data.listIsEmpty) {
                        var html = '<div class="row justify-content-center">'
                        + '<a href=' + data.addNewItemURL + '>' + data.addNewItemText + '</a>'
                        + '</div>';
                        $('#eventInfo').append(html);
                        $('.clear-list-btn').addClass('d-none');
                    }

                    if (data.renderHTML) {
                        $('.gr-item-cards .card').add('.more-gr-list-items').remove();
                        $('.gr-item-cards').append(data.renderHTML);
                    }
                    $('.gr-item-cards').spinner().stop();
                },
                error: function (error) {
                    if (error.responseJSON.redirectUrl) {
                        window.location.href = error.responseJSON.redirectUrl;
                    } else {
                        var $elToAppend = $('.gr-item-cards');
                        $elToAppend.spinner().stop();
                        var msg = $elToAppend.data('error-msg');
                        displayErrorMessage($elToAppend, msg);
                    }
                }
            });
        });

        $('body').on('click', '.edit-gr-item .edit', function (e) {
            e.preventDefault();

            var editProductUrl = $(this).attr('href');
            $(e.target).trigger('giftregistryproduct:show');
            getModalHtmlElement();
            fillModalElement(editProductUrl);
        });

        $('body').on('shown.bs.modal', '#editGiftRegistryProductModal', function () {
            $('#editGiftRegistryProductModal').siblings().attr('aria-hidden', 'true');
            $('#editGiftRegistryProductModal .close').focus();
        });

        $('body').on('hidden.bs.modal', '#editGiftRegistryProductModal', function () {
            $('#editGiftRegistryProductModal').siblings().attr('aria-hidden', 'false');
        });

        $('body').on('keydown', '#editGiftRegistryProductModal', function (e) {
            var focusParams = {
                event: e,
                containerSelector: '#editGiftRegistryProductModal',
                firstElementSelector: '.close',
                lastElementSelector: '.btn-update-gift-registry-product',
                nextToLastElementSelector: '.modal-footer .quantity-select'
            };
            focusHelper.setTabNextFocus(focusParams);
        });

        $('body').on('change', '.quantity-select', function () {
            var selectedQuantity = $(this).val();
            $('.modal.show .update-gift-registry-url').data('selected-quantity', selectedQuantity);
        });

        $('body').on('click', '.btn-update-gift-registry-product', function (e) {
            e.preventDefault();

            var updateButtonBlock = $(this).closest('.gift-registry-item-update-button-block').find('.update-gift-registry-url');
            var updateProductUrl = updateButtonBlock.val();
            var uuid = updateButtonBlock.data('uuid');
            var id = updateButtonBlock.data('id');
            var selectedQuantity = $(this).closest('.gift-registry-item-update-button-block').find('.update-gift-registry-url').data('selected-quantity');

            var form = {
                uuid: uuid,
                id: id,
                pid: base.getPidValue($(this)),
                quantityDesired: selectedQuantity
            };

            $('#editGiftRegistryProductModal').spinner().start();

            if (updateProductUrl) {
                var modal;
                $.ajax({
                    url: updateProductUrl,
                    type: 'post',
                    context: this,
                    data: form,
                    dataType: 'json',
                    success: function (data) {
                        $('.gr-item-cards .card').add('.more-gr-list-items').remove();
                        $('.gr-item-cards').append(data.giftRegistryList);
                        modal = '#editGiftRegistryProductModal';
                        $(modal).spinner().stop();
                        $(modal).remove();
                        $('.modal-backdrop').remove();
                        $('body').removeClass('modal-open');

                        $('.product-info .edit-gr-item .edit:first').focus();
                    },
                    error: function (error) {
                        if (error.responseJSON.redirectUrl) {
                            window.location.href = error.responseJSON.redirectUrl;
                        } else {
                            var err = {
                                success: false,
                                msg: $('.btn-update-gift-registry-product').data('error-msg')
                            };

                            $(modal).spinner().stop();
                            $(modal).remove();
                            $('.modal-backdrop').remove();
                            $('body').removeClass('modal-open');

                            showResponseMsg(err);
                        }
                    }
                });
            }
        });

        $('body').on('click', '.edit-gr-link', function () {
            var $card = $(this).parents('.card');
            $card.find('.edit-form').removeClass('d-none');
            $card.find('form .gr-edit-form').removeClass('d-none');
            $card.find('.event-summary').addClass('d-none');
            $(this).addClass('d-none');
        });

        $('body').on('click', '.edit-event-btns .cancel', function () {
            var $card = $(this).parents('.card');
            $card.find('.edit-form').addClass('d-none');
            $card.find('.event-summary').removeClass('d-none');
            $card.find('.edit-gr-link').removeClass('d-none');
            if ($(this).parents('.add-co-registrant').length > 0) {
                $(this).parents('.card').addClass('no-co-registrant').removeClass('add-co-registrant');
            }
            if ($(this).parents('.add-post-event-address').length > 0) {
                $(this).parents('.card').addClass('no-post-event-address').removeClass('add-post-event-address');
            }
        });

        $('body').on('click', '.no-co-registrant .event-add-button', function () {
            $(this).parents('.card').addClass('add-co-registrant').removeClass('no-co-registrant');
        });

        $('body').on('click', '.no-post-event-address .event-add-button', function () {
            $(this).parents('.card').addClass('add-post-event-address').removeClass('no-post-event-address');
        });

        $('body').on('click', '#registryInfo .card button.edit', function () {
            $(this).parents('form');
            var $form = $(this).parents('.card-body').find('form');
            var formData = $form.serialize();
            var url = $('#registryInfo').data('edit-url');
            var formToReset = $form.find('.eventFormType').val();
            var registryID = $('#registryInfo').data('id');
            var $eventSummary = $(this).parents('.card-body').find('.event-summary');
            var $editForm = $(this).parents('.card-body').find('.edit-form');
            var $editLink = $(this).parents('.card').find('.card-header .edit-button');
            formData = formData + '&registryID=' + registryID;
            var addressID;
            var addressUUID;
            if (formToReset === 'preEvent' || formToReset === 'postEvent') {
                addressID = $editForm.find('.grAddressSelector').val();
                addressUUID = $editForm.find('.grAddressSelector').find(':selected').data('uuid');
                formData = formData + '&addressID=' + addressID + '&addressUUID=' + addressUUID;
            }
            $.spinner().start();
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: formData,
                success: function (response) {
                    if (Object.keys(response.fields).length > 0) {
                        formValidation($form, response);
                    } else {
                        $editForm.find('.invalid-feedback').text('');
                        $editForm.find('.is-invalid').removeClass('is-invalid');
                        $eventSummary.removeClass('d-none');
                        $editForm.addClass('d-none');
                        $editLink.removeClass('d-none');
                        switch (formToReset) {
                            case 'event':
                                $('.event-name-summary').text(response.data.eventName);
                                $('.event-name').text(response.data.eventName);
                                $('.event-country-summary').text(response.data.eventCountry);
                                $('.event-date-summary').text(response.data.eventDate);
                                $('.event-state-summary').text(response.data.eventState);
                                $('.event-city-summary').text(response.data.eventCity);
                                break;
                            case 'registrant':
                                $('.registrant-summary .registrant-role-summary').text(response.data.role);
                                $('.registrant-summary .registrant-first-name-summary').text(response.data.firstName);
                                $('.registrant-summary .registrant-last-name-summary').text(response.data.lastName);
                                $('.registrant-summary .registrant-email-summary').text(response.data.email);
                                break;
                            case 'coRegistrant':
                                $('.co-registrant-summary .registrant-role-summary').text(response.data.role);
                                $('.co-registrant-summary .registrant-first-name-summary').text(response.data.firstName);
                                $('.co-registrant-summary .registrant-last-name-summary').text(response.data.lastName);
                                $('.co-registrant-summary .registrant-email-summary').text(response.data.email);
                                break;
                            case 'preEvent':
                                $('.pre-event-shipping-summary .address-tittle-summary').text(response.data.id);
                                $('.pre-event-shipping-summary .fname').text(response.data.firstName);
                                $('.pre-event-shipping-summary .lname').text(response.data.lastName);
                                $('.pre-event-shipping-summary .summary-addr-1').text(response.data.address1);
                                $('.pre-event-shipping-summary .summary-addr-2').text(response.data.address2);
                                $('.pre-event-shipping-summary .city').text(response.data.city);
                                $('.pre-event-shipping-summary .zip').text(response.data.postalCode);
                                $('.pre-event-shipping-summary .state').text(response.data.stateCode);
                                $('.pre-event-shipping-summary .phone').text(response.data.phone);
                                $('.pre-event-shipping-summary .address-tittle-summary').text(response.data.id);
                                break;
                            case 'postEvent':
                                $('.post-event-shipping-summary .address-tittle-summary').text(response.data.id);
                                $('.post-event-shipping-summary .fname').text(response.data.firstName);
                                $('.post-event-shipping-summary .lname').text(response.data.lastName);
                                $('.post-event-shipping-summary .summary-addr-1').text(response.data.address1);
                                $('.post-event-shipping-summary .summary-addr-2').text(response.data.address2);
                                $('.post-event-shipping-summary .city').text(response.data.city);
                                $('.post-event-shipping-summary .zip').text(response.data.postalCode);
                                $('.post-event-shipping-summary .state').text(response.data.stateCode);
                                $('.post-event-shipping-summary .phone').text(response.data.phone);
                                $('.post-event-shipping-summary .address-tittle-summary').text(response.data.id);
                                break;
                            // no default
                        }
                    }

                    if (formToReset === 'postEvent' || formToReset === 'preEvent') {
                        $('.grAddressSelector option').each(function () {
                            if ($(this).data('uuid') === response.addressUUID) {
                                if ($(this).is(':selected')) {
                                    var $thisForm = $(this).parents('form');
                                    $thisForm.find('.addressID').val(response.editedAddress.address.addressId);
                                    $thisForm.find('.firstName').val(response.editedAddress.address.firstName);
                                    $thisForm.find('.lastName').val(response.editedAddress.address.lastName);
                                    $thisForm.find('.address1').val(response.editedAddress.address.address1);
                                    $thisForm.find('.address2').val(response.editedAddress.address.address2);
                                    $thisForm.find('.city_address').val(response.editedAddress.address.city);
                                    $thisForm.find('.postalCode').val(response.editedAddress.address.postalCode);
                                    $thisForm.find('.phone_address').val(response.editedAddress.address.phone);
                                    $thisForm.find('.stateCode').val(response.editedAddress.address.stateCode);
                                    $thisForm.find('.country').val(response.editedAddress.address.countryCode.value);
                                    $thisForm.find('.is-invalid').removeClass('is-invalid');
                                    $thisForm.find('.invalid-feedback').text('');

                                    var $thisSummary = $thisForm.parents('.card').find('.event-summary');
                                    $thisSummary.find('.address-tittle-summary').text(response.editedAddress.address.ID);
                                    $thisSummary.find('.fname').text(response.editedAddress.address.firstName);
                                    $thisSummary.find('.lname').text(response.editedAddress.address.lastName);
                                    $thisSummary.find('.summary-addr-1').text(response.editedAddress.address.address1);
                                    $thisSummary.find('.summary-addr-2').text(response.editedAddress.address.address2);
                                    $thisSummary.find('.state').text(response.editedAddress.address.stateCode);
                                    $thisSummary.find('.city').text(response.editedAddress.address.city);
                                    $thisSummary.find('.zip').text(response.editedAddress.address.postalCode);
                                    $thisSummary.find('.phone').text(response.editedAddress.address.phone);
                                }

                                $(this).data('address-title', response.editedAddress.address.ID);
                                $(this).data('first-name', response.editedAddress.address.firstName);
                                $(this).data('last-name', response.editedAddress.address.lastName);
                                $(this).data('address1', response.editedAddress.address.address1);
                                $(this).data('address2', response.editedAddress.address.address2);
                                $(this).data('city', response.editedAddress.address.city);
                                $(this).data('postal-code', response.editedAddress.address.postalCode);
                                $(this).data('phone', response.editedAddress.address.phone);
                                $(this).data('state-code', response.editedAddress.address.stateCode);
                                $(this).data('country-code', response.editedAddress.address.countryCode.value);
                                $(this).val(response.editedAddress.address.ID);
                                $(this).text(response.editedAddressLabel);
                            }
                        });
                    }
                    if (response.newAddress) {
                        var uuidToRemove = response.editedAddress.UUID;
                        $('.grAddressSelector').each(function () {
                            $(this).find('[data-uuid="' + uuidToRemove + '"]').remove();
                            $(this).append(response.renderedOption);
                        });
                        $form.find('.grAddressSelector').val(response.editedAddress.address.ID);
                    }
                    $form.parents('.card').removeClass('add-post-event-address');
                    $form.parents('.card').removeClass('add-co-registrant');
                    $form.parents('.card').find('.event-add-button').remove();
                    $.spinner().stop();
                },
                error: function (error) {
                    if (error.responseJSON.redirectUrl) {
                        window.location.href = error.responseJSON.redirectUrl;
                    }

                    $.spinner().stop();
                }
            });
        });

        $('body').on('click', '.search-registries', function (e) {
            e.preventDefault();

            $('.search-for-gr').find('.is-invalid').removeClass('is-invalid');

            if (!$('.search-first-name').val() || !$('.search-last-name').val()) {
                if (!$('.search-last-name').val()) {
                    $('.search-last-name').addClass('is-invalid');
                    $('.search-last-name').siblings('.invalid-feedback').html($('.search-last-name').data('missing-msg'));
                }
                if (!$('.search-first-name').val()) {
                    $('.search-first-name').addClass('is-invalid');
                    $('.search-first-name').siblings('.invalid-feedback').html($('.search-first-name').data('missing-msg'));
                }
                return false;
            }

            $('.gift-registry-landing-page').spinner().start();
            var url = $(this).data('url');
            $('.gr-search-results-count span').addClass('d-none');
            $('.no-results-msg').addClass('d-none');
            $('.no-results-div a').addClass('d-none');

            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: $('.search-for-gr').serialize(),
                success: function (data) {
                    $('.gift-registry-landing-page .gr-search-results .card').remove();
                    $('.gift-registry-landing-page .gr-search-results .more-managed-lists').remove();
                    $('.gr-search-results-header').removeClass('d-none');
                    if (Object.prototype.hasOwnProperty.call(data.results, 'hits')) {
                        data.results.hits.forEach(function (hit) {
                            var $resultsDiv = $('.gr-result-template').clone();
                            $resultsDiv.removeClass('gr-result-template');

                            if (hit.coRegistrant) {
                                $resultsDiv.find('.co-registrant .text').text(hit.coRegistrant.name);
                            } else {
                                $resultsDiv.find('.co-registrant').remove();
                            }

                            $resultsDiv.find('.card-header h3').text(hit.name);
                            $resultsDiv.find('.registrant .text').text(hit.registrant.name);
                            $resultsDiv.find('.event-location .text').text(hit.location);
                            $resultsDiv.find('.event-date .text').text(hit.dateString);
                            $resultsDiv.find('.view-gr').data('url', hit.url);
                            $('.gift-registry-landing-page .response .gr-search-results').append($resultsDiv);
                            $resultsDiv.removeClass('d-none');
                        });

                        if (data.moreResults) {
                            var $moreButton = $('.more-btn-template').clone();
                            $moreButton.removeClass('more-btn-template');
                            $moreButton.addClass('more-search-results');
                            $moreButton.removeClass('d-none');
                            $('.gift-registry-landing-page .response .gr-search-results').append($moreButton);
                        }
                        $('.gr-search-results-number').text(data.results.total);

                        if (data.results.hits.length === 0) {
                            $('.no-results-msg').removeClass('d-none');
                        }
                    }

                    $('.no-results-div a').removeClass('d-none');
                    $('html, body').animate({
                        scrollTop: $('.gr-search-results-header').offset().top
                    }, 400);

                    if (data.results.hits && data.results.hits.length === 1) {
                        $('.gr-search-results-count span.gr-search-result-text').removeClass('d-none');
                    } else if (data.results.hits && data.results.hits.length > 1) {
                        $('.gr-search-results-count span.gr-search-results-number').removeClass('d-none');
                        $('.gr-search-results-count span.gr-search-results-text').removeClass('d-none');
                    }

                    $('.response').data('first-name', $('#searchFirstName').val());
                    $('.response').data('last-name', $('#searchLastName').val());
                    $('.response').data('month', $('#searchEventMonth').val());
                    $('.response').data('year', $('#searchEventYear').val());
                    $('.response').data('email', $('#searchGREmail').val());
                    $('.response').data('name', $('#searchGRName').val());
                    $('.response').data('city', $('#searchGRCity').val());
                    $('.response').data('state', $('#searchGRState').val());
                    $('.response').data('country', $('#searchGRCountry').val());
                    $('.response').data('total', data.results.total);

                    $('.gift-registry-landing-page').spinner().stop();
                },
                error: function () {
                    $('.gift-registry-landing-page').spinner().stop();
                }
            });
            return true;
        });

        $('body').on('click', '.view-gr', function () {
            window.location = $(this).data('url');
        });

        $('body').on('click', '.no-results-div a', function (e) {
            e.preventDefault();
            location.reload();
        });

        $('body').on('click', '.advanced-search-toggle', function (e) {
            e.preventDefault();
            if ($('.advanced-icon').hasClass('fa-plus')) {
                $('.advanced-icon').removeClass('fa-plus');
                $('.advanced-icon').addClass('fa-minus');
                $('.advanced-search').removeClass('d-none');
                $('.js-toggler').attr('aria-expanded', 'true');
            } else if ($('.advanced-icon').hasClass('fa-minus')) {
                $('.advanced-icon').addClass('fa-plus');
                $('.advanced-icon').removeClass('fa-minus');
                $('.advanced-search').addClass('d-none');
                $('.js-toggler').attr('aria-expanded', 'false');
            }
        });

        $('body').on('click', '.more-search-results', function (e) {
            e.preventDefault();
            $.ajax({
                url: $('.response').data('url'),
                method: 'get',
                data: {
                    pageNumber: parseInt($('.response').data('page-number'), 10) + 1,
                    pageSize: $('.response').data('page-size'),
                    country: $('.response').data('country'),
                    state: $('.response').data('state'),
                    city: $('.response').data('city'),
                    name: $('.response').data('name'),
                    email: $('.response').data('email'),
                    year: $('.response').data('year'),
                    month: $('.response').data('month'),
                    lastName: $('.response').data('last-name'),
                    firstName: $('.response').data('first-name')
                }
            }).done(function (data) {
                $('.more-search-results').remove();
                $('.response').data('page-number', data.pageNumber);

                if (Object.prototype.hasOwnProperty.call(data.results, 'hits')) {
                    data.results.hits.forEach(function (hit) {
                        var $resultsDiv = $('.gr-result-template').clone();
                        $resultsDiv.removeClass('gr-result-template');
                        if (hit.coRegistrant) {
                            $resultsDiv.find('.co-registrant .text').text(hit.coRegistrant.name);
                        } else {
                            $resultsDiv.find('.co-registrant').remove();
                        }
                        $resultsDiv.find('.card-header h3').text(hit.name);
                        $resultsDiv.find('.registrant .text').text(hit.registrant.name);
                        $resultsDiv.find('.event-location .text').text(hit.location);
                        $resultsDiv.find('.event-date .text').text(hit.dateString);
                        $resultsDiv.find('.view-gr').data('url', hit.url);
                        $('.gift-registry-landing-page .response .gr-search-results').append($resultsDiv);
                        $resultsDiv.removeClass('d-none');
                    });

                    if (data.moreResults) {
                        var $moreButton = $('.more-btn-template').clone();
                        $moreButton.removeClass('more-btn-template');
                        $moreButton.addClass('more-search-results');
                        $moreButton.removeClass('d-none');
                        $('.gift-registry-landing-page .response .gr-search-results').append($moreButton);
                    }
                }
            }).fail(function () {
                $('.more-search-results').remove();
            });
        });

        $('body').on('click', '.card-manage-gift-registry .more-managed-lists', function (e) {
            e.preventDefault();
            var pageNumber = $(this).data('pagenumber');
            var pageSize = $(this).data('pagesize');

            $.ajax({
                url: $(this).data('url'),
                method: 'get',
                data: {
                    pageNumber: pageNumber,
                    publicView: $(this).data('public'),
                    pageSize: pageSize
                },
                success: function (data) {
                    $('.gift-registry-manage-list').append(data);
                    var test = $('.more-managed-lists').data('total');
                    if ((pageNumber * pageSize) >= test) {
                        $('.more-managed-lists').remove();
                    } else {
                        $('.more-managed-lists').data('pagenumber', (pageNumber + 1));
                    }
                },
                error: function () {
                    $('.more-managed-lists').remove();
                }
            });
        });

        $('body').on('click', '.more-gr-list-items', function (e) {
            e.preventDefault();
            var pageNumber = $(this).data('page-number');
            var pageSize = $(this).data('page-size');
            var listID = $('.registryInfo').data('id');
            $.spinner().start();

            $.ajax({
                url: $(this).data('url'),
                method: 'get',
                dataType: 'html',
                data: {
                    pageNumber: pageNumber,
                    publicView: $(this).data('public'),
                    pageSize: pageSize,
                    id: listID
                },
                success: function (data) {
                    $('.more-gr-list-items').remove();
                    $('body .gr-item-cards').append(data);
                    $.spinner().stop();
                },
                error: function () {
                    $('.more-gr-list-items').remove();
                    $.spinner().stop();
                }
            });
        });
    });
};
