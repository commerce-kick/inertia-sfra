import { describe, it, expect } from 'bun:test';

const loadModule = require('./helpers/loadModule');
const createSession = require('./mocks/session');
const createLoggerMock = require('./mocks/dw/Logger');
const URLUtilsMock = require('./mocks/dw/URLUtils');
const createResponse = require('./mocks/response');
const createRoute = require('./mocks/route');
const { createRequest, createSfraReq } = require('./mocks/request');

/**
 * In-memory stand-in for a dw.system.CacheMgr custom cache.
 */
function createCacheMgrMock() {
    const store = new Map();
    return {
        store,
        mock: {
            getCache: () => ({
                put: (key, value) => store.set(key, value),
                get: (key) => (store.has(key) ? store.get(key) : null)
            })
        }
    };
}

function createUUIDMock() {
    let n = 0;
    return { createUUID: () => 'uuid-' + (++n) };
}

/**
 * dw/system/System mock. instanceType 0 = development, PRODUCTION_SYSTEM = 2
 * (the real constants' shape; only inequality matters).
 */
function systemMock(instanceType) {
    return { getInstanceType: () => instanceType, PRODUCTION_SYSTEM: 2 };
}

const HOT_JSON = { hot: true, hmr: 'http://localhost:5173', timestamp: 0 };

function devtoolsMocks({ cache, production } = {}) {
    return {
        'dw/system/Logger': createLoggerMock(),
        'dw/web/URLUtils': URLUtilsMock,
        'dw/util/UUIDUtils': createUUIDMock(),
        'dw/system/System': systemMock(production ? 2 : 0),
        'dw/system/CacheMgr': (cache || createCacheMgrMock()).mock,
        '*/cartridge/scripts/hot.json': HOT_JSON,
        '*/cartridge/config/inertia': { exposeSharedPropKeys: true, rootView: 'components/layout/inertia' }
    };
}

/**
 * Copy of the extension's isEntry guard (sfcc-inertia-devtools/src/guards.ts) —
 * the contract every stored entry must satisfy.
 */
function isEntry(value) {
    const isObject = (v) => typeof v === 'object' && v !== null;
    return isObject(value) && isObject(value.__meta) && isObject(value.props) && isObject(value.route);
}

const ENTRY_META_KEYS = [
    'id', 'tabUuid', 'batchId', 'timestamp', 'utime', 'method', 'url',
    'component', 'requestType', 'status', 'redirectLocation', 'serverTimingMs', 'visitId'
];

function loadRecorder({ headers, httpMethod, httpPath, httpQueryString, cache } = {}) {
    const globalRequest = createRequest({ headers, httpMethod, httpPath, httpQueryString });
    globalRequest.httpProtocol = 'https';
    globalRequest.httpHost = 'sandbox.test';
    const Recorder = loadModule('scripts/devtools/Recorder.js', {
        mocks: devtoolsMocks({ cache }),
        globals: { request: globalRequest }
    });
    return { Recorder, globalRequest };
}

describe('DevTools gate', () => {
    it('is disabled when hot.json is absent', () => {
        const DevTools = loadModule('scripts/devtools/DevTools.js', {
            mocks: { 'dw/system/System': systemMock(0) }
        });
        expect(DevTools.enabled()).toBe(false);
    });

    it('is enabled in hot mode on a non-production instance', () => {
        const DevTools = loadModule('scripts/devtools/DevTools.js', {
            mocks: { '*/cartridge/scripts/hot.json': HOT_JSON, 'dw/system/System': systemMock(0) }
        });
        expect(DevTools.enabled()).toBe(true);
    });

    it('stays disabled on a production instance even with hot.json deployed', () => {
        const DevTools = loadModule('scripts/devtools/DevTools.js', {
            mocks: { '*/cartridge/scripts/hot.json': HOT_JSON, 'dw/system/System': systemMock(2) }
        });
        expect(DevTools.enabled()).toBe(false);
    });
});

describe('EntryStore', () => {
    function loadStore(cache) {
        return loadModule('scripts/devtools/EntryStore.js', {
            mocks: { 'dw/system/Logger': createLoggerMock(), 'dw/system/CacheMgr': cache.mock }
        });
    }

    it('round-trips an entry as JSON', () => {
        const cache = createCacheMgrMock();
        const store = loadStore(cache);
        const entry = { __meta: { id: 'a' }, props: {}, route: { uri: '/x' } };
        store.put('a', entry);
        expect(store.get('a')).toEqual(entry);
        expect(typeof cache.store.get('a')).toBe('string');
    });

    it('returns null for unknown ids', () => {
        const store = loadStore(createCacheMgrMock());
        expect(store.get('nope')).toBeNull();
    });

    it('drops propValues and responseBody from oversized entries', () => {
        const store = loadStore(createCacheMgrMock());
        const entry = {
            __meta: { id: 'big' },
            props: {},
            propValues: { blob: 'x'.repeat(store.MAX_ENTRY_BYTES) },
            http: { responseBody: { status: 'present', value: {} } },
            route: { uri: '/x' }
        };
        store.put('big', entry);
        const stored = store.get('big');
        expect(stored.propValues).toBeUndefined();
        expect(stored.http.responseBody).toEqual({ status: 'omitted', reason: 'too-large' });
    });
});

describe('Recorder — request type resolution', () => {
    const cases = [
        ['navigate', { 'x-inertia': 'true' }],
        ['partial', { 'x-inertia': 'true', 'x-inertia-partial-component': 'Home' }],
        ['deferred', { 'x-inertia': 'true', 'x-inertia-devtools-deferred': '1' }],
        ['poll', { 'x-inertia': 'true', 'x-inertia-devtools-poll': '1' }],
        ['prefetch', { 'x-inertia': 'true', purpose: 'prefetch' }]
    ];

    for (const [expected, headers] of cases) {
        it(`resolves ${expected}`, () => {
            const { Recorder } = loadRecorder({ headers });
            const recorder = new Recorder(createSfraReq({ headers }));
            expect(recorder.requestType()).toBe(expected);
        });
    }

    it('resolves initial for a non-Inertia request that rendered a page', () => {
        const { Recorder } = loadRecorder({});
        const recorder = new Recorder(createSfraReq({}));
        recorder.pageRendered('default/Home', { component: 'default/Home', props: {} });
        expect(recorder.requestType()).toBe('initial');
    });

    it('resolves http for a non-Inertia request that rendered no page', () => {
        const { Recorder } = loadRecorder({});
        const recorder = new Recorder(createSfraReq({}));
        expect(recorder.requestType()).toBe('http');
    });

    it('deferred wins over partial (header precedence)', () => {
        const headers = {
            'x-inertia': 'true',
            'x-inertia-devtools-deferred': '1',
            'x-inertia-partial-component': 'Home'
        };
        const { Recorder } = loadRecorder({ headers });
        expect(new Recorder(createSfraReq({ headers })).requestType()).toBe('deferred');
    });
});

describe('Recorder — lineage', () => {
    it('adopts the incoming parent as batchId and parentOut on Inertia visits', () => {
        const headers = { 'x-inertia': 'true', 'x-inertia-devtools-parent': 'parent-1' };
        const { Recorder } = loadRecorder({ headers });
        const recorder = new Recorder(createSfraReq({ headers }));
        expect(recorder.batchId).toBe('parent-1');
        expect(recorder.parentOut).toBe('parent-1');
    });

    it('starts a new batch with its own id when no parent is sent', () => {
        const headers = { 'x-inertia': 'true' };
        const { Recorder } = loadRecorder({ headers });
        const recorder = new Recorder(createSfraReq({ headers }));
        expect(recorder.batchId).toBeNull();
        expect(recorder.parentOut).toBe(recorder.id);
    });

    it('ignores the parent header on non-Inertia requests', () => {
        const headers = { 'x-inertia-devtools-parent': 'parent-1' };
        const { Recorder } = loadRecorder({ headers });
        const recorder = new Recorder(createSfraReq({ headers }));
        expect(recorder.batchId).toBeNull();
    });

    it('a prefetch keeps its own id as parentOut — it must not advance the cursor', () => {
        const headers = { 'x-inertia': 'true', purpose: 'prefetch', 'x-inertia-devtools-parent': 'parent-1' };
        const { Recorder } = loadRecorder({ headers });
        const recorder = new Recorder(createSfraReq({ headers }));
        expect(recorder.batchId).toBe('parent-1');
        expect(recorder.parentOut).toBe(recorder.id);
    });
});

describe('Recorder — prop classification', () => {
    const Prop = loadModule('scripts/inertia/Prop.js', { mocks: {} });

    function classify(prop) {
        const { Recorder } = loadRecorder({});
        return Recorder.classifyProp(prop);
    }

    it('classifies AlwaysProp as always', () => {
        expect(classify(new Prop.AlwaysProp(1)).inertiaType).toBe('always');
    });

    it('classifies ScrollProp as scroll', () => {
        expect(classify(new Prop.ScrollProp({ data: [], meta: {} })).inertiaType).toBe('scroll');
    });

    it('classifies DeferProp as defer with its group', () => {
        const meta = classify(new Prop.DeferProp(() => 1, 'aside'));
        expect(meta.inertiaType).toBe('defer');
        expect(meta.deferGroup).toBe('aside');
    });

    it('classifies OptionalProp as optional', () => {
        expect(classify(new Prop.OptionalProp(() => 1)).inertiaType).toBe('optional');
    });

    it('classifies MergeProp as merge, appending at root', () => {
        const meta = classify(new Prop.MergeProp([1]));
        expect(meta.inertiaType).toBe('merge');
        expect(meta.mergeDirection).toBe('append');
        expect(meta.deepMerge).toBe(false);
    });

    it('tracks prepend direction and deep merges', () => {
        expect(classify(new Prop.MergeProp([1]).prepend()).mergeDirection).toBe('prepend');
        expect(classify(new Prop.MergeProp({}).deepMerge()).deepMerge).toBe(true);
    });

    it('classifies OnceProp as once', () => {
        const meta = classify(new Prop.OnceProp(() => 1));
        expect(meta.inertiaType).toBe('once');
        expect(meta.once).toBe(true);
    });

    it('leaves plain values untyped', () => {
        expect(classify('hello').inertiaType).toBeNull();
    });
});

/**
 * Full pipeline: initInertia middleware + Inertia.render + BeforeComplete,
 * with the recorder enabled — asserting on stamped headers, the stored entry,
 * and the initial-id tag.
 */
describe('Recorder — end-to-end through the middleware', () => {
    function setup({ headers, httpMethod, props } = {}) {
        const cache = createCacheMgrMock();
        const globalRequest = createRequest({ headers, httpMethod, httpPath: '/on/demandware.store/Sites-Test-Site/en_US/Home-Show' });
        globalRequest.httpProtocol = 'https';
        globalRequest.httpHost = 'sandbox.test';

        const middleware = loadModule('scripts/middleware/initInertia.js', {
            mocks: {
                ...devtoolsMocks({ cache }),
                '*/cartridge/helpers/vite': () => '<vite/>'
            },
            globals: { session: createSession(), request: globalRequest }
        });

        const req = createSfraReq({ headers, httpMethod });
        const res = createResponse();
        const route = createRoute();
        middleware.init.call(route, req, res, () => {});
        return { cache, req, res, route };
    }

    function storedEntry(cache) {
        const values = [...cache.store.values()];
        expect(values.length).toBe(1);
        return JSON.parse(values[0]);
    }

    it('records a full-page load: entry passes isEntry with complete meta, headers stamped, tag emitted', () => {
        const { cache, res, route } = setup({ headers: {} });
        res.inertia.share('auth', { user: null });
        res.inertia.render('Home', { title: 'Hi' });
        route.emit('route:BeforeComplete', null, res);

        expect(res.headers['X-SF-CC-Inertia-Devtools-Id']).toBeDefined();
        expect(res.headers['X-SF-CC-Inertia-Devtools-Parent-Out']).toBe(res.headers['X-SF-CC-Inertia-Devtools-Id']);
        expect(res.viewData.devtoolsIdJson).toBe(JSON.stringify(res.headers['X-SF-CC-Inertia-Devtools-Id']));

        const entry = storedEntry(cache);
        expect(isEntry(entry)).toBe(true);
        for (const key of ENTRY_META_KEYS) {
            expect(Object.prototype.hasOwnProperty.call(entry.__meta, key)).toBe(true);
        }
        expect(entry.__meta.requestType).toBe('initial');
        expect(entry.__meta.status).toBe(200);
        expect(entry.__meta.component).toBe('default/Home');
        expect(entry.__meta.url).toBe('https://sandbox.test/on/demandware.store/Sites-Test-Site/en_US/Home-Show');
        expect(entry.props['auth'].shared).toBe(true);
        expect(entry.props['title'].shared).toBe(false);
        expect(entry.propValues.title).toBe('Hi');
        expect(entry.http.responseBody.status).toBe('present');
        expect(entry.http.responseBody.value.component).toBe('default/Home');
        expect(entry.route.name).toBe('Home-Show');
        expect(entry.componentPath).toBe('app/pages/default/Home.tsx');
    });

    it('records an Inertia XHR as navigate with JSON response headers', () => {
        const headers = { 'x-inertia': 'true', 'x-inertia-version': '1.0' };
        const { cache, res, route } = setup({ headers });
        res.inertia.render('Home', {});
        route.emit('route:BeforeComplete', null, res);

        const entry = storedEntry(cache);
        expect(entry.__meta.requestType).toBe('navigate');
        expect(entry.http.responseHeaders['x-sf-cc-inertia']).toBe('true');
        expect(entry.http.responseHeaders['content-type']).toContain('application/json');
        // No initial-id tag on XHR responses (viewData was reset by res.json)
        expect(res.viewData.devtoolsIdJson).toBeUndefined();
    });

    it('backfills deferred prop metadata on the initial response', () => {
        const { cache, res, route } = setup({ headers: {} });
        res.inertia.render('Home', {
            stats: res.inertia.defer(() => ({ n: 1 }), 'aside')
        });
        route.emit('route:BeforeComplete', null, res);

        const entry = storedEntry(cache);
        expect(entry.props['stats']).toBeDefined();
        expect(entry.props['stats'].inertiaType).toBe('defer');
        expect(entry.props['stats'].deferGroup).toBe('aside');
        expect(entry.propValues.stats).toBeUndefined();
    });

    it('flags rescued deferred props on the follow-up request', () => {
        const headers = {
            'x-inertia': 'true',
            'x-inertia-version': '1.0',
            'x-inertia-partial-component': 'default/Home',
            'x-inertia-partial-data': 'broken'
        };
        const { cache, res, route } = setup({ headers });
        res.inertia.render('Home', {
            broken: res.inertia.defer(() => { throw new Error('boom'); }, 'default', true)
        });
        route.emit('route:BeforeComplete', null, res);

        const entry = storedEntry(cache);
        expect(entry.props['broken'].rescued).toBe(true);
        expect(entry.props['broken'].inertiaType).toBe('defer');
    });

    it('records redirects with status and location', () => {
        const headers = { 'x-inertia': 'true', 'x-inertia-version': '1.0' };
        const { cache, res, route } = setup({ headers, httpMethod: 'POST' });
        res.redirect('/checkout');
        route.emit('route:BeforeComplete', null, res);

        const entry = storedEntry(cache);
        expect(entry.__meta.status).toBe(302);
        expect(entry.__meta.redirectLocation).toBe('/checkout');
        expect(entry.__meta.requestType).toBe('navigate');
        expect(entry.http.responseBody).toEqual({ status: 'empty' });
    });

    it('records the 409 location path (external redirect / version conflict)', () => {
        const headers = { 'x-inertia': 'true', 'x-inertia-version': 'stale' };
        const { cache, res, route } = setup({ headers });
        res.inertia.render('Home', {});
        route.emit('route:BeforeComplete', null, res);

        const entry = storedEntry(cache);
        expect(entry.__meta.status).toBe(409);
        expect(entry.__meta.redirectLocation).toBeDefined();
        expect(entry.http.responseHeaders['x-sf-cc-inertia-location']).toBeDefined();
    });

    it('redacts cookies and authorization from request headers', () => {
        const headers = { 'x-inertia': 'true', 'x-inertia-version': '1.0', cookie: 'dwsid=secret', authorization: 'Basic x' };
        const { cache, res, route } = setup({ headers });
        res.inertia.render('Home', {});
        route.emit('route:BeforeComplete', null, res);

        const entry = storedEntry(cache);
        expect(entry.http.requestHeaders.cookie).toBeUndefined();
        expect(entry.http.requestHeaders.authorization).toBeUndefined();
        expect(entry.http.requestHeaders['x-inertia']).toBe('true');
    });

    it('records nothing and stamps nothing when the gate is off', () => {
        const globalRequest = createRequest({});
        const middleware = loadModule('scripts/middleware/initInertia.js', {
            mocks: {
                'dw/system/Logger': createLoggerMock(),
                'dw/web/URLUtils': URLUtilsMock,
                '*/cartridge/config/inertia': { exposeSharedPropKeys: true, rootView: 'components/layout/inertia' },
                '*/cartridge/helpers/vite': () => '<vite/>'
                // no hot.json mock -> DevTools.enabled() is false
            },
            globals: { session: createSession(), request: globalRequest }
        });
        const res = createResponse();
        const route = createRoute();
        middleware.init.call(route, createSfraReq({}), res, () => {});
        res.inertia.render('Home', {});
        route.emit('route:BeforeComplete', null, res);

        expect(res.headers['X-SF-CC-Inertia-Devtools-Id']).toBeUndefined();
        expect(res.viewData.devtoolsIdJson).toBeNull();
    });
});

describe('InertiaDevTools controller — Entries', () => {
    function loadController({ cache, enabled = true } = {}) {
        const routes = {};
        const serverMock = {
            get(name, ...handlers) {
                routes[name] = handlers[handlers.length - 1];
            },
            exports: () => routes
        };
        const mocks = {
            server: serverMock,
            'dw/system/Logger': createLoggerMock(),
            'dw/system/CacheMgr': (cache || createCacheMgrMock()).mock,
            'dw/system/System': systemMock(0)
        };
        if (enabled) {
            mocks['*/cartridge/scripts/hot.json'] = HOT_JSON;
        }
        return loadModule('controllers/InertiaDevTools.js', { mocks });
    }

    function invoke(routes, id) {
        const res = createResponse({ viewData: { action: 'InertiaDevTools-Entries', locale: 'en_US' } });
        routes.Entries({ querystring: { id } }, res, () => {});
        return res;
    }

    it('serves a stored entry as bare JSON without viewData pollution', () => {
        const cache = createCacheMgrMock();
        const entry = { __meta: { id: 'e1' }, props: {}, route: { uri: '/x' } };
        cache.store.set('e1', JSON.stringify(entry));

        const res = invoke(loadController({ cache }), 'e1');
        expect(res.statusCode).toBe(200);
        expect(res.jsonData).toEqual(entry);
        expect(res.jsonData.action).toBeUndefined();
    });

    it('404s for unknown ids', () => {
        const res = invoke(loadController({}), 'missing');
        expect(res.statusCode).toBe(404);
    });

    it('404s when devtools is disabled', () => {
        const cache = createCacheMgrMock();
        cache.store.set('e1', JSON.stringify({ __meta: {}, props: {}, route: {} }));
        const res = invoke(loadController({ cache, enabled: false }), 'e1');
        expect(res.statusCode).toBe(404);
    });
});
