import { describe, it, expect } from 'bun:test';

const loadModule = require('./helpers/loadModule');
const createResponse = require('./mocks/response');
const { createSfraReq } = require('./mocks/request');

/**
 * shareData is the only place global props are attached. Its CSRF duty is
 * load-bearing twice over: the root ISML reads pdict.csrf.token for its
 * <meta name="csrf-token">, and every SFRA JSON mutation the frontend fires
 * must carry the token in its payload.
 */

const CATALOG = {
    getSiteCatalog: () => ({
        getRoot: () => ({
            hasOnlineSubCategories: () => false,
            getOnlineSubCategories: () => null
        })
    })
};

function csrfMock(token) {
    var calls = 0;
    return {
        calls: () => calls,
        middleware: {
            generateToken: function (req, res, next) {
                calls += 1;
                if (!res.getViewData().csrf) {
                    res.setViewData({ csrf: { tokenName: 'csrf_token', token: token || 'tok-1' } });
                }
                next();
            }
        }
    };
}

function setup({ inertia, viewData, token } = {}) {
    const csrf = csrfMock(token);
    const shareData = loadModule('scripts/middleware/shareData.js', {
        mocks: {
            'dw/catalog/CatalogMgr': CATALOG,
            '*/cartridge/models/categories': function Categories(cats) { this.categories = cats; },
            '*/cartridge/scripts/middleware/csrf': csrf.middleware
        }
    });

    const res = createResponse({ viewData: viewData || {} });
    if (inertia !== null) {
        res.inertia = inertia || { shared: {}, always: (v) => ({ __always: v }), share(o) { Object.assign(this.shared, o); } };
    }

    let nextCalled = false;
    shareData(createSfraReq(), res, () => { nextCalled = true; });
    return { res, csrf, nextCalled };
}

describe('shareData middleware', () => {
    it('shares auth, locale and navBar', () => {
        const { res } = setup();
        expect(res.inertia.shared.auth).toEqual({ user: null });
        expect(res.inertia.shared.locale).toBe('en_US');
        expect(res.inertia.shared.navBar).toBeDefined();
    });

    it('generates a CSRF token into viewData for the root ISML meta tag', () => {
        const { res } = setup();
        expect(res.getViewData().csrf).toEqual({ tokenName: 'csrf_token', token: 'tok-1' });
    });

    it('shares csrf as an always() prop so partial reloads keep it', () => {
        const { res } = setup();
        const shared = res.inertia.shared.csrf;
        expect(shared.__always).toBeDefined();
        expect(shared.__always()).toEqual({ tokenName: 'csrf_token', token: 'tok-1' });
    });

    it('does not overwrite a token an earlier route already generated', () => {
        const existing = { tokenName: 'csrf_token', token: 'from-route' };
        const { res } = setup({ viewData: { csrf: existing }, token: 'tok-2' });
        expect(res.getViewData().csrf).toEqual(existing);
    });

    it('is a no-op when Inertia is not initialized', () => {
        const { res, csrf, nextCalled } = setup({ inertia: null });
        expect(res.inertia).toBeUndefined();
        expect(csrf.calls()).toBe(0);
        expect(nextCalled).toBe(true);
    });
});
