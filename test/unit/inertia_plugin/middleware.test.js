import { describe, it, expect } from 'bun:test';

const loadModule = require('./helpers/loadModule');
const createSession = require('./mocks/session');
const createLoggerMock = require('./mocks/dw/Logger');
const URLUtilsMock = require('./mocks/dw/URLUtils');
const createResponse = require('./mocks/response');
const createRoute = require('./mocks/route');
const { createRequest, createSfraReq } = require('./mocks/request');

function setup({ headers, session, dwRequest, manifest } = {}) {
    const sess = session || createSession();
    const globalRequest = dwRequest || createRequest({ headers, httpPath: '/home' });
    const middleware = loadModule('scripts/middleware/initInertia.js', {
        mocks: {
            'dw/system/Logger': createLoggerMock(),
            'dw/web/URLUtils': URLUtilsMock,
            '*/cartridge/config/inertia': { exposeSharedPropKeys: true, rootView: 'components/layout/inertia' },
            '*/cartridge/helpers/vite': () => '<vite/>',
            ...(manifest ? { '*/cartridge/static/default/manifest.json': manifest } : {})
        },
        globals: { session: sess, request: globalRequest }
    });
    const req = createSfraReq({ headers });
    const res = createResponse();
    const route = createRoute();
    let nextCalled = false;
    middleware.init.call(route, req, res, () => { nextCalled = true; });
    return { middleware, req, res, route, session: sess, nextCalled, globalRequest };
}

// x-inertia-version matches the middleware's no-manifest fallback so render()
// takes the JSON path instead of the version-mismatch 409.
const INERTIA = { 'x-inertia': 'true', 'x-inertia-version': '1.0' };

describe('initInertia middleware — setup', () => {
    it('attaches res.inertia with a version and calls next', () => {
        const { res, nextCalled } = setup({ manifest: { 'app/app.tsx': { file: 'a.js' } } });
        expect(res.inertia).toBeDefined();
        expect(typeof res.inertia.version).toBe('string');
        expect(res.inertia.version).not.toBe('1.0'); // hashed from manifest
        expect(nextCalled).toBe(true);
    });

    it('falls back to "1.0" without a manifest', () => {
        const { res } = setup({});
        expect(res.inertia.version).toBe('1.0');
    });

    it('sets Vary: X-Inertia on every response — HTML and JSON alike', () => {
        const html = setup({ headers: {} });
        expect(html.res.headers.Vary).toBe('X-Inertia');

        const json = setup({ headers: INERTIA });
        expect(json.res.headers.Vary).toBe('X-Inertia');
    });
});

describe('initInertia middleware — errors prop', () => {
    it('resolves {} when nothing was flashed', () => {
        const { middleware } = setup({});
        expect(middleware.resolveValidationErrors({})).toEqual({});
    });

    it('returns the default bag flat', () => {
        const session = createSession();
        session.privacy.inertia_errors = JSON.stringify({ default: { email: 'Required' } });
        const { middleware } = setup({ session });
        expect(middleware.resolveValidationErrors({})).toEqual({ email: 'Required' });
    });

    it('wraps the default bag when X-Inertia-Error-Bag is present', () => {
        const session = createSession();
        session.privacy.inertia_errors = JSON.stringify({ default: { email: 'Required' } });
        const { middleware } = setup({ session });
        expect(middleware.resolveValidationErrors({ 'x-inertia-error-bag': 'login' }))
            .toEqual({ login: { email: 'Required' } });
    });

    it('returns named bags whole when there is no default bag', () => {
        const session = createSession();
        session.privacy.inertia_errors = JSON.stringify({
            login: { password: 'Wrong' },
            signup: { email: 'Taken' }
        });
        const { middleware } = setup({ session });
        expect(middleware.resolveValidationErrors({})).toEqual({
            login: { password: 'Wrong' },
            signup: { email: 'Taken' }
        });
    });

    it('shares errors as an Always prop that survives partial reloads', () => {
        const session = createSession();
        session.privacy.inertia_errors = JSON.stringify({ default: { email: 'Required' } });
        const { res } = setup({
            session,
            headers: {
                'x-inertia': 'true',
                'x-inertia-version': '1.0',
                'x-inertia-partial-component': 'default/Home/Show',
                'x-inertia-partial-data': 'unrelated'
            }
        });
        res.inertia.render('Home/Show', { unrelated: 'x', other: 'dropped' });
        expect(res.jsonData.props.errors).toEqual({ email: 'Required' });
        expect(res.jsonData.props.unrelated).toBe('x');
        expect('other' in res.jsonData.props).toBe(false);
    });

    it('errors resolve to {} on a clean render and are consumed after one render', () => {
        const session = createSession();
        session.privacy.inertia_errors = JSON.stringify({ default: { email: 'Required' } });
        const first = setup({ session, headers: INERTIA });
        first.res.inertia.render('Home/Show', {});
        expect(first.res.jsonData.props.errors).toEqual({ email: 'Required' });

        const second = setup({ session, headers: INERTIA });
        second.res.inertia.render('Home/Show', {});
        expect(second.res.jsonData.props.errors).toEqual({});
    });
});

describe('initInertia middleware — redirect interception', () => {
    it('sets 303 for PUT/PATCH/DELETE Inertia redirects', () => {
        ['PUT', 'PATCH', 'DELETE'].forEach((method) => {
            const { res, req } = setup({
                headers: INERTIA,
                dwRequest: createRequest({ headers: INERTIA, httpMethod: method })
            });
            req.httpMethod = method;
            res.redirect('/target');
            expect(res.redirectUrl).toBe('/target');
            expect(res.redirectStatus).toBe(303);
        });
    });

    it('leaves GET redirects and non-Inertia requests untouched', () => {
        const get = setup({ headers: INERTIA });
        get.res.redirect('/target');
        expect(get.res.redirectUrl).toBe('/target');
        expect(get.res.redirectStatus).toBeUndefined();

        const plain = setup({
            headers: {},
            dwRequest: createRequest({ headers: {}, httpMethod: 'DELETE' })
        });
        plain.req.httpMethod = 'DELETE';
        plain.res.redirect('/target');
        expect(plain.res.redirectStatus).toBeUndefined();
    });

    it('converts fragment redirects into a 409 with X-SF-CC-Inertia-Redirect', () => {
        const { res } = setup({ headers: INERTIA });
        res.redirect('/account#settings');
        expect(res.statusCode).toBe(409);
        expect(res.headers['X-SF-CC-Inertia-Redirect']).toBe('/account#settings');
        expect(res.printed).toEqual(['']);
        expect(res.redirectUrl).toBeUndefined();
    });

    it('lets prefetch requests follow fragment redirects normally', () => {
        const headers = { 'x-inertia': 'true', 'sec-purpose': 'prefetch;anonymous' };
        const { res } = setup({ headers });
        res.redirect('/account#settings');
        expect(res.statusCode).toBe(200);
        expect(res.redirectUrl).toBe('/account#settings');
        expect('X-SF-CC-Inertia-Redirect' in res.headers).toBe(false);
    });
});

describe('initInertia middleware — empty response handling', () => {
    it('redirects back on an empty 200 Inertia response', () => {
        const { res, route } = setup({
            headers: INERTIA,
            dwRequest: createRequest({ headers: INERTIA, httpReferer: '/came-from' })
        });
        route.emit('route:BeforeComplete', {}, res);
        expect(res.redirectUrl).toBe('/came-from');
    });

    it('falls back to Home-Show without a referer', () => {
        const { res, route } = setup({ headers: INERTIA });
        route.emit('route:BeforeComplete', {}, res);
        expect(res.redirectUrl).toBe('/mock/Home-Show');
    });

    it('does nothing when the response has renderings, a redirect, or is non-Inertia', () => {
        const rendered = setup({ headers: INERTIA });
        rendered.res.inertia.render('Home/Show', {});
        rendered.route.emit('route:BeforeComplete', {}, rendered.res);
        expect(rendered.res.redirectUrl).toBeUndefined();

        const redirected = setup({ headers: INERTIA });
        redirected.res.redirect('/elsewhere');
        redirected.route.emit('route:BeforeComplete', {}, redirected.res);
        expect(redirected.res.redirectUrl).toBe('/elsewhere');

        const plain = setup({ headers: {} });
        plain.route.emit('route:BeforeComplete', {}, plain.res);
        expect(plain.res.redirectUrl).toBeUndefined();
    });

    it('does nothing on non-200 responses', () => {
        const { res, route } = setup({ headers: INERTIA });
        res.setStatusCode(500);
        route.emit('route:BeforeComplete', {}, res);
        expect(res.redirectUrl).toBeUndefined();
    });

    it('neutralizes page caching applied by base controllers (page cache ignores Vary)', () => {
        const { res, route } = setup({ headers: {} });
        res.cachePeriod = 24; // e.g. cache.applyDefaultCache on an appended route
        res.inertia.render('Search/Show', {});
        route.emit('route:BeforeComplete', {}, res);
        expect(res.cachePeriod).toBeNull();
    });
});

describe('initInertia middleware — full flow with flash', () => {
    it('flash set during a POST survives the redirect and lands on the next render', () => {
        const session = createSession();

        // POST request: controller flashes + redirects
        const post = setup({
            session,
            headers: INERTIA,
            dwRequest: createRequest({ headers: INERTIA, httpMethod: 'POST' })
        });
        post.res.inertia.flash('success', 'Profile updated');
        post.res.redirect('/account');
        expect(post.res.redirectUrl).toBe('/account');
        expect(session.privacy.inertia_flash).toBeDefined();

        // follow-up GET renders the page: flash is delivered and consumed
        const get = setup({ session, headers: INERTIA });
        get.res.inertia.render('Account/Show', {});
        expect(get.res.jsonData.flash).toEqual({ success: 'Profile updated' });
        expect(session.privacy.inertia_flash).toBeNull();

        // next render has no flash key
        const after = setup({ session, headers: INERTIA });
        after.res.inertia.render('Account/Show', {});
        expect('flash' in after.res.jsonData).toBe(false);
    });

    it('flashErrors on POST → errors prop on next render via error bag header', () => {
        const session = createSession();

        const post = setup({ session, headers: INERTIA });
        post.res.inertia.flashErrors({ email: 'Invalid email' });
        post.res.redirect('/account');

        const get = setup({
            session,
            headers: { 'x-inertia': 'true', 'x-inertia-version': '1.0', 'x-inertia-error-bag': 'profile' }
        });
        get.res.inertia.render('Account/Show', {});
        expect(get.res.jsonData.props.errors).toEqual({ profile: { email: 'Invalid email' } });
    });
});
