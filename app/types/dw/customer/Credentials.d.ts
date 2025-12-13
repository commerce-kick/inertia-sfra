import Status = require('../system/Status');

declare class Credentials {
    authenticationProviderID  :  string;
    enabled  :  boolean;
    enabledFlag  :  boolean;
    externalID  :  string;
    locked  :  boolean;
    login  :  string;
    passwordAnswer  :  string;
    passwordQuestion  :  string;
    remainingLoginAttempts  :  number;

}

export = Credentials;
