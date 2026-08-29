import { describe, it, expect } from 'bun:test';

const loadModule = require('./helpers/loadModule');
const createSession = require('./mocks/session');
const createLoggerMock = require('./mocks/dw/Logger');
const URLUtilsMock = require('./mocks/dw/URLUtils');
const createResponse = require('./mocks/response');
const { createRequest, createSfraReq } = require('./mocks/request');

function setup({ headers, session, request, manifest, querystring } = {}) {
    const sess = session || createSession();
    const dwRequest = request || createRequest({ headers, httpPath: '/home', httpQueryString: '' });
    const viteCalls = [];
    const Inertia = loadModule('scripts/inertia/Inertia.js', {
        mocks: {
            'dw/system/Logger': createLoggerMock(),
            'dw/web/URLUtils': URLUtilsMock,
            '*/cartridge/config/inertia': { exposeSharedPropKeys: true, rootView: 'components/layout/inertia' },
            '*/cartridge/static/default/manifest.json': manifest || {},
            '*/cartridge/helpers/vite': (entries) => { viteCalls.push(entries); return '<vite/>'; }
        },
        globals: { session: sess, request: dwRequest }
    });
    const req = createSfraReq({ headers, querystring });
    const res = createResponse();
    const inertia = new Inertia(req, res);
    return { Inertia, inertia, req, res, session: sess, dwRequest, viteCalls };
}

const INERTIA_HEADERS = { 'x-inertia': 'true' };

describe('Inertia facade — factories and shared props', () => {
    it('prop factories return the right types with expected config', () => {
        const { inertia } = setup();
        const Prop = loadModule('scripts/inertia/Prop.js');

        expect(inertia.optional(() => 1).__ignoreFirstLoad).toBe(true);
        expect(inertia.lazy(() => 1).__ignoreFirstLoad).toBe(true); // deprecated alias
        expect(inertia.always(1).__alwaysProp).toBe(true);
        expect(inertia.defer(() => 1, 'side', true).shouldRescue()).toBe(true);
        expect(inertia.defer(() => 1, 'side').group()).toBe('side');
        expect(inertia.merge([1]).shouldMerge()).toBe(true);
        expect(inertia.deepMerge({}).shouldDeepMerge()).toBe(true);
        expect(inertia.prepend([1]).prependsAtRoot()).toBe(true);
        expect(inertia.once(() => 1).shouldResolveOnce()).toBe(true);
        expect(inertia.scroll({}, 'items').wrapper).toBe('items');
        expect(Prop.isPropType(inertia.merge([]))).toBe(true);
    });

    it('share() accepts key/value and object forms; getShared/flushShared', () => {
        const { inertia } = setup();
        inertia.share('locale', 'en');
        inertia.share({ auth: { user: null }, nav: [] });
        expect(inertia.getShared('locale')).toBe('en');
        expect(Object.keys(inertia.getShared())).toEqual(['locale', 'auth', 'nav']);
        inertia.flushShared();
        expect(inertia.getShared()).toEqual({});
    });

    it('flash() merges key/value and object forms into the session', () => {
        const { inertia, session } = setup();
        inertia.flash('success', 'Saved!');
        inertia.flash({ warning: 'Careful' });
        expect(JSON.parse(session.privacy.inertia_flash)).toEqual({
            success: 'Saved!',
            warning: 'Careful'
        });
    });

    it('clearHistory()/preserveFragment() set session flags', () => {
        const { inertia, session } = setup();
        inertia.clearHistory();
        inertia.preserveFragment();
        expect(session.privacy.inertia_clear_history).toBe('1');
        expect(session.privacy.inertia_preserve_fragment).toBe('1');
    });
});

describe('Inertia facade — flashErrors', () => {
    it('stores plain error objects under the default bag', () => {
        const { inertia, session } = setup();
        inertia.flashErrors({ email: 'Required' });
        expect(JSON.parse(session.privacy.inertia_errors)).toEqual({
            default: { email: 'Required' }
        });
    });

    it('stores named bags without clobbering others', () => {
        const { inertia, session } = setup();
        inertia.flashErrors({ email: 'Required' });
        inertia.flashErrors({ password: 'Too short' }, 'login');
        expect(JSON.parse(session.privacy.inertia_errors)).toEqual({
            default: { email: 'Required' },
            login: { password: 'Too short' }
        });
    });

    it('maps SFRA forms via htmlName like formErrors.getFormErrors', () => {
        const { Inertia } = setup();
        const form = {
            formType: 'formGroup',
            customer: {
                formType: 'formGroup',
                email: {
                    formType: 'formField',
                    htmlName: 'dwfrm_profile_customer_email',
                    valid: false,
                    error: 'Invalid email'
                },
                firstName: {
                    formType: 'formField',
                    htmlName: 'dwfrm_profile_customer_firstName',
                    valid: true
                }
            }
        };
        expect(Inertia.mapSfraFormErrors(form)).toEqual({
            dwfrm_profile_customer_email: 'Invalid email'
        });
    });

    it('flashErrors detects SFRA forms', () => {
        const { inertia, session } = setup();
        inertia.flashErrors({
            formType: 'formGroup',
            email: { formType: 'formField', htmlName: 'em', valid: false, error: 'Bad' }
        });
        expect(JSON.parse(session.privacy.inertia_errors)).toEqual({ default: { em: 'Bad' } });
    });
});

describe('Inertia facade — createPaginator', () => {
    it('derives pages from start/sz with currentPage (regression: current_start)', () => {
        const { inertia } = setup({ querystring: { start: '12', sz: '12' } });
        const paginator = inertia.createPaginator([1, 2, 3], 40);
        expect(paginator.meta).toEqual({
            pageName: 'start',
            previousPage: 0,
            nextPage: 24,
            currentPage: 12
        });
        expect(paginator.data).toEqual([1, 2, 3]);
    });

    it('clamps the last page', () => {
        const { inertia } = setup({ querystring: { start: '36', sz: '12' } });
        expect(inertia.createPaginator([], 40).meta.nextPage).toBe(null);
    });
});

describe('Inertia facade — render', () => {
    it('resets viewData before res.json (regression: action/queryString/locale pollution)', () => {
        const { inertia, res } = setup({
            headers: { 'x-inertia': 'true', 'x-inertia-version': 'v1' }
        });
        // SFRA route state + base-controller models that json() would merge in.
        res.viewData.action = 'Home-Show';
        res.viewData.queryString = '';
        res.viewData.locale = 'en_US';
        res.viewData.productSearch = { huge: 'model' };
        inertia.setVersion('v1');
        inertia.render('Home/Show', { title: 'Hi' });

        expect('action' in res.jsonData).toBe(false);
        expect('queryString' in res.jsonData).toBe(false);
        expect('locale' in res.jsonData).toBe(false);
        expect('productSearch' in res.jsonData).toBe(false);
        expect(Object.keys(res.jsonData).sort()).toEqual(['component', 'props', 'url', 'version']);
    });

    it('replaces a base controller ISML rendering on appended routes (regression: HTML+JSON concat)', () => {
        const { inertia, res } = setup({
            headers: { 'x-inertia': 'true', 'x-inertia-version': 'v1' }
        });
        // Simulate server.append: the base controller queued a template first.
        res.render('search/searchResults', { productSearch: {} });
        inertia.setVersion('v1');
        inertia.render('Search/Show', { products: [1] });

        const renders = res.renderings.filter((r) => r.type === 'render');
        expect(renders.length).toBe(1);
        expect(renders[0].subType).toBe('json'); // ISML rendering was replaced
        expect(res.jsonData.component).toBe('default/Search/Show');
        expect('productSearch' in res.jsonData).toBe(false);
    });

    it('renders JSON with headers for Inertia requests', () => {
        const { inertia, res } = setup({
            headers: { 'x-inertia': 'true', 'x-inertia-version': 'v1' }
        });
        inertia.setVersion('v1');
        inertia.share('locale', 'en');
        inertia.render('Home/Show', { title: 'Hi' });

        expect(res.headers['X-SF-CC-Inertia']).toBe('true');
        expect(res.headers['X-SF-CC-Inertia-Version']).toBe('v1');
        expect(res.jsonData.component).toBe('default/Home/Show');
        expect(res.jsonData.props.title).toBe('Hi');
        expect(res.jsonData.props.locale).toBe('en');
        expect(res.jsonData.sharedProps).toEqual(['locale']);
        expect(res.jsonData.url).toBe('/home');
        expect(res.jsonData.version).toBe('v1');
    });

    it('renders the root view with app/pages asset paths for full loads (regression: app/Pages)', () => {
        const { inertia, res, viteCalls } = setup({ headers: {} });
        inertia.render('Home/Show', {});

        const rendering = res.renderings.find((r) => r.subType === 'isml');
        expect(rendering.view).toBe('components/layout/inertia');
        expect(res.viewData.page.component).toBe('default/Home/Show');
        expect(res.viewData.viteTags).toBe('<vite/>');
        expect(viteCalls[0]).toEqual(['app/app.tsx', 'app/pages/default/Home/Show.tsx']);
    });

    it('passes pageJson for the v3 script-tag boot, with "<" escaped against </script> breakout', () => {
        const { inertia, res } = setup({ headers: {} });
        inertia.render('Home/Show', { html: '</script><script>alert(1)</script>' });

        expect(typeof res.viewData.pageJson).toBe('string');
        expect(res.viewData.pageJson).not.toContain('<');
        expect(res.viewData.pageJson).toContain('\\u003c/script'); // escaped form present
        // round-trips to the same page object
        const parsed = JSON.parse(res.viewData.pageJson);
        expect(parsed.component).toBe('default/Home/Show');
        expect(parsed.props.html).toBe('</script><script>alert(1)</script>');
    });

    it('returns 409 with location AND version headers on version mismatch, empty body', () => {
        const { inertia, res, session } = setup({
            headers: { 'x-inertia': 'true', 'x-inertia-version': 'stale' }
        });
        session.privacy.inertia_flash = JSON.stringify({ keep: 'me' });
        inertia.setVersion('fresh');
        inertia.render('Home/Show', {});

        expect(res.statusCode).toBe(409);
        expect(res.headers['X-SF-CC-Inertia-Location']).toBe('/home');
        expect(res.headers['X-SF-CC-Inertia-Version']).toBe('fresh');
        expect(res.printed).toEqual(['']);
        expect(res.jsonData).toBeUndefined();
        // flash survives the 409 — nothing was pulled
        expect(session.privacy.inertia_flash).toBeDefined();
    });

    it('does not 409 when versions match or on non-GET', () => {
        const matching = setup({ headers: { 'x-inertia': 'true', 'x-inertia-version': 'v1' } });
        matching.inertia.setVersion('v1');
        matching.inertia.render('Home/Show', {});
        expect(matching.res.statusCode).toBe(200);

        const post = setup({
            headers: { 'x-inertia': 'true', 'x-inertia-version': 'stale' },
            request: createRequest({ httpMethod: 'POST', headers: { 'x-inertia': 'true', 'x-inertia-version': 'stale' } })
        });
        post.req.httpMethod = 'POST';
        post.inertia.setVersion('fresh');
        post.inertia.render('Home/Show', {});
        expect(post.res.statusCode).toBe(200);
    });

    it('partial reload with nested paths flows end to end', () => {
        const { inertia, res } = setup({
            headers: {
                'x-inertia': 'true',
                'x-inertia-partial-component': 'default/Home/Show',
                'x-inertia-partial-data': 'auth.permissions'
            }
        });
        inertia.render('Home/Show', {
            auth: {
                user: 'Jonathan',
                permissions: inertia.optional(() => ['admin'])
            },
            other: 'skipped'
        });
        expect(res.jsonData.props.auth.permissions).toEqual(['admin']);
        expect('user' in res.jsonData.props.auth).toBe(false);
        expect('other' in res.jsonData.props).toBe(false);
    });
});

describe('Inertia facade — location and back', () => {
    it('location() on an Inertia request → 409 + header + empty string body (not {})', () => {
        const { inertia, res } = setup({ headers: INERTIA_HEADERS });
        inertia.location('https://elsewhere.example');
        expect(res.statusCode).toBe(409);
        expect(res.headers['X-SF-CC-Inertia-Location']).toBe('https://elsewhere.example');
        expect(res.printed).toEqual(['']);
        expect(res.jsonData).toBeUndefined();
    });

    it('location() on a plain request → normal redirect', () => {
        const { inertia, res } = setup({ headers: {} });
        inertia.location('https://elsewhere.example');
        expect(res.redirectUrl).toBe('https://elsewhere.example');
        expect(res.statusCode).toBe(200);
    });

    it('back() uses the referer, falling back to Home-Show', () => {
        const withReferer = setup({
            request: createRequest({ httpReferer: '/previous-page' })
        });
        withReferer.inertia.back();
        expect(withReferer.res.redirectUrl).toBe('/previous-page');

        const noReferer = setup({});
        noReferer.inertia.back();
        expect(noReferer.res.redirectUrl).toBe('/mock/Home-Show');
    });
});
