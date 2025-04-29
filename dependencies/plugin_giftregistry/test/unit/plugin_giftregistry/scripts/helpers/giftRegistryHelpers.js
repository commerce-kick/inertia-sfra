'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var ArrayList = require('../../../../mocks/dw.util.Collection');
var sinon = require('sinon');

var getProductListStub = sinon.stub();
var addItemStub = sinon.stub();

describe('giftRegistryHelpers', function () {
    var giftRegistryHelpers = proxyquire('../../../../../cartridges/plugin_giftregistry/cartridge/scripts/helpers/giftRegistryHelpers', {
        'dw/customer/ProductListMgr': {
            getProductLists: getProductListStub
        },
        '*/cartridge/scripts/productList/productListHelpers': {
            addItem: addItemStub
        },
        '*/cartridge/models/miniRegistry': proxyquire('../../../../../cartridges/plugin_giftregistry/cartridge/models/miniRegistry', {
            'dw/web/URLUtils': {
                url: function () {
                    return 'someURL';
                }
            }
        }),
        'dw/web/URLUtils': {
            url: function () {
                return 'some url';
            }
        },
        'dw/system/Transaction': {
            wrap: function (item) {
                item();
            }
        }
    });

    var args = encodeURIComponent(JSON.stringify({ pid: '12345', qty: 1 }));
    var argsNoPID = encodeURIComponent(JSON.stringify({}));
    var requestMock;

    beforeEach(function () {
        addItemStub.resetHistory();
        getProductListStub.resetHistory();
        requestMock = {
            querystring: {},
            currentCustomer: {
                raw: {}
            }
        };
    });

    describe('addProductProcessHelper()', function () {
        it('should return object with error when on queryString args', function () {
            var result = giftRegistryHelpers.addProductProcessHelper(requestMock);

            assert.isTrue(result.error);
            assert.isFalse(result.productAdded);
            assert.isFalse(result.multipleRegistries);
        });

        it('should return object with error when on pid', function () {
            requestMock.querystring.args = argsNoPID;
            var result = giftRegistryHelpers.addProductProcessHelper(requestMock);

            assert.isTrue(result.error);
            assert.isFalse(result.productAdded);
            assert.isFalse(result.multipleRegistries);
        });

        it('should not add product when there are no registries', function () {
            requestMock.querystring.args = args;
            getProductListStub.returns(new ArrayList([]));
            var result = giftRegistryHelpers.addProductProcessHelper(requestMock);

            assert.isFalse(result.error);
            assert.isFalse(result.productAdded);
        });

        it('should add product when there is only one registry', function () {
            requestMock.querystring.args = args;
            addItemStub.returns(true);
            getProductListStub.returns(new ArrayList([{}]));
            var result = giftRegistryHelpers.addProductProcessHelper(requestMock);

            assert.isFalse(result.error);
            assert.isTrue(result.productAdded);
        });

        it('should return object with error if error occurred while adding product to list', function () {
            requestMock.querystring.args = args;
            addItemStub.returns(false);
            getProductListStub.returns(new ArrayList([{}]));
            var result = giftRegistryHelpers.addProductProcessHelper(requestMock);

            assert.isTrue(result.error);
            assert.isFalse(result.productAdded);
        });
    });

    describe('selectRegistry', function () {
        it('should return object with error when on queryString args', function () {
            var result = giftRegistryHelpers.selectRegistry(requestMock.currentCustomer, requestMock.querystring);

            assert.isTrue(result.error);
        });

        it('should return object with no error', function () {
            requestMock.querystring.args = {};
            var result = giftRegistryHelpers.selectRegistry(requestMock.currentCustomer, requestMock.querystring);

            assert.isFalse(result.error);
            assert.equal(result.registries.length, 1);
            assert.equal(result.createRegistryLink, 'some url');
        });

        it('should return the mini registry in the ascending order', function () {
            requestMock.querystring.args = {};
            getProductListStub.returns(new ArrayList([{ eventDate: '10/22/2020' }, { eventDate: '10/22/2030' }]));
            var result = giftRegistryHelpers.selectRegistry(requestMock.currentCustomer, requestMock.querystring);

            assert.isFalse(result.error);
            assert.equal(result.registries.length, 2);
            assert.equal(result.registries[0].eventDate, '10/22/2020');
            assert.equal(result.createRegistryLink, 'some url');
        });

        it('should return the mini registry in correct order', function () {
            requestMock.querystring.args = {};
            getProductListStub.returns(new ArrayList([{ eventDate: '10/22/2030' }, { eventDate: '10/22/2020' }]));
            var result = giftRegistryHelpers.selectRegistry(requestMock.currentCustomer, requestMock.querystring);

            assert.isFalse(result.error);
            assert.equal(result.registries.length, 2);
            assert.equal(result.registries[0].eventDate, '10/22/2020');
            assert.equal(result.createRegistryLink, 'some url');
        });

        it('should return the mini registry in correct order when the registry dates are the same', function () {
            requestMock.querystring.args = {};
            getProductListStub.returns(new ArrayList([{ eventDate: '10/22/2030' }, { eventDate: '10/22/2030' }]));
            var result = giftRegistryHelpers.selectRegistry(requestMock.currentCustomer, requestMock.querystring);

            assert.isFalse(result.error);
            assert.equal(result.registries.length, 2);
            assert.equal(result.registries[0].eventDate, '10/22/2030');
            assert.equal(result.createRegistryLink, 'some url');
        });
    });

    describe('checkForExistingAddressID', function () {
        var getAddressStub = sinon.stub();
        var addressBookMock = {
            getAddress: getAddressStub
        };

        beforeEach(function () {
            getAddressStub.resetHistory();
        });

        it('should return true when old and new address ids !== and address exists', function () {
            getAddressStub.returns({});
            var result = giftRegistryHelpers.checkForExistingAddressID('new', 'old', addressBookMock);
            assert.isTrue(result);
        });

        it('should return true when old address ID is new and address exists', function () {
            getAddressStub.returns({});
            var result = giftRegistryHelpers.checkForExistingAddressID('new', 'new', addressBookMock);
            assert.isTrue(result);
        });

        it('should return false address cannot be retrieved', function () {
            getAddressStub.returns(null);
            var result = giftRegistryHelpers.checkForExistingAddressID('new', 'new', addressBookMock);
            assert.isFalse(result);
        });

        it('should return false when ids are the same and old address is not new', function () {
            var result = giftRegistryHelpers.checkForExistingAddressID('random', 'random', addressBookMock);
            assert.isFalse(result);
        });
    });

    describe('edit', function () {
        var setNameSpy = sinon.spy();
        var setEventCitySpy = sinon.spy();
        var setEventDateSpy = sinon.spy();
        var setEventCountrySpy = sinon.spy();
        var setEventStateSpy = sinon.spy();

        var setEmailSpy = sinon.spy();
        var setFirstNameSpy = sinon.spy();
        var setLastNameSpy = sinon.spy();
        var setRoleSpy = sinon.spy();

        var getCoRegistrantStub = sinon.stub();

        var setAddress1Spy = sinon.spy();
        var setAddress2Spy = sinon.spy();
        var setCitySpy = sinon.spy();
        var setStateCodeSpy = sinon.spy();
        var setCountryCodeSpy = sinon.spy();
        var setPostalCodeSpy = sinon.spy();
        var setPhoneSpy = sinon.spy();
        var setIDSpy = sinon.spy();

        var setShippingAddressStub = sinon.stub();
        var setPostEventShippingAddressStub = sinon.spy();
        var getAddressStub = sinon.stub();
        var createAddressStub = sinon.stub();

        var registrantMock = {
            setEmail: setEmailSpy,
            setFirstName: setFirstNameSpy,
            setLastName: setLastNameSpy,
            setRole: setRoleSpy
        };

        var productListMock = {
            setName: setNameSpy,
            setEventCity: setEventCitySpy,
            setEventDate: setEventDateSpy,
            setEventCountry: setEventCountrySpy,
            setEventState: setEventStateSpy,
            getRegistrant: function () {
                return registrantMock;
            },
            createCoRegistrant: function () {
                return registrantMock;
            },
            getCoRegistrant: getCoRegistrantStub,
            setShippingAddress: setShippingAddressStub,
            setPostEventShippingAddress: setPostEventShippingAddressStub
        };

        var addressMock = {
            setFirstName: setFirstNameSpy,
            setLastName: setLastNameSpy,
            setAddress1: setAddress1Spy,
            setAddress2: setAddress2Spy,
            setCity: setCitySpy,
            setStateCode: setStateCodeSpy,
            setCountryCode: setCountryCodeSpy,
            setPostalCode: setPostalCodeSpy,
            setPhone: setPhoneSpy,
            setID: setIDSpy,
            getUUID: function () {
                return 'addressUUID';
            }
        };

        var addressBookMock = {
            createAddress: createAddressStub,
            getAddress: getAddressStub
        };

        beforeEach(function () {
            setNameSpy.resetHistory();
            setEventCitySpy.resetHistory();
            setEventDateSpy.resetHistory();
            setEventCountrySpy.resetHistory();
            setEventStateSpy.resetHistory();

            setEmailSpy.resetHistory();
            setFirstNameSpy.resetHistory();
            setLastNameSpy.resetHistory();
            setRoleSpy.resetHistory();

            getCoRegistrantStub.resetHistory();

            setAddress1Spy.resetHistory();
            setAddress2Spy.resetHistory();
            setCitySpy.resetHistory();
            setStateCodeSpy.resetHistory();
            setCountryCodeSpy.resetHistory();
            setPostalCodeSpy.resetHistory();
            setPhoneSpy.resetHistory();
            setIDSpy.resetHistory();

            setShippingAddressStub.resetHistory();
            setPostEventShippingAddressStub.resetHistory();
            getAddressStub.resetHistory();
            createAddressStub.resetHistory();
        });

        it('should set the event info of the productList', function () {
            var eventFrom = {
                eventFormType: 'event',
                dwfrm_giftRegistry_giftRegistryEvent_event_eventDate: '10/22/2016'
            };

            var result = giftRegistryHelpers.edit(eventFrom, productListMock, addressBookMock);

            assert.isTrue(setNameSpy.calledOnce);
            assert.isTrue(setEventCitySpy.calledOnce);
            assert.isTrue(setEventDateSpy.calledOnce);
            assert.isTrue(setEventCountrySpy.calledOnce);

            assert.isTrue(result.success);
        });

        it('should set the registrant info of the productList', function () {
            var registrantForm = { eventFormType: 'registrant' };

            var result = giftRegistryHelpers.edit(registrantForm, productListMock, addressBookMock);

            assert.isTrue(setEmailSpy.calledOnce);
            assert.isTrue(setFirstNameSpy.calledOnce);
            assert.isTrue(setLastNameSpy.calledOnce);
            assert.isTrue(setRoleSpy.calledOnce);

            assert.isTrue(result.success);
        });

        it('should set the co-registrant info of the productList', function () {
            getCoRegistrantStub.returns(registrantMock);
            var coRegistrantForm = { eventFormType: 'coRegistrant' };

            var result = giftRegistryHelpers.edit(coRegistrantForm, productListMock, addressBookMock);

            assert.isTrue(setEmailSpy.calledOnce);
            assert.isTrue(setFirstNameSpy.calledOnce);
            assert.isTrue(setLastNameSpy.calledOnce);
            assert.isTrue(setRoleSpy.calledOnce);

            assert.isTrue(result.success);
        });

        it('should set the co-registrant info on the productList if no co registrant previously existed', function () {
            getCoRegistrantStub.returns(null);
            var coRegistrantForm = { eventFormType: 'coRegistrant' };

            var result = giftRegistryHelpers.edit(coRegistrantForm, productListMock, addressBookMock);

            assert.isTrue(setEmailSpy.calledOnce);
            assert.isTrue(setFirstNameSpy.calledOnce);
            assert.isTrue(setLastNameSpy.calledOnce);
            assert.isTrue(setRoleSpy.calledOnce);

            assert.isTrue(result.success);
        });

        it('should not edit preEvent shipping address if address cannot be created', function () {
            createAddressStub.returns(null);
            var preEventShippingForm = { eventFormType: 'preEvent', grAddressSelector: 'new' };

            var result = giftRegistryHelpers.edit(preEventShippingForm, productListMock, addressBookMock);

            assert.isTrue(setFirstNameSpy.notCalled);
            assert.isTrue(setLastNameSpy.notCalled);
            assert.isTrue(setAddress1Spy.notCalled);
            assert.isTrue(setAddress2Spy.notCalled);
            assert.isTrue(setCitySpy.notCalled);
            assert.isTrue(setStateCodeSpy.notCalled);
            assert.isTrue(setCountryCodeSpy.notCalled);
            assert.isTrue(setPostalCodeSpy.notCalled);
            assert.isTrue(setPhoneSpy.notCalled);
            assert.isTrue(setShippingAddressStub.notCalled);

            assert.equal(undefined, result.success);
            assert.equal(undefined, result.addressUUID);
        });

        it('should edit preEvent shipping address if address is new', function () {
            createAddressStub.returns(addressMock);
            var preEventShippingForm = {
                eventFormType: 'preEvent',
                grAddressSelector: 'new',
                dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_states_stateCode: 'statecode'
            };

            var result = giftRegistryHelpers.edit(preEventShippingForm, productListMock, addressBookMock);

            assert.isTrue(setFirstNameSpy.calledOnce);
            assert.isTrue(setLastNameSpy.calledOnce);
            assert.isTrue(setAddress1Spy.calledOnce);
            assert.isTrue(setAddress2Spy.calledOnce);
            assert.isTrue(setCitySpy.calledOnce);
            assert.isTrue(setStateCodeSpy.calledOnce);
            assert.isTrue(setCountryCodeSpy.calledOnce);
            assert.isTrue(setPostalCodeSpy.calledOnce);
            assert.isTrue(setPhoneSpy.calledOnce);
            assert.isTrue(setShippingAddressStub.calledOnce);

            assert.isTrue(result.success);
            assert.equal('addressUUID', result.addressUUID);
        });

        it('should edit preEvent shipping address if address is new and has address2 ', function () {
            createAddressStub.returns(addressMock);
            var preEventShippingForm = {
                eventFormType: 'preEvent',
                grAddressSelector: 'new',
                dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_address2: 'address2'
            };

            var result = giftRegistryHelpers.edit(preEventShippingForm, productListMock, addressBookMock);

            assert.isTrue(setFirstNameSpy.calledOnce);
            assert.isTrue(setLastNameSpy.calledOnce);
            assert.isTrue(setAddress1Spy.calledOnce);
            assert.isTrue(setAddress2Spy.calledOnce);
            assert.isTrue(setCitySpy.calledOnce);
            assert.isTrue(setStateCodeSpy.notCalled);
            assert.isTrue(setCountryCodeSpy.calledOnce);
            assert.isTrue(setPostalCodeSpy.calledOnce);
            assert.isTrue(setPhoneSpy.calledOnce);
            assert.isTrue(setShippingAddressStub.calledOnce);

            assert.isTrue(result.success);
            assert.equal('addressUUID', result.addressUUID);
        });

        it('should not edit preEvent shipping address if address cannot be retrieved', function () {
            getAddressStub.returns(null);
            var preEventShippingForm = { eventFormType: 'preEvent', grAddressSelector: 'random' };

            var result = giftRegistryHelpers.edit(preEventShippingForm, productListMock, addressBookMock);

            assert.isTrue(setFirstNameSpy.notCalled);
            assert.isTrue(setLastNameSpy.notCalled);
            assert.isTrue(setAddress1Spy.notCalled);
            assert.isTrue(setAddress2Spy.notCalled);
            assert.isTrue(setCitySpy.notCalled);
            assert.isTrue(setStateCodeSpy.notCalled);
            assert.isTrue(setCountryCodeSpy.notCalled);
            assert.isTrue(setPostalCodeSpy.notCalled);
            assert.isTrue(setPhoneSpy.notCalled);
            assert.isTrue(setShippingAddressStub.notCalled);

            assert.equal(undefined, result.success);
            assert.equal(undefined, result.addressUUID);
        });

        it('should edit preEvent shipping address if address is existing', function () {
            getAddressStub.returns(addressMock);
            var preEventShippingForm = { eventFormType: 'preEvent', grAddressSelector: 'random' };

            var result = giftRegistryHelpers.edit(preEventShippingForm, productListMock, addressBookMock);

            assert.isTrue(setFirstNameSpy.calledOnce);
            assert.isTrue(setLastNameSpy.calledOnce);
            assert.isTrue(setAddress1Spy.calledOnce);
            assert.isTrue(setAddress2Spy.calledOnce);
            assert.isTrue(setCitySpy.calledOnce);
            assert.isTrue(setStateCodeSpy.notCalled);
            assert.isTrue(setCountryCodeSpy.calledOnce);
            assert.isTrue(setPostalCodeSpy.calledOnce);
            assert.isTrue(setPhoneSpy.calledOnce);
            assert.isTrue(setShippingAddressStub.calledOnce);

            assert.isTrue(result.success);
            assert.equal('addressUUID', result.addressUUID);
        });

        it('should edit preEvent shipping address if address is existing and has address 2', function () {
            getAddressStub.returns(addressMock);
            var preEventShippingForm = {
                eventFormType: 'preEvent',
                grAddressSelector: 'random',
                dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_address2: 'address2'
            };

            var result = giftRegistryHelpers.edit(preEventShippingForm, productListMock, addressBookMock);

            assert.isTrue(setFirstNameSpy.calledOnce);
            assert.isTrue(setLastNameSpy.calledOnce);
            assert.isTrue(setAddress1Spy.calledOnce);
            assert.isTrue(setAddress2Spy.calledOnce);
            assert.isTrue(setCitySpy.calledOnce);
            assert.isTrue(setStateCodeSpy.notCalled);
            assert.isTrue(setCountryCodeSpy.calledOnce);
            assert.isTrue(setPostalCodeSpy.calledOnce);
            assert.isTrue(setPhoneSpy.calledOnce);
            assert.isTrue(setShippingAddressStub.calledOnce);

            assert.isTrue(result.success);
            assert.equal('addressUUID', result.addressUUID);
        });

        it('should edit post event shipping address if address is new', function () {
            getAddressStub.returns(addressMock);
            var postEventShippingForm = { eventFormType: 'postEvent', post_grAddressSelector: 'new' };

            var result = giftRegistryHelpers.edit(postEventShippingForm, productListMock, addressBookMock);

            assert.isTrue(setFirstNameSpy.calledOnce);
            assert.isTrue(setLastNameSpy.calledOnce);
            assert.isTrue(setAddress1Spy.calledOnce);
            assert.isTrue(setAddress2Spy.calledOnce);
            assert.isTrue(setCitySpy.calledOnce);
            assert.isTrue(setStateCodeSpy.notCalled);
            assert.isTrue(setCountryCodeSpy.calledOnce);
            assert.isTrue(setPostalCodeSpy.calledOnce);
            assert.isTrue(setPhoneSpy.calledOnce);
            assert.isTrue(setPostEventShippingAddressStub.calledOnce);

            assert.isTrue(result.success);
        });

        it('should edit post event shipping address if address is new and has address2 ', function () {
            getAddressStub.returns(addressMock);
            var postEventShippingForm = {
                eventFormType: 'postEvent',
                post_grAddressSelector: 'new',
                dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_address2: 'address2'
            };

            var result = giftRegistryHelpers.edit(postEventShippingForm, productListMock, addressBookMock);

            assert.isTrue(setFirstNameSpy.calledOnce);
            assert.isTrue(setLastNameSpy.calledOnce);
            assert.isTrue(setAddress1Spy.calledOnce);
            assert.isTrue(setAddress2Spy.calledOnce);
            assert.isTrue(setCitySpy.calledOnce);
            assert.isTrue(setStateCodeSpy.notCalled);
            assert.isTrue(setCountryCodeSpy.calledOnce);
            assert.isTrue(setPostalCodeSpy.calledOnce);
            assert.isTrue(setPhoneSpy.calledOnce);
            assert.isTrue(setPostEventShippingAddressStub.calledOnce);

            assert.isTrue(result.success);
            assert.equal('addressUUID', result.addressUUID);
        });

        it('should edit post event shipping address if address is existing', function () {
            getAddressStub.returns(addressMock);
            var postEventShippingForm = {
                eventFormType: 'postEvent',
                post_grAddressSelector: 'random',
                dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_states_stateCode: 'statecode'
            };

            var result = giftRegistryHelpers.edit(postEventShippingForm, productListMock, addressBookMock);

            assert.isTrue(setFirstNameSpy.calledOnce);
            assert.isTrue(setLastNameSpy.calledOnce);
            assert.isTrue(setAddress1Spy.calledOnce);
            assert.isTrue(setAddress2Spy.calledOnce);
            assert.isTrue(setCitySpy.calledOnce);
            assert.isTrue(setStateCodeSpy.calledOnce);
            assert.isTrue(setCountryCodeSpy.calledOnce);
            assert.isTrue(setPostalCodeSpy.calledOnce);
            assert.isTrue(setPhoneSpy.calledOnce);
            assert.isTrue(setPostEventShippingAddressStub.calledOnce);

            assert.isTrue(result.success);
            assert.equal('addressUUID', result.addressUUID);
        });

        it('should edit post event shipping address if address is existing and has address 2', function () {
            getAddressStub.returns(addressMock);
            var postEventShippingForm = {
                eventFormType: 'postEvent',
                post_grAddressSelector: 'random',
                dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_address2: 'address2',
                dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_states_stateCode: 'statecode'
            };

            var result = giftRegistryHelpers.edit(postEventShippingForm, productListMock, addressBookMock);

            assert.isTrue(setFirstNameSpy.calledOnce);
            assert.isTrue(setLastNameSpy.calledOnce);
            assert.isTrue(setAddress1Spy.calledOnce);
            assert.isTrue(setAddress2Spy.calledOnce);
            assert.isTrue(setCitySpy.calledOnce);
            assert.isTrue(setStateCodeSpy.calledOnce);
            assert.isTrue(setCountryCodeSpy.calledOnce);
            assert.isTrue(setPostalCodeSpy.calledOnce);
            assert.isTrue(setPhoneSpy.calledOnce);
            assert.isTrue(setPostEventShippingAddressStub.calledOnce);

            assert.isTrue(result.success);
            assert.equal('addressUUID', result.addressUUID);
        });

        it('should not post event shipping address if address cannot be created', function () {
            createAddressStub.returns(null);
            var postEventShippingForm = { eventFormType: 'postEvent', post_grAddressSelector: 'new' };

            var result = giftRegistryHelpers.edit(postEventShippingForm, productListMock, addressBookMock);

            assert.isTrue(setFirstNameSpy.notCalled);
            assert.isTrue(setLastNameSpy.notCalled);
            assert.isTrue(setAddress1Spy.notCalled);
            assert.isTrue(setAddress2Spy.notCalled);
            assert.isTrue(setCitySpy.notCalled);
            assert.isTrue(setStateCodeSpy.notCalled);
            assert.isTrue(setCountryCodeSpy.notCalled);
            assert.isTrue(setPostalCodeSpy.notCalled);
            assert.isTrue(setPhoneSpy.notCalled);
            assert.isTrue(setShippingAddressStub.notCalled);

            assert.equal(undefined, result.success);
            assert.equal(undefined, result.addressUUID);
        });

        it('should not edit post event shipping address if address cannot be retrieved', function () {
            getAddressStub.returns(null);
            var postEventShippingForm = { eventFormType: 'postEvent', post_grAddressSelector: 'random' };

            var result = giftRegistryHelpers.edit(postEventShippingForm, productListMock, addressBookMock);

            assert.isTrue(setFirstNameSpy.notCalled);
            assert.isTrue(setLastNameSpy.notCalled);
            assert.isTrue(setAddress1Spy.notCalled);
            assert.isTrue(setAddress2Spy.notCalled);
            assert.isTrue(setCitySpy.notCalled);
            assert.isTrue(setStateCodeSpy.notCalled);
            assert.isTrue(setCountryCodeSpy.notCalled);
            assert.isTrue(setPostalCodeSpy.notCalled);
            assert.isTrue(setPhoneSpy.notCalled);
            assert.isTrue(setShippingAddressStub.notCalled);

            assert.equal(undefined, result.success);
            assert.equal(undefined, result.addressUUID);
        });
    });

    describe('getDateObj', function () {
        var getMonthStub = sinon.stub();
        var getDateStub = sinon.stub();

        var dateMock = {
            getDate: getDateStub,
            getMonth: getMonthStub,
            getFullYear: function () {
                return {
                    toString: function () {
                        return 'some string year';
                    }
                };
            }
        };

        beforeEach(function () {
            getMonthStub.resetHistory();
            getDateStub.resetHistory();
        });

        it('should add a zero when day is < 10', function () {
            getDateStub.returns(8);
            var result = giftRegistryHelpers.getDateObj(dateMock);
            assert.equal(result.d, '08');
        });

        it('should not add a zero when day is > 10', function () {
            getDateStub.returns(22);
            var result = giftRegistryHelpers.getDateObj(dateMock);
            assert.equal(result.d, '22');
        });

        it('should add a zero when month is < 10', function () {
            getMonthStub.returns(2);
            var result = giftRegistryHelpers.getDateObj(dateMock);
            assert.equal(result.m, '03');
        });

        it('should not add a zero when month is > 10', function () {
            getMonthStub.returns(10);
            var result = giftRegistryHelpers.getDateObj(dateMock);
            assert.equal(result.m, '11');
        });

        it('should return year', function () {
            getMonthStub.returns(10);
            var result = giftRegistryHelpers.getDateObj(dateMock);
            assert.equal(result.y, 'some string year');
        });
    });
});
