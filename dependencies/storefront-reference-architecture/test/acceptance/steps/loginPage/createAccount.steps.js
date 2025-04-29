'use strict';

const { I, data, loginPage } = inject();

var generateRandomString = function (length) {
    var randomString = '';
    var characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    var counter = 0;
    while (counter < length) {
        randomString += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
        counter += 1;
    }
    return randomString;
};

Then('shopper is able to click tab to create account', () => {
    I.click(loginPage.locators.createAccount);
});

Then('shopper is able fill out registration information with new email', () => {
    var newEmail = data.login.newRegEmail + generateRandomString(8);
    loginPage.createAccount(data.login.fName, data.login.lName, data.login.phone, newEmail, data.login.password);
});

Then('shopper is able fill out registration information with existing email', () => {
    loginPage.createAccount(data.login.fName, data.login.lName, data.login.phone, data.login.email, data.login.password);
});

Then('shopper is able to click the create account button', () => {
    I.click(locate(loginPage.locators.primaryButton).withText('Create Account'));
    // TODO If you see an error then we'll know it's good, but it's also good if you see a dashboard
});

Then('shopper sees a username is invalid error', () => {
    I.see(data.login.registrationError);
});

Then('shopper does not see a username is invalid error', () => {
    I.dontSee(data.login.registrationError);
});
