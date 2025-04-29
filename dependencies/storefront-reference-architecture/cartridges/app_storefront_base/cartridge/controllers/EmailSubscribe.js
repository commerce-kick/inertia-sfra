'use strict';

/**
 * @namespace EmailSubscribe
 */

var server = require('server');

/**
 * EmailSubscribe-Subscribe : The EmailSubscribe-Subscribe enpoint allows the shopper to submit their eamil address to be added to a mailing list. OOB SFRA does not have a mailing list feature however this endpoint call a hook would allow for a customer to easily allow for custiomization
 * @name Base/EmailSubscribe-Subscribe
 * @function
 * @memberof EmailSubscribe
 * @param {httpparameter} - emailId - Input field, The shopper's email address
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post('Subscribe', function (req, res, next) {
    var Resource = require('dw/web/Resource');
    var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');

    var email = req.form.emailId;
    var isValidEmail;
    if (email) {
        isValidEmail = emailHelpers.validateEmail(email);

        if (isValidEmail) {
            hooksHelper('app.mailingList.subscribe', 'subscribe', [email], function () {});
            res.json({
                success: true,
                msg: Resource.msg('subscribe.email.success', 'homePage', null)
            });
        } else {
            res.json({
                error: true,
                msg: Resource.msg('subscribe.email.invalid', 'homePage', null)
            });
        }
    } else {
        res.json({
            error: true,
            msg: Resource.msg('subscribe.email.invalid', 'homePage', null)
        });
    }

    next();
});

module.exports = server.exports();
