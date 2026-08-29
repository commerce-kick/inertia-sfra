import { describe, it, expect } from 'bun:test';

const loadModule = require('./helpers/loadModule');
const createSession = require('./mocks/session');
const createLoggerMock = require('./mocks/dw/Logger');
const { createRequest, createSfraReq } = require('./mocks/request');

function loadResponse({ session, request, manifest, config } = {}) {
    return loadModule('scripts/inertia/Response.js', {
        mocks: {
            'dw/system/Logger': createLoggerMock(),
            '*/cartridge/config/inertia': config || { exposeSharedPropKeys: true, rootView: 'components/layout/inertia' },
            '*/cartridge/static/default/manifest.json': manifest || {}
        },
        globals: {
            session: session || createSession(),
            request: request || createRequest()
        }
    });
}

describe('Response.resolveUrl', () => {
    it('returns raw path + query from the request', () => {
        const request = createRequest({
            httpPath: '/s/Site/search',
            httpQueryString: 'q=shoes&color=red&color=blue'
        });
        const Response = loadResponse({ request });
        expect(Response.resolveUrl(null)).toBe('/s/Site/search?q=shoes&color=red&color=blue');
    });

    it('preserves trailing slashes and omits ? when no query', () => {
        const request = createRequest({ httpPath: '/s/Site/cart/', httpQueryString: '' });
        const Response = loadResponse({ request });
        expect(Response.resolveUrl(null)).toBe('/s/Site/cart/');
    });

    it('honors a custom url resolver', () => {
        const Response = loadResponse({});
        expect(Response.resolveUrl(() => '/custom')).toBe('/custom');
    });
});

describe('Response.resolveComponent', () => {
    it('prefixes default/ when no locale override exists', () => {
        const Response = loadResponse({});
        expect(Response.resolveComponent('Home/Show', 'en_US')).toBe('default/Home/Show');
    });

    it('uses the locale variant when present in the manifest', () => {
        const Response = loadResponse({
            manifest: { 'app/pages/fr_FR/Home/Show.tsx': { file: 'x.js' } }
        });
        expect(Response.resolveComponent('Home/Show', 'fr_FR')).toBe('fr_FR/Home/Show');
        expect(Response.resolveComponent('Home/Show', 'en_US')).toBe('default/Home/Show');
    });
});

describe('Response.buildPage', () => {
    function buildPage({ session, request, props, sharedProps, encryptHistory, version } = {}) {
        const sess = session || createSession();
        const req = request || createRequest({ httpPath: '/home', httpQueryString: '' });
        const Response = loadResponse({ session: sess, request: req });
        const page = Response.buildPage({
            req: createSfraReq({ headers: {} }),
            component: 'default/Home/Show',
            sharedProps: sharedProps || {},
            props: props || {},
            version: version !== undefined ? version : 'abc123',
            encryptHistory: !!encryptHistory
        });
        return { page, Response, session: sess };
    }

    it('always emits component, props, url, version', () => {
        const { page } = buildPage({ props: { a: 1 } });
        expect(page.component).toBe('default/Home/Show');
        expect(page.props.a).toBe(1);
        expect(page.url).toBe('/home');
        expect(page.version).toBe('abc123');
    });

    it('omits all empty metadata and false flags (regression: clearHistory/encryptHistory always emitted)', () => {
        const { page } = buildPage({ props: { plain: 'v' } });
        expect(Object.keys(page).sort()).toEqual(['component', 'props', 'url', 'version']);
        expect('clearHistory' in page).toBe(false);
        expect('encryptHistory' in page).toBe(false);
        expect('mergeProps' in page).toBe(false);
        expect('flash' in page).toBe(false);
    });

    it('emits encryptHistory: true when enabled', () => {
        const { page } = buildPage({ encryptHistory: true });
        expect(page.encryptHistory).toBe(true);
    });

    it('pulls clearHistory from the session exactly once', () => {
        const session = createSession();
        session.privacy.inertia_clear_history = '1';
        const first = buildPage({ session });
        expect(first.page.clearHistory).toBe(true);

        const second = loadResponse({ session, request: createRequest() }).buildPage({
            req: createSfraReq({}),
            component: 'default/Home/Show',
            sharedProps: {},
            props: {},
            version: null,
            encryptHistory: false
        });
        expect('clearHistory' in second).toBe(false);
    });

    it('emits flash as a top-level page key, not merged into props (regression)', () => {
        const session = createSession();
        session.privacy.inertia_flash = JSON.stringify({ success: 'Saved!' });
        const { page } = buildPage({ session, props: { item: 1 } });
        expect(page.flash).toEqual({ success: 'Saved!' });
        expect('success' in page.props).toBe(false);
        // consumed
        expect(session.privacy.inertia_flash).toBeNull();
    });

    it('pulls preserveFragment once', () => {
        const session = createSession();
        session.privacy.inertia_preserve_fragment = '1';
        const { page } = buildPage({ session });
        expect(page.preserveFragment).toBe(true);
        expect(session.privacy.inertia_preserve_fragment).toBeNull();
    });

    it('merges resolver metadata into the page', () => {
        const Prop = loadModule('scripts/inertia/Prop.js');
        const { page } = buildPage({
            props: { posts: new Prop.MergeProp([1]) },
            sharedProps: { locale: 'en' }
        });
        expect(page.mergeProps).toEqual(['posts']);
        expect(page.sharedProps).toEqual(['locale']);
        expect(page.props.locale).toBe('en');
    });
});
