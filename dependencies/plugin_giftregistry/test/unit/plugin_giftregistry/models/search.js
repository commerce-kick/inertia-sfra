'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var ArrayList = require('../../../mocks/dw.util.Collection');
var assert = require('chai').assert;

var sinon = require('sinon');
var getProductListStub = sinon.stub();
var queryProfilesStub = sinon.stub();

var toArrayMock = [];

var GiftRegistrySearchModel = proxyquire('../../../../cartridges/plugin_giftregistry/cartridge/models/search', {
    'dw/web/Resource': {
        msg: function () {
            return 'urlTitle or urlText';
        },
        msgf: function () {
            return 'resourse message result';
        }
    },
    'dw/customer/CustomerMgr': {
        getCustomerByLogin: function () {
            return {
                profile: {
                    customer: {
                    },
                    firstName: 'firstName',
                    lastName: 'lastName',
                    email: 'email'
                }
            };
        },
        queryProfiles: function () {
            return {
                asList: function () {
                    return {
                        toArray: function () {
                            return toArrayMock;
                        }
                    };
                }
            };
        }
    },
    'dw/web/URLUtils': {
        url: function () {
            return 'urlToList';
        },
        https: function () {
            return {
                relative: function () {
                    return {
                        toString: function () {
                            return 'urlToList';
                        }
                    };
                }
            };
        }
    },
    'dw/customer/ProductListMgr': {
        getProductLists: getProductListStub
    }
});

beforeEach(function () {
    getProductListStub.reset();
    queryProfilesStub.reset();
    toArrayMock = [];
});

describe('GiftRegistry search', function () {
    it('should handle empty submission', function () {
        var form = {
            searchFirstName: undefined,
            searchLastName: undefined
        };
        var config = { };
        getProductListStub.returns(new ArrayList([]));

        var results = new GiftRegistrySearchModel(form.searchFirstName, form.searchLastName, config);
        assert.deepEqual(results, {});
    });

    it('should handle first and last name submission', function () {
        var form = {
            searchFirstName: 'firstName1',
            searchLastName: 'lastName1'
        };
        var config = {
            pageSize: 2,
            pageNumber: 1
        };
        toArrayMock.push({
            customer: {
                profile: {
                    firstName: 'firstName1',
                    lastName: 'lastName1',
                    email: 'email'
                }
            },
            firstName: 'firstName1',
            lastName: 'lastName1',
            email: 'email',
            id: 'id',
            url: 'url',
            urlTitle: 'urlTitle',
            urlText: 'urlText'
        });
        getProductListStub.returns(new ArrayList([
            {
                public: true,
                ID: 'idString',
                firstName: 'firstName1',
                lastName: 'lastName1',
                email: 'email',
                registrant: {
                    firstName: 'firstName',
                    lastName: 'lastName'
                },
                name: 'eventName',
                eventState: 'MA',
                coRegistrant: null,
                eventCity: 'eventCity2',
                eventCountry: 'eventCountry',
                eventDate: {
                    getDate: function () {
                        return 12;
                    },
                    getMonth: function () {
                        return 11;
                    },
                    getYear: function () {
                        return {
                            toString: function () {
                                return '2123';
                            }
                        };
                    },
                    getFullYear: function () {
                        return 2000;
                    }
                }
            }
        ]));

        var results = new GiftRegistrySearchModel(form.searchFirstName, form.searchLastName, config);
        assert.equal(results.hits.length, 1);
        assert.equal(results.hits[0].name, 'eventName');
        assert.equal(results.hits[0].city, 'eventCity2');
        assert.equal(results.hits[0].url, 'urlToList');
        assert.equal(results.hits[0].registrant.firstName, 'firstName');
        assert.equal(results.hits[0].registrant.lastName, 'lastName');
        assert.equal(results.hits[0].coRegistran, null);
        assert.equal(results.hits[0].location, 'resourse message result');
        assert.equal(results.hits[0].dateString, 'resourse message result');
        assert.equal(results.firstName, 'firstName1');
        assert.equal(results.lastName, 'lastName1');
    });

    it('should filter by the config property year', function () {
        var form = {
            searchFirstName: 'firstName2',
            searchLastName: 'lastName2'
        };
        var config = {
            year: '2000'
        };
        toArrayMock.push({
            customer: {
                profile: {
                    firstName: 'firstName2',
                    lastName: 'lastName2',
                    email: 'email'
                }
            },
            firstName: 'firstName2',
            lastName: 'lastName2',
            email: 'email',
            id: 'id',
            url: 'url',
            urlTitle: 'urlTitle',
            urlText: 'urlText'
        });
        getProductListStub.returns(new ArrayList([
            {
                public: true,
                ID: 'idString',
                firstName: 'firstName2',
                lastName: 'lastName2',
                email: 'email',
                registrant: {
                    firstName: 'firstName2',
                    lastName: 'lastName2'
                },
                name: 'eventName',
                eventState: 'MA',
                coRegistrant: null,
                eventCity: 'eventCity2',
                eventCountry: 'eventCountry',
                eventDate: {
                    getDate: function () {
                        return 12;
                    },
                    getMonth: function () {
                        return 11;
                    },
                    getYear: function () {
                        return {
                            toString: function () {
                                return '2123';
                            }
                        };
                    },
                    getFullYear: function () {
                        return 2123;
                    }
                }
            },
            {
                public: true,
                ID: 'idString',
                firstName: 'firstName2',
                lastName: 'lastName2',
                email: 'email',
                registrant: {
                    firstName: 'firstName2',
                    lastName: 'lastName2'
                },
                name: 'eventName',
                eventState: 'MA',
                coRegistrant: null,
                eventCity: 'eventCityX',
                eventCountry: 'eventCountry',
                eventDate: {
                    getDate: function () {
                        return 12;
                    },
                    getMonth: function () {
                        return 11;
                    },
                    getYear: function () {
                        return {
                            toString: function () {
                                return '2000';
                            }
                        };
                    },
                    getFullYear: function () {
                        return 2000;
                    }
                }
            }
        ]));
        var results = new GiftRegistrySearchModel(form.searchFirstName, form.searchLastName, config);
        assert.equal(results.hits.length, 1);
        assert.equal(results.hits[0].name, 'eventName');
        assert.equal(results.hits[0].city, 'eventCityX');
        assert.equal(results.hits[0].url, 'urlToList');
        assert.equal(results.hits[0].registrant.firstName, 'firstName2');
        assert.equal(results.hits[0].registrant.lastName, 'lastName2');
        assert.equal(results.hits[0].coRegistran, null);
        assert.equal(results.hits[0].location, 'resourse message result');
        assert.equal(results.hits[0].dateString, 'resourse message result');
        assert.equal(results.firstName, 'firstName2');
        assert.equal(results.lastName, 'lastName2');
    });

    it('should filter by the config property month', function () {
        var form = {
            searchFirstName: 'firstName3',
            searchLastName: 'lastName3'
        };
        var config = {
            month: 2
        };
        toArrayMock.push({
            customer: {
                profile: {
                    firstName: 'firstName3',
                    lastName: 'lastName3',
                    email: 'email'
                }
            },
            firstName: 'firstName3',
            lastName: 'lastName3',
            email: 'email',
            id: 'id',
            url: 'url',
            urlTitle: 'urlTitle',
            urlText: 'urlText'
        });
        getProductListStub.returns(new ArrayList([
            {
                public: true,
                ID: 'idString',
                firstName: 'firstName3',
                lastName: 'lastName3',
                email: 'email',
                registrant: {
                    firstName: 'firstName3',
                    lastName: 'lastName3'
                },
                name: 'eventName',
                eventState: 'MA',
                coRegistrant: null,
                eventCity: 'eventCity2',
                eventCountry: 'eventCountry',
                eventDate: {
                    getDate: function () {
                        return 12;
                    },
                    getMonth: function () {
                        return 11;
                    },
                    getYear: function () {
                        return {
                            toString: function () {
                                return '2123';
                            }
                        };
                    },
                    getFullYear: function () {
                        return 2123;
                    }
                }
            },
            {
                public: true,
                ID: 'idString',
                firstName: 'firstName3',
                lastName: 'lastName3',
                email: 'email',
                registrant: {
                    firstName: 'firstName3',
                    lastName: 'lastName3'
                },
                name: 'eventName',
                eventState: 'MA',
                coRegistrant: null,
                eventCity: 'eventCityX',
                eventCountry: 'eventCountry',
                eventDate: {
                    getDate: function () {
                        return 12;
                    },
                    getMonth: function () {
                        return 1;
                    },
                    getYear: function () {
                        return {
                            toString: function () {
                                return '2000';
                            }
                        };
                    },
                    getFullYear: function () {
                        return 2000;
                    }
                }
            }
        ]));
        var results = new GiftRegistrySearchModel(form.searchFirstName, form.searchLastName, config);
        assert.equal(results.hits.length, 1);
        assert.equal(results.hits[0].name, 'eventName');
        assert.equal(results.hits[0].city, 'eventCityX');
        assert.equal(results.hits[0].url, 'urlToList');
        assert.equal(results.hits[0].registrant.firstName, 'firstName3');
        assert.equal(results.hits[0].registrant.lastName, 'lastName3');
        assert.equal(results.hits[0].coRegistran, null);
        assert.equal(results.hits[0].location, 'resourse message result');
        assert.equal(results.hits[0].dateString, 'resourse message result');
        assert.equal(results.firstName, 'firstName3');
        assert.equal(results.lastName, 'lastName3');
    });

    it('should filter by the config property event name', function () {
        var form = {
            searchFirstName: 'firstName4',
            searchLastName: 'lastName4'
        };
        var config = {
            name: 'eventNameX'
        };
        toArrayMock.push({
            customer: {
                profile: {
                    firstName: 'firstName4',
                    lastName: 'lastName4',
                    email: 'email'
                }
            },
            firstName: 'firstName4',
            lastName: 'lastName4',
            email: 'email',
            id: 'id',
            url: 'url',
            urlTitle: 'urlTitle',
            urlText: 'urlText'
        });
        getProductListStub.returns(new ArrayList([
            {
                public: true,
                ID: 'idString',
                firstName: 'firstName4',
                lastName: 'lastName4',
                email: 'email',
                registrant: {
                    firstName: 'firstName4',
                    lastName: 'lastName4'
                },
                name: 'eventName',
                eventState: 'MA',
                coRegistrant: null,
                eventCity: 'eventCity2',
                eventCountry: 'eventCountry',
                eventDate: {
                    getDate: function () {
                        return 12;
                    },
                    getMonth: function () {
                        return 11;
                    },
                    getYear: function () {
                        return {
                            toString: function () {
                                return '2123';
                            }
                        };
                    },
                    getFullYear: function () {
                        return 2123;
                    }
                }
            },
            {
                public: true,
                ID: 'idString',
                firstName: 'firstName4',
                lastName: 'lastName4',
                email: 'email',
                registrant: {
                    firstName: 'firstName4',
                    lastName: 'lastName4'
                },
                name: 'eventNameX',
                eventState: 'MA',
                coRegistrant: null,
                eventCity: 'eventCity',
                eventCountry: 'eventCountry',
                eventDate: {
                    getDate: function () {
                        return 12;
                    },
                    getMonth: function () {
                        return 1;
                    },
                    getYear: function () {
                        return {
                            toString: function () {
                                return '2000';
                            }
                        };
                    },
                    getFullYear: function () {
                        return 2000;
                    }
                }
            }
        ]));
        var results = new GiftRegistrySearchModel(form.searchFirstName, form.searchLastName, config);
        assert.equal(results.hits.length, 1);
        assert.equal(results.hits[0].name, 'eventNameX');
        assert.equal(results.hits[0].city, 'eventCity');
        assert.equal(results.hits[0].url, 'urlToList');
        assert.equal(results.hits[0].registrant.firstName, 'firstName4');
        assert.equal(results.hits[0].registrant.lastName, 'lastName4');
        assert.equal(results.hits[0].coRegistran, null);
        assert.equal(results.hits[0].location, 'resourse message result');
        assert.equal(results.hits[0].dateString, 'resourse message result');
        assert.equal(results.firstName, 'firstName4');
        assert.equal(results.lastName, 'lastName4');
    });

    it('should filter by the config property event state', function () {
        var form = {
            searchFirstName: 'firstName4',
            searchLastName: 'lastName4'
        };
        var config = {
            state: 'MA'
        };
        toArrayMock.push({
            customer: {
                profile: {
                    firstName: 'firstName4',
                    lastName: 'lastName4',
                    email: 'email'
                }
            },
            firstName: 'firstName4',
            lastName: 'lastName4',
            email: 'email',
            id: 'id',
            url: 'url',
            urlTitle: 'urlTitle',
            urlText: 'urlText'
        });
        getProductListStub.returns(new ArrayList([
            {
                public: true,
                ID: 'idString',
                firstName: 'firstName4',
                lastName: 'lastName4',
                email: 'email',
                registrant: {
                    firstName: 'firstName4',
                    lastName: 'lastName4'
                },
                name: 'eventName',
                eventState: 'NH',
                coRegistrant: null,
                eventCity: 'eventCity2',
                eventCountry: 'eventCountry',
                eventDate: {
                    getDate: function () {
                        return 12;
                    },
                    getMonth: function () {
                        return 11;
                    },
                    getYear: function () {
                        return {
                            toString: function () {
                                return '2123';
                            }
                        };
                    },
                    getFullYear: function () {
                        return 2123;
                    }
                }
            },
            {
                public: true,
                ID: 'idString',
                firstName: 'firstName4',
                lastName: 'lastName4',
                email: 'email',
                registrant: {
                    firstName: 'firstName4',
                    lastName: 'lastName4'
                },
                name: 'eventNameX',
                eventState: 'MA',
                coRegistrant: null,
                eventCity: 'eventCity',
                eventCountry: 'eventCountry',
                eventDate: {
                    getDate: function () {
                        return 12;
                    },
                    getMonth: function () {
                        return 1;
                    },
                    getYear: function () {
                        return {
                            toString: function () {
                                return '2000';
                            }
                        };
                    },
                    getFullYear: function () {
                        return 2000;
                    }
                }
            }
        ]));
        var results = new GiftRegistrySearchModel(form.searchFirstName, form.searchLastName, config);
        assert.equal(results.hits.length, 1);
        assert.equal(results.hits[0].name, 'eventNameX');
        assert.equal(results.hits[0].city, 'eventCity');
        assert.equal(results.hits[0].url, 'urlToList');
        assert.equal(results.hits[0].registrant.firstName, 'firstName4');
        assert.equal(results.hits[0].registrant.lastName, 'lastName4');
        assert.equal(results.hits[0].coRegistran, null);
        assert.equal(results.hits[0].location, 'resourse message result');
        assert.equal(results.hits[0].dateString, 'resourse message result');
        assert.equal(results.firstName, 'firstName4');
        assert.equal(results.lastName, 'lastName4');
    });

    it('should filter by the config property event state', function () {
        var form = {
            searchFirstName: 'firstName4',
            searchLastName: 'lastName4'
        };
        var config = {
            city: 'eventCityX'
        };
        toArrayMock.push({
            customer: {
                profile: {
                    firstName: 'firstName4',
                    lastName: 'lastName4',
                    email: 'email'
                }
            },
            firstName: 'firstName4',
            lastName: 'lastName4',
            email: 'email',
            id: 'id',
            url: 'url',
            urlTitle: 'urlTitle',
            urlText: 'urlText'
        });
        getProductListStub.returns(new ArrayList([
            {
                public: true,
                ID: 'idString',
                firstName: 'firstName4',
                lastName: 'lastName4',
                email: 'email',
                registrant: {
                    firstName: 'firstName4',
                    lastName: 'lastName4'
                },
                name: 'eventName',
                eventState: 'NH',
                coRegistrant: null,
                eventCity: 'eventCity2',
                eventCountry: 'eventCountry',
                eventDate: {
                    getDate: function () {
                        return 12;
                    },
                    getMonth: function () {
                        return 11;
                    },
                    getYear: function () {
                        return {
                            toString: function () {
                                return '2123';
                            }
                        };
                    },
                    getFullYear: function () {
                        return 2123;
                    }
                }
            },
            {
                public: true,
                ID: 'idString',
                firstName: 'firstName4',
                lastName: 'lastName4',
                email: 'email',
                registrant: {
                    firstName: 'firstName4',
                    lastName: 'lastName4'
                },
                name: 'eventNameX',
                eventState: 'MA',
                coRegistrant: null,
                eventCity: 'eventCityX',
                eventCountry: 'eventCountry',
                eventDate: {
                    getDate: function () {
                        return 12;
                    },
                    getMonth: function () {
                        return 1;
                    },
                    getYear: function () {
                        return {
                            toString: function () {
                                return '2000';
                            }
                        };
                    },
                    getFullYear: function () {
                        return 2000;
                    }
                }
            }
        ]));
        var results = new GiftRegistrySearchModel(form.searchFirstName, form.searchLastName, config);
        assert.equal(results.hits.length, 1);
        assert.equal(results.hits[0].name, 'eventNameX');
        assert.equal(results.hits[0].city, 'eventCityX');
        assert.equal(results.hits[0].url, 'urlToList');
        assert.equal(results.hits[0].registrant.firstName, 'firstName4');
        assert.equal(results.hits[0].registrant.lastName, 'lastName4');
        assert.equal(results.hits[0].coRegistran, null);
        assert.equal(results.hits[0].location, 'resourse message result');
        assert.equal(results.hits[0].dateString, 'resourse message result');
        assert.equal(results.firstName, 'firstName4');
        assert.equal(results.lastName, 'lastName4');
    });

    it('should filter by the config property event country', function () {
        var form = {
            searchFirstName: 'firstName4',
            searchLastName: 'lastName4'
        };
        var config = {
            country: 'eventCountryX'
        };
        toArrayMock.push({
            customer: {
                profile: {
                    firstName: 'firstName4',
                    lastName: 'lastName4',
                    email: 'email'
                }
            },
            firstName: 'firstName4',
            lastName: 'lastName4',
            email: 'email',
            id: 'id',
            url: 'url',
            urlTitle: 'urlTitle',
            urlText: 'urlText'
        });
        getProductListStub.returns(new ArrayList([
            {
                public: true,
                ID: 'idString',
                firstName: 'firstName4',
                lastName: 'lastName4',
                email: 'email',
                registrant: {
                    firstName: 'firstName4',
                    lastName: 'lastName4'
                },
                name: 'eventName',
                eventState: 'NH',
                coRegistrant: null,
                eventCity: 'eventCity2',
                eventCountry: 'eventCountry',
                eventDate: {
                    getDate: function () {
                        return 12;
                    },
                    getMonth: function () {
                        return 11;
                    },
                    getYear: function () {
                        return {
                            toString: function () {
                                return '2123';
                            }
                        };
                    },
                    getFullYear: function () {
                        return 2123;
                    }
                }
            },
            {
                public: true,
                ID: 'idString',
                firstName: 'firstName4',
                lastName: 'lastName4',
                email: 'email',
                registrant: {
                    firstName: 'firstName4',
                    lastName: 'lastName4'
                },
                name: 'eventNameX',
                eventState: 'MA',
                coRegistrant: null,
                eventCity: 'eventCityX',
                eventCountry: 'eventCountryX',
                eventDate: {
                    getDate: function () {
                        return 12;
                    },
                    getMonth: function () {
                        return 1;
                    },
                    getYear: function () {
                        return {
                            toString: function () {
                                return '2000';
                            }
                        };
                    },
                    getFullYear: function () {
                        return 2000;
                    }
                }
            }
        ]));
        var results = new GiftRegistrySearchModel(form.searchFirstName, form.searchLastName, config);
        assert.equal(results.hits.length, 1);
        assert.equal(results.hits[0].name, 'eventNameX');
        assert.equal(results.hits[0].city, 'eventCityX');
        assert.equal(results.hits[0].url, 'urlToList');
        assert.equal(results.hits[0].registrant.firstName, 'firstName4');
        assert.equal(results.hits[0].registrant.lastName, 'lastName4');
        assert.equal(results.hits[0].coRegistran, null);
        assert.equal(results.hits[0].location, 'resourse message result');
        assert.equal(results.hits[0].dateString, 'resourse message result');
        assert.equal(results.firstName, 'firstName4');
        assert.equal(results.lastName, 'lastName4');
    });

    it('should filter by the config property event country', function () {
        var form = {
            searchFirstName: 'firstName4',
            searchLastName: 'lastName4'
        };
        var config = {
            email: 'test@everything.com'
        };
        toArrayMock.push({
            customer: {
                profile: {
                    firstName: 'firstName4',
                    lastName: 'lastName4',
                    email: 'test@everything.com'
                }
            },
            firstName: 'firstName4',
            lastName: 'lastName4',
            email: 'test@everything.com',
            id: 'id',
            url: 'url',
            urlTitle: 'urlTitle',
            urlText: 'urlText'
        });
        getProductListStub.returns(new ArrayList([
            {
                public: true,
                ID: 'idString',
                firstName: 'firstName4',
                lastName: 'lastName4',
                email: 'test@everything.com',
                registrant: {
                    firstName: 'firstName4',
                    lastName: 'lastName4'
                },
                name: 'eventName',
                eventState: 'NH',
                coRegistrant: null,
                eventCity: 'eventCity2',
                eventCountry: 'eventCountry',
                eventDate: {
                    getDate: function () {
                        return 12;
                    },
                    getMonth: function () {
                        return 11;
                    },
                    getYear: function () {
                        return {
                            toString: function () {
                                return '2123';
                            }
                        };
                    },
                    getFullYear: function () {
                        return 2123;
                    }
                }
            },
            {
                public: true,
                ID: 'idString',
                firstName: 'firstName4',
                lastName: 'lastName4',
                email: 'test@everything.com',
                registrant: {
                    firstName: 'firstName4',
                    lastName: 'lastName4'
                },
                name: 'eventNameX',
                eventState: 'MA',
                coRegistrant: null,
                eventCity: 'eventCityX',
                eventCountry: 'eventCountryX',
                eventDate: {
                    getDate: function () {
                        return 12;
                    },
                    getMonth: function () {
                        return 1;
                    },
                    getYear: function () {
                        return {
                            toString: function () {
                                return '2000';
                            }
                        };
                    },
                    getFullYear: function () {
                        return 2000;
                    }
                }
            }
        ]));
        var results = new GiftRegistrySearchModel(form.searchFirstName, form.searchLastName, config);
        assert.equal(results.hits.length, 2);
        assert.equal(results.hits[0].name, 'eventName');
        assert.equal(results.hits[0].city, 'eventCity2');
        assert.equal(results.hits[1].name, 'eventNameX');
        assert.equal(results.hits[1].city, 'eventCityX');
        assert.equal(results.hits[1].url, 'urlToList');
        assert.equal(results.hits[1].registrant.firstName, 'firstName4');
        assert.equal(results.hits[1].registrant.lastName, 'lastName4');
        assert.equal(results.hits[1].coRegistran, null);
        assert.equal(results.hits[1].location, 'resourse message result');
        assert.equal(results.hits[1].dateString, 'resourse message result');
        assert.equal(results.firstName, 'firstName4');
        assert.equal(results.lastName, 'lastName4');
    });
});
