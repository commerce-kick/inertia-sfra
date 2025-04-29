'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var transaction = {
    wrap: function (callBack) {
        return callBack.call();
    }
};
var ArrayList = require('../../../../mocks/dw.util.Collection');
var collections = require('../../../../mocks/util/collections');
var removeProductList = { removeProductList: function () { return {}; } };
var removeProductListStub = sinon.stub(removeProductList, 'removeProductList').callsFake(function () { return {}; });

var productListMgr = {
    createProductList: function () {
        return {
            list: 'new list',
            setName: function () {
            },
            setEventCountry: function () {
            },
            setEventState: function () {
            },
            setEventCity: function () {
            },
            setEventDate: function () {
            },
            createRegistrant: function () {
                return {
                    setEmail: function () {
                    },
                    setFirstName: function () {
                    },
                    setLastName: function () {
                    },
                    setRole: function () {
                    }
                };
            },
            createCoRegistrant: function () {
                return {
                    setEmail: function () {
                    },
                    setFirstName: function () {
                    },
                    setLastName: function () {
                    },
                    setRole: function () {
                    }
                };
            },
            setShippingAddress: function () {},
            setPostEventShippingAddress: function () {}
        };
    },
    getProductLists: function (customer) {
        if (customer.uuid === 1) {
            return [{ id: 'createdListID' }];
        }
        return { list: 'new list' };
    },
    getProductList: function (id) {
        if (id === 'badList') {
            return {
                publicflag: false,
                owner: {
                    ID: 'customerID'
                },
                setPublic: function (bool) {
                    this.publicflag = bool;
                },
                getItem: function (itemID) {
                    if (itemID === 'itemID') {
                        return {
                            id: 'itemID',
                            publicFlag: false,
                            setPublic: function (bool) {
                                this.publicflag = bool;
                            },
                            isPublic: function () {
                                return this.publicflag;
                            }
                        };
                    }
                    if (itemID === 'itemIDFail') {
                        return null;
                    }
                    return null;
                }
            };
        }
        if (id === 'newGRList') {
            return {
                id: 'newGRList'
            };
        }
        return {
            publicflag: false,
            owner: {
                ID: 'customerID'
            },
            setPublic: function (bool) {
                this.publicflag = bool;
            },
            isPublic: function () {
                return this.publicflag;
            },
            getItem: function (itemID) {
                if (itemID === 'itemID' || itemID === 'MasterPID') {
                    return {
                        id: 'itemID',
                        product: {
                            master: itemID === 'MasterPID'
                        },
                        publicFlag: false,
                        setPublic: function (bool) {
                            this.publicflag = bool;
                        },
                        isPublic: function () {
                            return this.publicflag;
                        }
                    };
                }
                if (itemID === 'itemIDFail') {
                    return null;
                }
                return null;
            }
        };
    },
    removeProductList: removeProductListStub
};

var productMgr = {
    getProduct: function (pid) {
        var variationGroup = pid === 'pidvg';
        var optionProduct = pid === 'OptionPID';
        var masterProduct = pid === 'MasterPID';
        var optionModel = null;
        if (pid === 'OptionPID') {
            optionModel = {
                getOption: function () {},
                getOptionValue: function () {},
                setSelectedOptionValue: function () {}
            };
        }
        return {
            product: {
                ID: pid,
                master: masterProduct
            },
            setPublic: function () {
            },
            master: masterProduct,
            variationGroup: variationGroup,
            optionProduct: optionProduct,
            optionModel: optionModel,
            getOptionModel: function () {
                return optionModel;
            }
        };
    }
};

var customer = {
    firstName: 'testUser1',
    lastName: 'testing',
    anonymous: true,
    uuid: 2,
    getAddressBook: function () {
        return {
            createAddress: function () {
                return {
                    setFirstName: function () {},
                    setLastName: function () {},
                    setAddress1: function () {},
                    setAddress2: function () {},
                    setCity: function () {},
                    setStateCode: function () {},
                    setPostalCode: function () {},
                    setPhone: function () {},
                    setCountryCode: function () {}

                };
            },
            getAddress: function () {

            }
        };
    }
};

var user = {
    anonymous: false,
    uuid: 0
};
var myList = {
    createProductItem: function () {
        return {
            setQuantityValue: function () {},
            setPublic: function () {},
            setProductOptionModel: function () {}
        };
    },
    items: new ArrayList([
        { productID: '12345' },
        { productID: '567654' },
        {
            productID: '019283',
            optionProduct: true,
            productOptionModel: {
                getOption: function () {
                    return {};
                },
                getSelectedOptionValue: function () {
                    return '000';
                },
                setProductOptionModel: function () {

                }
            }
        }
    ]),
    removeItem: function () {
    }
};
var reqObject = {
    currentCustomer: {
        raw: customer
    },
    session: {
        privacyCache: {
            set: function () {
                return 'something';
            }
        }
    }
};
var pid = '12345';
var productListHelpers = proxyquire('../../../../../cartridges/lib_productlist/cartridge/scripts/productList/productListHelpers.js', {
    'dw/customer/ProductListMgr': productListMgr,
    'dw/system/Transaction': transaction,
    'dw/catalog/ProductMgr': productMgr,
    '*/cartridge/scripts/util/collections': collections,
    'dw/web/Resource': {
        msgf: function (params) { return params; },
        msg: function (params) { return params; }
    }
});

describe('productListHelpers', function () {
    describe('createList', function () {
        it('should create a new list for a customer (wishlist type 10)', function () {
            var listObject = productListHelpers.createList(customer, { type: 10 });
            assert.equal(listObject.list, 'new list');
        });

        it('should create a new list for a customer (wishlist type 11)', function () {
            var listObject = productListHelpers.createList(customer, {
                type: 11,
                formData: {
                    eventInfo: {
                        eventName: 'eventName',
                        eventCountry: 'eventCountry',
                        eventState: 'eventState',
                        eventCity: 'eventCity',
                        eventDate: '07/15/2020'
                    },
                    registrant: {
                        email: 'email',
                        firstName: 'firstName',
                        lastName: 'lastName',
                        role: 'role'
                    },
                    coRegistrant: {
                        email: 'email',
                        firstName: 'firstName',
                        lastName: 'lastName',
                        role: 'role'
                    },
                    preEventAddress: {
                        addressId: 'addressId',
                        newAddress: true,
                        firstName: 'firstName',
                        lastName: 'lastName',
                        address1: 'address1',
                        address2: 'address2',
                        country: 'country',
                        stateCode: 'stateCode',
                        city: 'city',
                        postalCode: 'postalCode',
                        phone: 'phone'
                    },
                    postEventAddress: {
                        addressId: 'addressId',
                        newAddress: true,
                        firstName: 'firstName',
                        lastName: 'lastName',
                        address1: 'address1',
                        address2: 'address2',
                        country: 'country',
                        stateCode: 'stateCode',
                        city: 'city',
                        postalCode: 'postalCode',
                        phone: 'phone'
                    }
                }
            });

            assert.equal(listObject.list, 'new list');
        });

        it('should create a new list for a customer with 1 address and 1 role (wishlist type 11)', function () {
            var listObject = productListHelpers.createList(customer, {
                type: 11,
                formData: {
                    eventInfo: {
                        eventName: 'eventName',
                        eventCountry: 'eventCountry',
                        eventState: 'eventState',
                        eventCity: 'eventCity',
                        eventDate: '07/15/2020'
                    },
                    registrant: {
                        email: 'email',
                        firstName: 'firstName',
                        lastName: 'lastName',
                        role: 'role'
                    },
                    coRegistrant: null,
                    preEventAddress: {
                        addressId: 'addressId',
                        newAddress: true,
                        firstName: 'firstName',
                        lastName: 'lastName',
                        address1: 'address1',
                        address2: 'address2',
                        country: 'country',
                        stateCode: 'stateCode',
                        city: 'city',
                        postalCode: 'postalCode',
                        phone: 'phone'
                    },
                    postEventAddress: null
                }
            });

            assert.equal(listObject.list, 'new list');
        });
        it('should create a new list for a customer with 1 existing address and 1 role (wishlist type 11)', function () {
            var listObject = productListHelpers.createList(customer, {
                type: 11,
                formData: {
                    eventInfo: {
                        eventName: 'eventName',
                        eventCountry: 'eventCountry',
                        eventState: 'eventState',
                        eventCity: 'eventCity',
                        eventDate: '07/15/2020'
                    },
                    registrant: {
                        email: 'email',
                        firstName: 'firstName',
                        lastName: 'lastName',
                        role: 'role'
                    },
                    coRegistrant: null,
                    preEventAddress: {
                        addressId: 'addressId',
                        newAddress: false,
                        firstName: 'firstName',
                        lastName: 'lastName',
                        address1: 'address1',
                        address2: 'address2',
                        country: 'country',
                        stateCode: 'stateCode',
                        city: 'city',
                        postalCode: 'postalCode',
                        phone: 'phone'
                    },
                    postEventAddress: null
                }
            });

            assert.equal(listObject.list, 'new list');
        });
    });

    describe('getCurrentOrNewList', function () {
        it('should get a list for a anonymous customer', function () {
            var listObject = productListHelpers.getCurrentOrNewList(customer, { type: 10 });
            assert.equal(listObject.list, 'new list');
        });

        it('should get a list for a customer', function () {
            var listObject = productListHelpers.getCurrentOrNewList(user, { type: 10 });
            assert.equal(listObject.list, 'new list');
        });
    });

    describe('getList', function () {
        it('should return null for a anonymous customer without a list', function () {
            var listObject = productListHelpers.getList(customer, { type: 10 });
            assert.equal(listObject, null);
        });

        it('should return null if the type is not 11 or 10 ( type 01)', function () {
            var listObject = productListHelpers.getList(customer, { type: 1 });
            assert.equal(listObject, null);
        });

        it('should return null for a customer without a list', function () {
            var listObject = productListHelpers.getList(user, { type: 10 });
            assert.equal(listObject, null);
        });

        it('should get a list for a customer with existing items', function () {
            user.uuid = 1;
            var listObject = productListHelpers.getList(user, { type: 10 });
            var expectedResult = { id: 'createdListID' };
            assert.deepEqual(listObject, expectedResult);
        });

        it('should get a list of type giftregistry', function () {
            user.uuid = 1;
            var listObject = productListHelpers.getList(user, { type: 11, id: 'newGRList' });
            var expectedResult = { id: 'newGRList' };
            assert.deepEqual(listObject, expectedResult);
        });
    });

    describe('itemExists', function () {
        it('should return the item for existing items', function () {
            var config = {
                qty: 1,
                optionId: null,
                optionValue: null
            };
            var expectedResult = {
                productID: '12345'
            };

            var listFound = productListHelpers.itemExists(myList, pid, config);

            assert.deepEqual(listFound, expectedResult);
        });

        it('should return false for a non-existing item', function () {
            var config = {
                qty: 1,
                optionId: null,
                optionValue: null
            };

            var listFound = productListHelpers.itemExists(myList, 'nopid', config);
            assert.isFalse(listFound);
        });

        it('should return false for a new item with option', function () {
            var config = {
                qty: 1,
                optionId: 'tv-warrenty',
                optionValue: '000'
            };

            var listFound = productListHelpers.itemExists(myList, '019283', config);
            assert.isFalse(listFound);
        });

        it('should return false if the item has a matching id and option', function () {
            var config = {
                qty: 1,
                optionId: 'tv-warrenty',
                optionValue: '111'
            };
            var listFound = productListHelpers.itemExists(myList, '019283', config);
            assert.isFalse(listFound);
        });
    });

    describe('addItem', function () {
        it('should add a new item to the list', function () {
            var config = {
                qty: 1,
                optionId: null,
                optionValue: null
            };
            var expectedResult = {
                productID: '12345'
            };
            var listFound = productListHelpers.itemExists(myList, pid, config);
            assert.deepEqual(listFound, expectedResult);
        });
    });

    describe('removeList', function () {
        it('removeProductList() should be called once', function () {
            productListHelpers.removeList(customer, { mergeList: true });
            assert.isTrue(removeProductListStub.calledOnce);
            removeProductListStub.resetHistory();
        });
    });

    describe('removeItem', function () {
        var mycustomer = {
            firstName: 'testUser1',
            lastName: 'testing',
            anonymous: true,
            type: '10',
            uuid: 2
        };
        var config = {
            qty: 1,
            optionId: null,
            optionValue: null,
            req: reqObject,
            type: 10
        };
        var myPid = '12345';
        var theList = {
            items: {
                toArray: function () {
                    return [{ productID: '12345' }, { productID: '567654' }];
                }
            },
            removeItem: function () {}
        };
        var spy = sinon.spy(theList, 'removeItem');
        it('inner removeItem function should be called once', function () {
            productListMgr.createProductList = function () {
                return theList;
            };
            productListHelpers.removeItem(mycustomer, myPid, config);
            assert.isTrue(spy.calledOnce);
        });

        it('should return an error when exception has thrown', function () {
            var theListErr = {
                items: new ArrayList([{ productID: '12345' }, { productID: '567654' }]),
                removeItem: function () {
                    throw new Error('error');
                }
            };
            productListMgr.createProductList = function () {
                return theListErr;
            };
            var resultObj = productListHelpers.removeItem(mycustomer, myPid, config);
            assert.isTrue(spy.calledOnce);
            assert.isTrue(resultObj.error);
        });
    });

    describe('addItem', function () {
        var pid1 = '95555';
        var config = {
            qty: 1,
            optionId: null,
            optionValue: null,
            req: reqObject,
            type: 10
        };
        var productListItem = {
            setQuantityValue: function () {

            },
            productID: '12345'

        };
        var mylist = {
            createProductItem: function () {
                return productListItem;
            },
            items: new ArrayList([productListItem])
        };
        var spy = sinon.spy(mylist, 'createProductItem');
        var spy2 = sinon.spy(productListItem, 'setQuantityValue');

        beforeEach(function () {
            spy2.resetHistory();
        });

        it('should return false if no list is passed in', function () {
            var result = productListHelpers.addItem(null, pid1, config);
            assert.isFalse(result);
        });

        it('inner functions should be called once', function () {
            var result = productListHelpers.addItem(mylist, pid1, config);
            assert.isTrue(spy.calledOnce);
            assert.isTrue(spy2.calledOnce);
            assert.isTrue(result);
        });

        it('should return true if item was added to wishlist', function () {
            var result = productListHelpers.addItem(mylist, pid1, config);
            assert.isTrue(result);
        });

        it('should return false if item was already in the wishlist', function () {
            var result = productListHelpers.addItem(mylist, '12345', config);
            assert.isFalse(result);
        });

        it('should return false if item is part of a variation group', function () {
            var result = productListHelpers.addItem(mylist, 'pidvg', config);
            assert.isFalse(result);
        });

        it('should add a new item with options to the list', function () {
            config = {
                qty: 1,
                optionId: 'tvWarranty',
                optionValue: '001',
                req: reqObject,
                type: 10
            };
            pid = 'OptionPID';
            var result = productListHelpers.addItem(myList, pid, config);
            assert.isTrue(result);
        });

        it('should add a new master item', function () {
            config = {
                qty: 1,
                optionId: null,
                optionValue: null,
                req: reqObject,
                type: 10
            };
            pid = 'MasterPID';
            var result = productListHelpers.addItem(myList, pid, config);
            assert.isTrue(result);
        });

        it('should add item to gift registry', function () {
            config = {
                qty: 1,
                optionId: null,
                optionValue: null,
                req: reqObject,
                type: 11
            };
            var result = productListHelpers.addItem(myList, pid, config);
            assert.isTrue(result);
        });

        it('should increase qty of item already in registry', function () {
            config = {
                qty: 1,
                optionId: null,
                optionValue: null,
                req: reqObject,
                type: 11
            };
            myList.items = new ArrayList([productListItem]);
            var result = productListHelpers.addItem(myList, '12345', config);
            assert.isTrue(spy2.calledOnce);
            assert.isTrue(result);
        });
    });

    describe('mergelists', function () {
        var productListItem = {
            setQuantityValue: function () {

            }
        };
        function getOptionModel() {
            return {
                getOptions: function () {
                    return {
                        toArray: function () {
                            return [{
                                ID: 'optionID'
                            }];
                        }
                    };
                },
                getOption: function () {
                    return {
                        ID: 'optionID'
                    };
                },
                getSelectedOptionValue: function () {
                    return {
                        ID: 'optionValueID'
                    };
                }
            };
        }

        var mylistA = {
            createProductItem: function () {
                return productListItem;
            },
            items: new ArrayList([
                {
                    productID: '12345',
                    optionProduct: false,
                    getOptionModel: getOptionModel
                }])
        };

        var mylistB = {
            createProductItem: function () {
                return productListItem;
            },
            items: new ArrayList([
                {
                    productID: '98765',
                    product: {
                        optionProduct: false,
                        getOptionModel: getOptionModel
                    }

                },
                {
                    productID: '12345',
                    product: {
                        optionProduct: false,
                        getOptionModel: getOptionModel
                    }
                },
                {
                    productID: '00000',
                    product: {
                        optionProduct: true,
                        getOptionModel: getOptionModel
                    }
                }])
        };

        it('mergelists function returns the items added to the existing wishlist', function () {
            var result = productListHelpers.mergelists(mylistA, mylistB, reqObject, { type: 10 });
            var expectedResult = ['98765', '00000'];
            assert.equal(result.length, 2);
            assert.equal(result[0], expectedResult[0]);
            assert.equal(result[1], expectedResult[1]);
        });
    });

    describe('getItemFromList', function () {
        var productlist = {
            items: [
                { productID: '12345' },
                { productID: '567654' }
            ]
        };

        it('should return the specified item from the given list if exist', function () {
            var result = productListHelpers.getItemFromList(productlist, '12345');
            assert.equal(result.productID, productlist.items[0].productID);
        });
    });

    describe('toggleStatus', function () {
        it('should switch the status of the lists online flag', function () {
            var customer1 = {
                ID: 'customerID'
            };
            var listID = 'listUUID';
            var itemID = null;
            var result = productListHelpers.toggleStatus(customer1, itemID, listID);
            var expectedResult = {
                success: true,
                msg: 'list.togglepublic.success.msg'
            };
            assert.equal(result.success, expectedResult.success);
            assert.equal(result.msg, expectedResult.msg);
        });

        it('should return an error message if the customerID does not match the list owner ID', function () {
            var customer2 = {
                ID: 'customerID2'
            };
            var listID = 'listUUID';
            var itemID = null;
            var result = productListHelpers.toggleStatus(customer2, itemID, listID);
            var expectedResult = {
                error: true,
                msg: 'list.togglepublic.error.msg'
            };
            assert.equal(result.error, expectedResult.error);
            assert.equal(result.msg, expectedResult.msg);
        });

        it('should return an error message if there is no matching list and no customer', function () {
            var customer3 = null;
            var listID = null;
            var itemID = null;
            var result = productListHelpers.toggleStatus(customer3, itemID, listID);
            var expectedResult = {
                error: true,
                msg: 'list.togglepublic.error.msg'
            };
            assert.equal(result.error, expectedResult.error);
            assert.equal(result.msg, expectedResult.msg);
        });
        it('should switch the status of the items online flag', function () {
            var customer4 = {
                ID: 'customerID'
            };
            var listID = 'listUUID';
            var itemID = 'itemID';
            var result = productListHelpers.toggleStatus(customer4, itemID, listID);
            var expectedResult = {
                success: true,
                msg: 'listitem.togglepublic.success.msg'
            };
            assert.equal(result.success, expectedResult.success);
            assert.equal(result.msg, expectedResult.msg);
        });
        it('should not switch the status of the items online flag for a master product', function () {
            var customer4 = {
                ID: 'customerID'
            };
            var listID = 'listUUID';
            var itemID = 'MasterPID';
            var result = productListHelpers.toggleStatus(customer4, itemID, listID);
            var expectedResult = {
                error: true,
                msg: 'list.togglepublic.main.error.msg'
            };

            assert.equal(result.error, expectedResult.error);
            assert.equal(result.msg, expectedResult.msg);
        });
        it('should return an error message if item failed to toggle flag', function () {
            var customer5 = {
                ID: 'customerID'
            };
            var listID = 'listUUID';
            var itemID = 'itemIDFail';
            var result = productListHelpers.toggleStatus(customer5, itemID, listID);
            var expectedResult = {
                error: true,
                msg: 'list.togglepublic.error.msg'
            };
            assert.equal(result.error, expectedResult.error);
            assert.equal(result.msg, expectedResult.msg);
        });
        it('should return an error message if list failed to toggle flag', function () {
            var customer6 = {
                ID: 'customerID'
            };
            var listID = 'badList';
            var itemID = null;
            var result = productListHelpers.toggleStatus(customer6, itemID, listID);
            var expectedResult = {
                error: true,
                msg: 'list.togglepublic.error.msg'
            };
            assert.equal(result.error, expectedResult.error);
            assert.equal(result.msg, expectedResult.msg);
        });
    });
});
