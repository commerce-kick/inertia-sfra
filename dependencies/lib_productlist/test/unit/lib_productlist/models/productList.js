'use strict';

var assert = require('chai').assert;
var ProductList = require('../../../mocks/models/productList');

describe('productList Model', function () {
    it('should return a productList model\'s first page', function () {
        var itemsMock = [
            {
                productID: 'pid 1',
                UUID: 'UUID 123',
                product: {
                    name: 'productName A',
                    master: 'productMaster A',
                    bundle: false,
                    minOrderQuantity: {
                        value: 'minOrderQuantity A'
                    },
                    availabilityModel: 'availability model A'
                },
                quantityValue: 2,
                public: 'PublicItem A',
                getLastModified: function () {
                    return {
                        getTime: function () {
                            return '1111122222';
                        }
                    };
                },
                getCreationDate: function () {
                    return {
                        getTime: function () {
                            return '3333344444';
                        }
                    };
                }
            },
            {
                productID: 'pid 2',
                UUID: 'UUID 456',
                product: {
                    name: 'productName B',
                    master: 'productMaster B',
                    bundle: false,
                    minOrderQuantity: {
                        value: 'minOrderQuantity B'
                    },
                    availabilityModel: 'availability model B'
                },
                quantityValue: 3,
                public: 'PublicItem B',
                getLastModified: function () {
                    return {
                        getTime: function () {
                            return '3333333333';
                        }
                    };
                },
                getCreationDate: function () {
                    return {
                        getTime: function () {
                            return '4444444444';
                        }
                    };
                }
            }
        ];

        var configMock = {
            publicView: false,
            pageSize: 1,
            pageNumber: 1

        };

        var dwProductListMock = {
            getLength: function () {
                return itemsMock.length;
            },
            toArray: function () {
                return itemsMock;
            }
        };

        var productListObjectMock = {
            owner: {
                profile: {
                    firstName: 'Jane',
                    lastName: 'Smith'
                }
            },
            public: true,
            UUID: 'UUID 12345',
            items: dwProductListMock,
            type: 'type A'
        };

        var expectResult = {
            'productList': {
                'owner': {
                    'exists': true,
                    'firstName': 'Jane',
                    'lastName': 'Smith'
                },
                'publicList': true,
                'UUID': 'UUID 12345',
                'sortOrder': 'ascending',
                'length': 2,
                'publicView': false,
                'showMore': true,
                'items': [
                    {
                        'pid': 'pid 1',
                        'UUID': 'UUID 123',
                        'name': 'productName A',
                        'qty': 2,
                        'lastModified': '1111122222',
                        'creationDate': '3333344444',
                        'publicItem': 'PublicItem A',
                        'imageObj': {
                            'product': 'some product image'
                        },
                        'priceObj': {
                            'object': 'somre price Object'
                        },
                        'master': 'productMaster A',
                        'bundle': 'productBundle A'
                    }
                ],
                'type': 'type A'
            }
        };

        var result = new ProductList(productListObjectMock, configMock);

        assert.equal(result.productList.owner.exists, expectResult.productList.owner.exists);
        assert.equal(result.productList.owner.firstName, expectResult.productList.owner.firstName);
        assert.equal(result.productList.owner.lastName, expectResult.productList.owner.lastName);

        assert.equal(result.productList.publicList, expectResult.productList.publicList);
        assert.equal(result.productList.UUID, expectResult.productList.UUID);
        assert.equal(result.productList.length, expectResult.productList.length);
        assert.equal(result.productList.publicList, expectResult.productList.publicList);
        assert.equal(result.productList.publicView, expectResult.productList.publicView);
        assert.equal(result.productList.showMore, expectResult.productList.showMore);

        assert.equal(result.productList.items.length, expectResult.productList.items.length);
        assert.equal(result.productList.items[0].pid, expectResult.productList.items[0].pid);
        assert.equal(result.productList.items[0].UUID, expectResult.productList.items[0].UUID);
        assert.equal(result.productList.items[0].name, expectResult.productList.items[0].name);
        assert.equal(result.productList.type, expectResult.productList.type);
    });

    it('should return a productList model with the last page of the list', function () {
        var itemsMock = [
            {
                productID: 'pid 1',
                UUID: 'UUID 123',
                product: {
                    name: 'productName A',
                    master: 'productMaster A',
                    bundle: false,
                    minOrderQuantity: {
                        value: 'minOrderQuantity A'
                    },
                    availabilityModel: 'availability model A'
                },
                quantityValue: 2,
                public: 'PublicItem A',
                getLastModified: function () {
                    return {
                        getTime: function () {
                            return '1111122222';
                        }
                    };
                },
                getCreationDate: function () {
                    return {
                        getTime: function () {
                            return '3333344444';
                        }
                    };
                }
            },
            {
                productID: 'pid 2',
                UUID: 'UUID 456',
                product: {
                    name: 'productName B',
                    master: 'productMaster B',
                    bundle: false,
                    minOrderQuantity: {
                        value: 'minOrderQuantity B'
                    },
                    availabilityModel: 'availability model B'
                },
                quantityValue: 3,
                public: 'PublicItem B',
                getLastModified: function () {
                    return {
                        getTime: function () {
                            return '3333333333';
                        }
                    };
                },
                getCreationDate: function () {
                    return {
                        getTime: function () {
                            return '4444444444';
                        }
                    };
                }
            }
        ];

        var configMock = {
            publicView: false,
            pageSize: 1,
            pageNumber: 2

        };

        var dwProductListMock = {
            getLength: function () {
                return itemsMock.length;
            },
            toArray: function () {
                return itemsMock;
            }
        };

        var productListObjectMock = {
            owner: {
                profile: {
                    firstName: 'Jane',
                    lastName: 'Smith'
                }
            },
            public: true,
            UUID: 'UUID 12345',
            items: dwProductListMock,
            type: 'type A'
        };

        var expectResult = {
            'productList': {
                'owner': {
                    'exists': true,
                    'firstName': 'Jane',
                    'lastName': 'Smith'
                },
                'publicList': true,
                'UUID': 'UUID 12345',
                'sortOrder': 'ascending',
                'length': 2,
                'pageNumber': 2,
                'publicView': false,
                'showMore': false,
                'items': [
                    {
                        'pid': 'pid 1',
                        'UUID': 'UUID 123',
                        'name': 'productName A',
                        'qty': 2,
                        'lastModified': '1111122222',
                        'creationDate': '3333344444',
                        'publicItem': 'PublicItem A',
                        'imageObj': {
                            'product': 'some product image'
                        },
                        'priceObj': {
                            'object': 'somre price Object'
                        },
                        'master': 'productMaster A',
                        'bundle': 'productBundle A'
                    },
                    {
                        'pid': 'pid 2',
                        'UUID': 'UUID 456',
                        'name': 'productName B',
                        'qty': 3,
                        'lastModified': '3333333333',
                        'creationDate': '4444444444',
                        'publicItem': 'PublicItem B',
                        'imageObj': {
                            'product': 'some product image'
                        },
                        'priceObj': {
                            'object': 'somre price Object'
                        },
                        'master': 'productMaster B',
                        'bundle': 'productBundle B'
                    }
                ],
                'type': 'type A'
            }
        };

        var result = new ProductList(productListObjectMock, configMock);

        assert.equal(result.productList.owner.exists, expectResult.productList.owner.exists);
        assert.equal(result.productList.owner.firstName, expectResult.productList.owner.firstName);
        assert.equal(result.productList.owner.lastName, expectResult.productList.owner.lastName);

        assert.equal(result.productList.publicList, expectResult.productList.publicList);
        assert.equal(result.productList.UUID, expectResult.productList.UUID);
        assert.equal(result.productList.length, expectResult.productList.length);
        assert.equal(result.productList.publicList, expectResult.productList.publicList);
        assert.equal(result.productList.publicView, expectResult.productList.publicView);
        assert.equal(result.productList.showMore, expectResult.productList.showMore);
        assert.equal(result.productList.items.length, expectResult.productList.items.length);
        assert.equal(result.productList.items[0].pid, expectResult.productList.items[0].pid);
        assert.equal(result.productList.items[0].UUID, expectResult.productList.items[0].UUID);
        assert.equal(result.productList.items[0].name, expectResult.productList.items[0].name);

        assert.equal(result.productList.items[1].pid, expectResult.productList.items[1].pid);
        assert.equal(result.productList.items[1].UUID, expectResult.productList.items[1].UUID);
        assert.equal(result.productList.items[1].name, expectResult.productList.items[1].name);

        assert.equal(result.productList.type, expectResult.productList.type);
    });

    it('should not return private items if the view is public', function () {
        var itemsMock = [
            {
                productID: 'pid 1',
                UUID: 'UUID 123',
                product: {
                    name: 'productName A',
                    master: 'productMaster A',
                    bundle: false,
                    minOrderQuantity: {
                        value: 'minOrderQuantity A'
                    },
                    availabilityModel: 'availability model A'
                },
                quantityValue: 2,
                public: false,
                getLastModified: function () {
                    return {
                        getTime: function () {
                            return '1111122222';
                        }
                    };
                },
                getCreationDate: function () {
                    return {
                        getTime: function () {
                            return '3333344444';
                        }
                    };
                }
            },
            {
                productID: 'pid 2',
                UUID: 'UUID 456',
                product: {
                    name: 'productName B',
                    master: 'productMaster B',
                    bundle: false,
                    minOrderQuantity: {
                        value: 'minOrderQuantity B'
                    },
                    availabilityModel: 'availability model B'
                },
                quantityValue: 3,
                public: 'PublicItem B',
                getLastModified: function () {
                    return {
                        getTime: function () {
                            return '3333333333';
                        }
                    };
                },
                getCreationDate: function () {
                    return {
                        getTime: function () {
                            return '4444444444';
                        }
                    };
                }
            }
        ];

        var configMock = {
            publicView: true,
            pageSize: 1,
            pageNumber: 2

        };

        var dwProductListMock = {
            getLength: function () {
                return itemsMock.length;
            },
            toArray: function () {
                return itemsMock;
            }
        };

        var productListObjectMock = {
            owner: {
                profile: {
                    firstName: 'Jane',
                    lastName: 'Smith'
                }
            },
            public: true,
            UUID: 'UUID 12345',
            items: dwProductListMock,
            type: 'type A'
        };

        var expectResult = {
            'productList': {
                'owner': {
                    'exists': true,
                    'firstName': 'Jane',
                    'lastName': 'Smith'
                },
                'publicList': true,
                'UUID': 'UUID 12345',
                'publicView': true,
                'pageNumber': 2,
                'items': [],
                'type': 'type A',
                'length': 0,
                'showMore': false
            }
        };

        var result = new ProductList(productListObjectMock, configMock);
        assert.equal(result.productList.owner.exists, expectResult.productList.owner.exists);
        assert.equal(result.productList.owner.firstName, expectResult.productList.owner.firstName);
        assert.equal(result.productList.owner.lastName, expectResult.productList.owner.lastName);

        assert.equal(result.productList.publicList, expectResult.productList.publicList);
        assert.equal(result.productList.UUID, expectResult.productList.UUID);
        assert.equal(result.productList.length, expectResult.productList.length);
        assert.equal(result.productList.publicList, expectResult.productList.publicList);
        assert.equal(result.productList.publicView, expectResult.productList.publicView);
        assert.equal(result.productList.showMore, expectResult.productList.showMore);
        assert.equal(result.productList.items.length, expectResult.productList.items.length);
        assert.equal(result.productList.type, expectResult.productList.type);
    });

    it('should return productList when no firstName, no lastName, empty config and empty productListItem specified', function () {
        var itemsMock = [
            {
                productID: 'pid 3',
                UUID: 'UUID 789',
                product: {
                    name: 'productName C',
                    master: 'productMaster C',
                    bundle: false,
                    minOrderQuantity: {
                        value: 'minOrderQuantity C'
                    },
                    availabilityModel: 'availability model C'
                },
                quantityValue: 2,
                public: 'PublicItem C',
                getLastModified: function () {
                    return {
                        getTime: function () {
                            return '1111155555';
                        }
                    };
                },
                getCreationDate: function () {
                    return {
                        getTime: function () {
                            return '555566666';
                        }
                    };
                }
            },
            null
        ];

        var configMock = {};

        var dwProductListMock = {
            getLength: function () {
                return itemsMock.length;
            },
            toArray: function () {
                return itemsMock;
            }
        };

        var productListObjectMock = {
            public: false,
            UUID: 'UUID 67890',
            items: dwProductListMock,
            type: 'type C'
        };

        var expectResult = {
            'productList': {
                'owner': {
                    'exists': false,
                    'firstName': false,
                    'lastName': false
                },
                'publicList': false,
                'UUID': 'UUID 67890',
                'sortOrder': null,
                'length': 2,
                'items': [
                    {
                        'pid': 'pid 3',
                        'UUID': 'UUID 789',
                        'name': 'productName C',
                        'qty': 2,
                        'lastModified': '1111155555',
                        'creationDate': '555566666',
                        'publicItem': 'PublicItem C',
                        'imageObj': {
                            'product': 'some product image'
                        },
                        'priceObj': {
                            'object': 'somre price Object'
                        },
                        'master': 'productMaster C',
                        'bundle': 'productBundle C'
                    }
                ],
                'type': 'type C'
            }
        };

        var result = new ProductList(productListObjectMock, configMock);

        assert.equal(result.productList.owner.exists, expectResult.productList.owner.exists);
        assert.equal(result.productList.owner.firstName, expectResult.productList.owner.firstName);
        assert.equal(result.productList.owner.lastName, expectResult.productList.owner.lastName);

        assert.equal(result.productList.publicList, expectResult.productList.publicList);
        assert.equal(result.productList.UUID, expectResult.productList.UUID);
        assert.equal(result.productList.sortOrder, expectResult.productList.sortOrder);
        assert.equal(result.productList.length, expectResult.productList.length);

        assert.equal(result.productList.items.length, expectResult.productList.items.length);
        assert.equal(result.productList.items[0].pid, expectResult.productList.items[0].pid);
        assert.equal(result.productList.items[0].UUID, expectResult.productList.items[0].UUID);
        assert.equal(result.productList.items[0].name, expectResult.productList.items[0].name);
    });

    it('should return null when NO productList', function () {
        var configMock = {};
        var productListObjectMock = null;
        var result = new ProductList(productListObjectMock, configMock);

        assert.isNull(result.productList);
    });
});
