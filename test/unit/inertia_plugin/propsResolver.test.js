import { describe, it, expect } from 'bun:test';

const loadModule = require('./helpers/loadModule');

const Prop = loadModule('scripts/inertia/Prop.js');
const PropsResolver = loadModule('scripts/inertia/PropsResolver.js');

const COMPONENT = 'TestComponent';

/** Build a request context from a plain header map (case-insensitive). */
function ctx(headers = {}) {
    const map = {};
    Object.keys(headers).forEach((k) => { map[k.toLowerCase()] = headers[k]; });
    return {
        header: (name) => {
            const value = map[name];
            return value === undefined || value === '' ? null : String(value);
        }
    };
}

/** Laravel's makePartialRequest: X-Inertia + partial-component + partial-data. */
function partialCtx(only, extraHeaders = {}) {
    const headers = {
        'x-inertia': 'true',
        'x-inertia-partial-component': COMPONENT,
        ...extraHeaders
    };
    if (only) headers['x-inertia-partial-data'] = only;
    return ctx(headers);
}

/** Resolve and flatten {props, metadata} into a Laravel-page-like object. */
function makePage(requestCtx, props, shared = {}, options = {}) {
    const resolver = new PropsResolver(requestCtx, COMPONENT, options);
    const result = resolver.resolve(shared, props);
    return { props: result.props, ...result.metadata };
}

const optional = (cb) => new Prop.OptionalProp(cb);
const defer = (cb, group, rescue) => new Prop.DeferProp(cb, group, rescue);
const always = (v) => new Prop.AlwaysProp(v);
const merge = (v) => new Prop.MergeProp(v);
const once = (cb) => new Prop.OnceProp(cb);

const scrollMetadata = { pageName: 'page', previousPage: null, nextPage: 2, currentPage: 1 };

describe('PropsResolver — closures and nesting', () => {
    it('nested closure is resolved', () => {
        const page = makePage(ctx(), { auth: () => ({ user: 'Jonathan' }) });
        expect(page.props.auth.user).toBe('Jonathan');
    });

    it('nested closure inside an object is resolved', () => {
        const page = makePage(ctx(), { auth: { user: () => 'Jonathan' } });
        expect(page.props.auth.user).toBe('Jonathan');
    });

    it('nested always prop is resolved', () => {
        const page = makePage(ctx(), { auth: { user: always(() => 'Jonathan') } });
        expect(page.props.auth.user).toBe('Jonathan');
    });

    it('nested merge prop is resolved', () => {
        const page = makePage(ctx(), { feed: { posts: merge([{ id: 1 }]) } });
        expect(page.props.feed.posts).toEqual([{ id: 1 }]);
    });

    it('nested once prop is resolved on initial load', () => {
        const page = makePage(ctx(), { config: { locale: once(() => 'en') } });
        expect(page.props.config.locale).toBe('en');
    });

    it('arrays of strings are never invoked as callables', () => {
        const page = makePage(ctx(), { job: { name: 'Import', fields: ['Context', 'comment'] } });
        expect(page.props.job.fields).toEqual(['Context', 'comment']);
    });
});

describe('PropsResolver — initial-load exclusions', () => {
    it('nested optional prop is excluded and its closure never runs', () => {
        let resolved = false;
        const page = makePage(ctx(), {
            auth: {
                user: 'Jonathan',
                permissions: optional(() => { resolved = true; return ['admin']; })
            }
        });
        expect(page.props.auth.user).toBe('Jonathan');
        expect('permissions' in page.props.auth).toBe(false);
        expect(resolved).toBe(false);
    });

    it('nested defer prop is excluded and its closure never runs', () => {
        let resolved = false;
        const page = makePage(ctx(), {
            auth: {
                user: 'Jonathan',
                notifications: defer(() => { resolved = true; return []; })
            }
        });
        expect('notifications' in page.props.auth).toBe(false);
        expect(resolved).toBe(false);
    });

    it('top-level optional and defer props are excluded without resolution', () => {
        let optionalResolved = false;
        let deferResolved = false;
        const page = makePage(ctx(), {
            name: 'Jonathan',
            permissions: optional(() => { optionalResolved = true; return ['admin']; }),
            notifications: defer(() => { deferResolved = true; return ['new']; })
        });
        expect(page.props.name).toBe('Jonathan');
        expect('permissions' in page.props).toBe(false);
        expect('notifications' in page.props).toBe(false);
        expect(optionalResolved).toBe(false);
        expect(deferResolved).toBe(false);
    });

    it('optional props inside closure-returned objects are excluded', () => {
        let resolved = false;
        const page = makePage(ctx(), {
            auth: () => ({
                user: 'Jonathan',
                permissions: optional(() => { resolved = true; return ['admin']; })
            })
        });
        expect(page.props.auth.user).toBe('Jonathan');
        expect('permissions' in page.props.auth).toBe(false);
        expect(resolved).toBe(false);
    });

    it('non-partial Inertia request behaves like initial load', () => {
        const page = makePage(ctx({ 'x-inertia': 'true' }), {
            dashboard: {
                stats: 'visible',
                feed: merge([{ id: 1 }]),
                notifications: defer(() => []),
                settings: optional(() => [])
            }
        });
        expect(page.props.dashboard.stats).toBe('visible');
        expect(page.props.dashboard.feed).toEqual([{ id: 1 }]);
        expect('notifications' in page.props.dashboard).toBe(false);
        expect('settings' in page.props.dashboard).toBe(false);
        expect(page.mergeProps).toEqual(['dashboard.feed']);
        expect(page.deferredProps).toEqual({ default: ['dashboard.notifications'] });
    });
});

describe('PropsResolver — double unwrap (closure returning a prop type)', () => {
    it('closure returning an optional prop is excluded from initial load', () => {
        let resolved = false;
        const page = makePage(ctx(), {
            secret: () => optional(() => { resolved = true; return 'x'; })
        });
        expect('secret' in page.props).toBe(false);
        expect(resolved).toBe(false);
    });

    it('closure returning a defer prop is excluded from initial load', () => {
        const page = makePage(ctx(), {
            posts: () => defer(() => [{ id: 1 }])
        });
        expect('posts' in page.props).toBe(false);
        expect(page.deferredProps).toEqual({ default: ['posts'] });
    });

    it('closure returning a merge prop resolves with metadata', () => {
        const page = makePage(ctx(), { posts: () => merge([{ id: 1 }]) });
        expect(page.props.posts).toEqual([{ id: 1 }]);
        expect(page.mergeProps).toEqual(['posts']);
    });

    it('closure returning a once prop resolves with metadata', () => {
        const page = makePage(ctx(), { locale: () => once(() => 'en') });
        expect(page.props.locale).toBe('en');
        expect(page.onceProps).toEqual({ locale: { prop: 'locale', expiresAt: null } });
    });

    it('closure returning defer()->merge() collects deferred and merge metadata', () => {
        const page = makePage(ctx(), { posts: () => defer(() => [{ id: 1 }]).merge() });
        expect('posts' in page.props).toBe(false);
        expect(page.deferredProps).toEqual({ default: ['posts'] });
        expect(page.mergeProps).toEqual(['posts']);
    });
});

describe('PropsResolver — partial requests', () => {
    it('nested optional prop is included on partial request', () => {
        const page = makePage(partialCtx('auth.permissions'), {
            auth: { user: 'Jonathan', permissions: optional(() => ['admin']) }
        });
        expect(page.props.auth.permissions).toEqual(['admin']);
        expect('user' in page.props.auth).toBe(false);
    });

    it('nested defer prop is included on partial request', () => {
        const page = makePage(partialCtx('auth.notifications'), {
            auth: { user: 'Jonathan', notifications: defer(() => ['new message']) }
        });
        expect(page.props.auth.notifications).toEqual(['new message']);
    });

    it('nested always prop is included even when not requested', () => {
        const page = makePage(partialCtx('auth.user'), {
            auth: { user: 'Jonathan', errors: always(() => ({ name: 'required' })) }
        });
        expect(page.props.auth.user).toBe('Jonathan');
        expect(page.props.auth.errors).toEqual({ name: 'required' });
    });

    it('top-level always prop is included when not requested', () => {
        const page = makePage(partialCtx('other'), {
            other: 'value',
            errors: always(() => ({ name: 'required' }))
        });
        expect(page.props.other).toBe('value');
        expect(page.props.errors).toEqual({ name: 'required' });
    });

    it('except header excludes nested prop', () => {
        const page = makePage(
            partialCtx('auth', { 'x-inertia-partial-except': 'auth.token' }),
            { auth: { user: 'Jonathan', token: 'secret' } }
        );
        expect(page.props.auth.user).toBe('Jonathan');
        expect('token' in page.props.auth).toBe(false);
    });

    it('partial request for a parent resolves ALL nested prop types', () => {
        const page = makePage(partialCtx('dashboard'), {
            dashboard: {
                stats: 'visible',
                feed: merge([{ id: 1 }]),
                notifications: defer(() => ['msg']),
                settings: optional(() => ({ theme: 'dark' })),
                locale: once(() => 'en')
            }
        });
        expect(page.props.dashboard.stats).toBe('visible');
        expect(page.props.dashboard.feed).toEqual([{ id: 1 }]);
        expect(page.props.dashboard.notifications).toEqual(['msg']);
        expect(page.props.dashboard.settings).toEqual({ theme: 'dark' });
        expect(page.props.dashboard.locale).toBe('en');
        expect(page.mergeProps).toEqual(['dashboard.feed']);
        expect(page.onceProps).toEqual({
            'dashboard.locale': { prop: 'dashboard.locale', expiresAt: null }
        });
        expect('deferredProps' in page).toBe(false);
    });

    it('partial with NO only/except resolves optional and defer props (settled Laravel behavior)', () => {
        const page = makePage(partialCtx(null), {
            settings: optional(() => 'resolved'),
            posts: defer(() => ['a'])
        });
        expect(page.props.settings).toBe('resolved');
        expect(page.props.posts).toEqual(['a']);
        expect('deferredProps' in page).toBe(false);
    });

    it('deferred props at mixed depths resolve on partial request; unrequested siblings drop', () => {
        const page = makePage(partialCtx('foo,nested.c'), {
            foo: defer(() => 'bar'),
            nested: { a: 'b', c: defer(() => 'd') }
        });
        expect(page.props.foo).toBe('bar');
        expect(page.props.nested.c).toBe('d');
        expect('a' in page.props.nested).toBe(false); // nested leads to only, but nested.a matches nothing
        expect('deferredProps' in page).toBe(false);
    });

    it('deeply nested optional prop is included via leadsToOnly traversal', () => {
        const page = makePage(partialCtx('app.auth.permissions'), {
            app: { auth: { permissions: optional(() => ['admin']) } }
        });
        expect(page.props.app.auth.permissions).toEqual(['admin']);
    });

    it('deferred props inside closures are excluded on initial load with metadata', () => {
        let notificationsResolved = false;
        const page = makePage(ctx(), {
            auth: () => ({
                user: { name: 'Jonathan Reinink', email: 'jonathan@example.com' },
                notifications: defer(() => { notificationsResolved = true; return ['new']; }),
                roles: defer(() => ['admin'])
            })
        });
        expect(page.props.auth.user.name).toBe('Jonathan Reinink');
        expect('notifications' in page.props.auth).toBe(false);
        expect('roles' in page.props.auth).toBe(false);
        expect(page.deferredProps).toEqual({ default: ['auth.notifications', 'auth.roles'] });
        expect(notificationsResolved).toBe(false);
    });

    it('deferred props inside closures resolve on partial request', () => {
        const page = makePage(partialCtx('auth.notifications,auth.roles'), {
            auth: () => ({
                user: { name: 'Jonathan Reinink' },
                notifications: defer(() => ['You have a new follower']),
                roles: defer(() => ['admin'])
            })
        });
        expect(page.props.auth.notifications).toEqual(['You have a new follower']);
        expect(page.props.auth.roles).toEqual(['admin']);
    });
});

describe('PropsResolver — merge metadata', () => {
    it('nested defer prop metadata is collected with default group', () => {
        const page = makePage(ctx(), {
            auth: { user: 'Jonathan', notifications: defer(() => []) }
        });
        expect(page.deferredProps).toEqual({ default: ['auth.notifications'] });
    });

    it('defer groups are preserved', () => {
        const page = makePage(ctx(), {
            auth: {
                notifications: defer(() => [], 'sidebar'),
                messages: defer(() => [], 'sidebar')
            }
        });
        expect(page.deferredProps).toEqual({ sidebar: ['auth.notifications', 'auth.messages'] });
    });

    it('closure-returned defer prop preserves group', () => {
        const page = makePage(ctx(), {
            auth: () => ({ user: 'J', notifications: defer(() => [], 'alerts') })
        });
        expect(page.deferredProps).toEqual({ alerts: ['auth.notifications'] });
    });

    it('nested merge / prepend / deepMerge metadata', () => {
        const page = makePage(ctx(), {
            feed: { posts: merge([{ id: 1 }]) },
            queue: { items: merge([{ id: 2 }]).prepend() },
            settings: { preferences: merge({ theme: 'dark' }).deepMerge() }
        });
        expect(page.mergeProps).toEqual(['feed.posts']);
        expect(page.prependProps).toEqual(['queue.items']);
        expect(page.deepMergeProps).toEqual(['settings.preferences']);
    });

    it('per-path append produces "path.sub" entries', () => {
        const page = makePage(ctx(), {
            feed: { posts: merge({ data: [{ id: 1 }] }).append('data') }
        });
        expect(page.mergeProps).toEqual(['feed.posts.data']);
    });

    it('matchOn produces matchPropsOn entries', () => {
        const page = makePage(ctx(), {
            feed: { posts: merge([{ id: 1 }]).matchOn('id').deepMerge() }
        });
        expect(page.deepMergeProps).toEqual(['feed.posts']);
        expect(page.matchPropsOn).toEqual(['feed.posts.id']);
    });

    it('defer + merge collects both metadata sets', () => {
        const page = makePage(ctx(), {
            feed: { posts: defer(() => [{ id: 1 }]).merge() }
        });
        expect(page.deferredProps).toEqual({ default: ['feed.posts'] });
        expect(page.mergeProps).toEqual(['feed.posts']);
    });

    it('deepMerge takes precedence over per-path append', () => {
        const page = makePage(ctx(), {
            feed: { posts: merge({ data: [] }).append('data').deepMerge() }
        });
        expect(page.deepMergeProps).toEqual(['feed.posts']);
        expect('mergeProps' in page).toBe(false);
    });

    it('merge metadata is collected on exact partial request', () => {
        const page = makePage(partialCtx('feed.posts'), {
            feed: { posts: merge([{ id: 1 }]) }
        });
        expect(page.props.feed.posts).toEqual([{ id: 1 }]);
        expect(page.mergeProps).toEqual(['feed.posts']);
    });

    it('merge metadata is collected when the parent is requested', () => {
        const page = makePage(partialCtx('feed'), {
            feed: { posts: merge([{ id: 1 }]) }
        });
        expect(page.mergeProps).toEqual(['feed.posts']);
    });

    it('reset header suppresses merge metadata but keeps the value', () => {
        const page = makePage(
            partialCtx('feed.posts', { 'x-inertia-reset': 'feed.posts' }),
            { feed: { posts: merge([{ id: 1 }]) } }
        );
        expect(page.props.feed.posts).toEqual([{ id: 1 }]);
        expect('mergeProps' in page).toBe(false);
    });

    it('except header suppresses nested merge metadata', () => {
        const page = makePage(
            partialCtx('feed.posts,feed.comments', { 'x-inertia-partial-except': 'feed.posts' }),
            {
                feed: {
                    posts: merge([{ id: 1 }]),
                    comments: merge([{ id: 2 }])
                }
            }
        );
        expect('posts' in page.props.feed).toBe(false);
        expect(page.props.feed.comments).toEqual([{ id: 2 }]);
        expect(page.mergeProps).toEqual(['feed.comments']);
    });

    it('except header for a parent suppresses all nested metadata', () => {
        const page = makePage(
            partialCtx('feed,other', { 'x-inertia-partial-except': 'feed' }),
            { feed: { posts: merge([{ id: 1 }]) }, other: 'value' }
        );
        expect('feed' in page.props).toBe(false);
        expect(page.props.other).toBe('value');
        expect('mergeProps' in page).toBe(false);
    });

    it('deeply nested paths use the full dotted path', () => {
        const deferred = makePage(ctx(), {
            app: { auth: { notifications: defer(() => [], 'alerts') } }
        });
        expect(deferred.deferredProps).toEqual({ alerts: ['app.auth.notifications'] });

        const merged = makePage(ctx(), {
            app: { feed: { posts: merge([{ id: 1 }]) } }
        });
        expect(merged.mergeProps).toEqual(['app.feed.posts']);
    });

    it('mixed depths: multiple prop types handled together', () => {
        const page = makePage(ctx(), {
            dashboard: {
                stats: 'visible',
                feed: merge([{ id: 1 }]),
                notifications: defer(() => []),
                settings: optional(() => []),
                locale: once(() => 'en')
            }
        });
        expect(page.props.dashboard.stats).toBe('visible');
        expect(page.props.dashboard.locale).toBe('en');
        expect('notifications' in page.props.dashboard).toBe(false);
        expect('settings' in page.props.dashboard).toBe(false);
        expect(page.mergeProps).toEqual(['dashboard.feed']);
        expect(page.deferredProps).toEqual({ default: ['dashboard.notifications'] });
        expect(page.onceProps).toEqual({
            'dashboard.locale': { prop: 'dashboard.locale', expiresAt: null }
        });
    });

    it('deferred props at mixed depths collect correct metadata', () => {
        const page = makePage(ctx(), {
            foo: defer(() => 'bar'),
            nested: { a: 'b', c: defer(() => 'd') }
        });
        expect(page.props.nested.a).toBe('b');
        expect('foo' in page.props).toBe(false);
        expect(page.deferredProps).toEqual({ default: ['foo', 'nested.c'] });
    });
});

describe('PropsResolver — once props', () => {
    it('collects once metadata with the path as default key', () => {
        const page = makePage(ctx(), { config: { locale: once(() => 'en') } });
        expect(page.onceProps).toEqual({
            'config.locale': { prop: 'config.locale', expiresAt: null }
        });
    });

    it('collects once metadata under a custom as() key', () => {
        const page = makePage(ctx(), {
            config: { locale: once(() => 'en').as('app-locale') }
        });
        expect(page.onceProps).toEqual({
            'app-locale': { prop: 'config.locale', expiresAt: null }
        });
    });

    it('excludes an already-loaded once prop but keeps metadata and siblings', () => {
        let resolved = false;
        const page = makePage(
            ctx({ 'x-inertia': 'true', 'x-inertia-except-once-props': 'config.locale' }),
            {
                config: {
                    locale: once(() => { resolved = true; return 'en'; }),
                    timezone: 'UTC'
                }
            }
        );
        expect(page.props.config.timezone).toBe('UTC');
        expect('locale' in page.props.config).toBe(false);
        expect(resolved).toBe(false);
        expect(page.onceProps).toEqual({
            'config.locale': { prop: 'config.locale', expiresAt: null }
        });
    });

    it('fresh() bypasses the already-loaded exclusion', () => {
        const page = makePage(
            ctx({ 'x-inertia': 'true', 'x-inertia-except-once-props': 'config.locale' }),
            { config: { locale: once(() => 'en').fresh() } }
        );
        expect(page.props.config.locale).toBe('en');
    });

    it('custom key is honored by the except-once header', () => {
        const page = makePage(
            ctx({ 'x-inertia': 'true', 'x-inertia-except-once-props': 'app-locale' }),
            { config: { locale: once(() => 'en').as('app-locale') } }
        );
        expect('locale' in page.props.config).toBe(false);
        expect(page.onceProps).toEqual({
            'app-locale': { prop: 'config.locale', expiresAt: null }
        });
    });

    it('non-Inertia requests resolve once props even when marked loaded', () => {
        const page = makePage(
            ctx({ 'x-inertia-except-once-props': 'config.locale' }),
            { config: { locale: once(() => 'en') } }
        );
        expect(page.props.config.locale).toBe('en');
    });

    it('once metadata is collected on exact and parent partial requests', () => {
        const exact = makePage(partialCtx('config.locale'), {
            config: { locale: once(() => 'en') }
        });
        expect(exact.props.config.locale).toBe('en');
        expect(exact.onceProps).toEqual({
            'config.locale': { prop: 'config.locale', expiresAt: null }
        });

        const parent = makePage(partialCtx('config'), {
            config: { locale: once(() => 'en') }
        });
        expect(parent.onceProps).toEqual({
            'config.locale': { prop: 'config.locale', expiresAt: null }
        });
    });

    it('defer+once suppresses deferred metadata when already loaded', () => {
        const page = makePage(
            ctx({ 'x-inertia-except-once-props': 'feed.posts' }),
            { feed: { posts: defer(() => []).once() } }
        );
        expect('deferredProps' in page).toBe(false);
    });

    it('defer+once includes both metadata sets on first load', () => {
        const page = makePage(ctx(), {
            feed: { posts: defer(() => []).once() }
        });
        expect(page.deferredProps).toEqual({ default: ['feed.posts'] });
        expect(page.onceProps).toEqual({
            'feed.posts': { prop: 'feed.posts', expiresAt: null }
        });
    });

    it('until() surfaces as an epoch-ms expiresAt', () => {
        const page = makePage(ctx(), {
            config: { locale: once(() => 'en').until(60) }
        });
        const meta = page.onceProps['config.locale'];
        expect(typeof meta.expiresAt).toBe('number');
        expect(meta.expiresAt).toBeGreaterThan(Date.now());
    });
});

describe('PropsResolver — rescue', () => {
    it('rescued defer prop is omitted with rescuedProps metadata on partial request', () => {
        const errors = [];
        const page = makePage(
            partialCtx('auth.notifications'),
            {
                auth: {
                    notifications: defer(() => { throw new Error('Rescue this deferred prop'); }, 'default', true)
                }
            },
            {},
            { onRescuedError: (e, path) => errors.push({ e, path }) }
        );
        expect('notifications' in page.props.auth).toBe(false);
        expect(page.rescuedProps).toEqual(['auth.notifications']);
        expect(errors.length).toBe(1);
        expect(errors[0].path).toBe('auth.notifications');
    });

    it('non-rescuable throw propagates', () => {
        expect(() => makePage(partialCtx('boom'), {
            boom: defer(() => { throw new Error('no rescue'); })
        })).toThrow('no rescue');
    });
});

describe('PropsResolver — scroll props', () => {
    it('collects scroll metadata with reset=false', () => {
        const page = makePage(ctx(), {
            feed: {
                posts: new Prop.ScrollProp({ data: [{ id: 1 }] }, 'data', scrollMetadata)
            }
        });
        expect(page.scrollProps).toEqual({
            'feed.posts': {
                pageName: 'page', previousPage: null, nextPage: 2, currentPage: 1, reset: false
            }
        });
    });

    it('deferred scroll prop is excluded with deferredProps metadata', () => {
        const page = makePage(ctx(), {
            feed: {
                posts: new Prop.ScrollProp({ data: [{ id: 1 }] }, 'data', scrollMetadata).defer()
            }
        });
        expect(!page.props.feed || !('posts' in page.props.feed)).toBe(true);
        expect(page.deferredProps).toEqual({ default: ['feed.posts'] });
    });

    it('scroll prop on partial request keeps the full wrapped value + per-path merge', () => {
        const page = makePage(partialCtx('feed.posts'), {
            feed: {
                posts: new Prop.ScrollProp({ data: [{ id: 1 }] }, 'data', scrollMetadata)
            }
        });
        expect(page.props.feed.posts).toEqual({ data: [{ id: 1 }] });
        expect(page.scrollProps['feed.posts'].reset).toBe(false);
        expect(page.mergeProps).toEqual(['feed.posts.data']);
    });

    it('prepend merge intent routes the wrapper path into prependProps', () => {
        const page = makePage(
            partialCtx('feed.posts', { 'x-inertia-infinite-scroll-merge-intent': 'prepend' }),
            {
                feed: {
                    posts: new Prop.ScrollProp({ data: [{ id: 1 }] }, 'data', scrollMetadata)
                }
            }
        );
        expect(page.prependProps).toEqual(['feed.posts.data']);
        expect('mergeProps' in page).toBe(false);
    });

    it('reset header sets the scroll reset flag', () => {
        const page = makePage(ctx({ 'x-inertia-reset': 'feed.posts' }), {
            feed: {
                posts: new Prop.ScrollProp({ data: [{ id: 1 }] }, 'data', scrollMetadata)
            }
        });
        expect(page.scrollProps['feed.posts'].reset).toBe(true);
    });

    it('default metadata provider reads the createPaginator shape (regression: current_start)', () => {
        const page = makePage(ctx(), {
            products: new Prop.ScrollProp({
                data: [1, 2],
                meta: { pageName: 'start', previousPage: null, nextPage: 12, currentPage: 0 }
            })
        });
        expect(page.scrollProps.products.currentPage).toBe(0);
        expect(page.scrollProps.products.pageName).toBe('start');
    });
});

describe('PropsResolver — dot-notation props', () => {
    it('merges into an existing nested structure', () => {
        const page = makePage(ctx(), {
            auth: { user: { name: 'Jonathan Reinink', email: 'jonathan@example.com' } },
            'auth.user.permissions': () => ['edit-posts', 'delete-posts']
        });
        expect(page.props.auth.user.name).toBe('Jonathan Reinink');
        expect(page.props.auth.user.email).toBe('jonathan@example.com');
        expect(page.props.auth.user.permissions).toEqual(['edit-posts', 'delete-posts']);
        expect('auth.user.permissions' in page.props).toBe(false);
    });

    it('merges when the parent is a closure', () => {
        const page = makePage(ctx(), {
            auth: () => ({ user: { name: 'Jonathan Reinink', email: 'jonathan@example.com' } }),
            'auth.user.permissions': () => ['edit-posts', 'delete-posts']
        });
        expect(page.props.auth.user.name).toBe('Jonathan Reinink');
        expect(page.props.auth.user.permissions).toEqual(['edit-posts', 'delete-posts']);
    });

    it('dotted optional prop is excluded from initial load', () => {
        const page = makePage(ctx(), {
            auth: { user: { name: 'Jonathan Reinink' } },
            'auth.user.permissions': optional(() => ['edit-posts'])
        });
        expect(page.props.auth.user.name).toBe('Jonathan Reinink');
        expect('permissions' in page.props.auth.user).toBe(false);
        expect('auth.user.permissions' in page.props).toBe(false);
    });

    it('dotted optional prop is included on partial request', () => {
        const page = makePage(partialCtx('auth.user.permissions'), {
            auth: { user: { name: 'Jonathan Reinink' } },
            'auth.user.permissions': optional(() => ['edit-posts', 'delete-posts'])
        });
        expect(page.props.auth.user.permissions).toEqual(['edit-posts', 'delete-posts']);
    });
});

describe('PropsResolver — indexed arrays', () => {
    it('optional props inside indexed arrays resolve on partial request for the parent', () => {
        const page = makePage(partialCtx('foos'), {
            foos: [
                { name: 'First', bar: optional(() => 'expensive-data-1') },
                { name: 'Second', bar: optional(() => 'expensive-data-2') }
            ]
        });
        expect(page.props.foos[0].name).toBe('First');
        expect(page.props.foos[0].bar).toBe('expensive-data-1');
        expect(page.props.foos[1].bar).toBe('expensive-data-2');
        expect(Array.isArray(page.props.foos)).toBe(true);
    });

    it('optional props inside indexed arrays are excluded on initial load', () => {
        let resolved = false;
        const page = makePage(ctx(), {
            foos: [{ name: 'First', bar: optional(() => { resolved = true; return 'x'; }) }]
        });
        expect(page.props.foos[0].name).toBe('First');
        expect('bar' in page.props.foos[0]).toBe(false);
        expect(resolved).toBe(false);
        expect(Array.isArray(page.props.foos)).toBe(true);
    });
});

describe('PropsResolver — shared props', () => {
    it('collects top-level shared keys, first segment, deduped', () => {
        const page = makePage(ctx(), { name: 'J' }, {
            auth: { user: 'A' },
            'auth.flags': true,
            locale: 'en'
        });
        expect(page.sharedProps).toEqual(['auth', 'locale']);
        expect(page.props.locale).toBe('en');
        expect(page.props.name).toBe('J');
    });

    it('page props override shared props on key collision', () => {
        const page = makePage(ctx(), { locale: 'de' }, { locale: 'en' });
        expect(page.props.locale).toBe('de');
    });

    it('sharedProps key is omitted when disabled or empty', () => {
        const disabled = makePage(ctx(), {}, { locale: 'en' }, { exposeSharedPropKeys: false });
        expect('sharedProps' in disabled).toBe(false);

        const empty = makePage(ctx(), { a: 1 }, {});
        expect('sharedProps' in empty).toBe(false);
    });
});

describe('PropsResolver — reporter seam (DevTools)', () => {
    it('reports resolved paths when a reporter is present', () => {
        const resolved = [];
        makePage(ctx(), { auth: () => ({ user: 'Jane' }), team: 'Acme' }, {}, {
            reporter: {
                propResolved: (path) => resolved.push(path),
                propRescued: () => {}
            }
        });
        expect(resolved).toContain('auth');
        expect(resolved).toContain('auth.user');
        expect(resolved).toContain('team');
    });

    it('reports rescued paths', () => {
        const rescued = [];
        makePage(partialCtx('x'), {
            x: defer(() => { throw new Error('boom'); }, 'default', true)
        }, {}, {
            reporter: { propResolved: () => {}, propRescued: (path) => rescued.push(path) }
        });
        expect(rescued).toEqual(['x']);
    });

    it('never touches the reporter when absent', () => {
        // Would throw if reporter were dereferenced unconditionally.
        const page = makePage(ctx(), { a: 1 });
        expect(page.props.a).toBe(1);
    });
});

describe('PropsResolver — metadata key omission', () => {
    it('emits no empty metadata keys', () => {
        const page = makePage(ctx(), { plain: 'value' });
        expect(Object.keys(page)).toEqual(['props']);
    });
});
