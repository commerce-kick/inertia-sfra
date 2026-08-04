import { describe, it, expect } from 'bun:test';

const loadModule = require('./helpers/loadModule');

const Prop = loadModule('scripts/inertia/Prop.js');

describe('MergeProp / mergesProps mixin', () => {
    it('merges by default', () => {
        const p = new Prop.MergeProp([1, 2]);
        expect(p.shouldMerge()).toBe(true);
        expect(p.shouldDeepMerge()).toBe(false);
        expect(p.appendsAtRoot()).toBe(true);
        expect(p.prependsAtRoot()).toBe(false);
    });

    it('deepMerge() implies merge', () => {
        const p = new Prop.DeferProp(() => 1);
        expect(p.shouldMerge()).toBe(false);
        p.deepMerge();
        expect(p.shouldMerge()).toBe(true);
        expect(p.shouldDeepMerge()).toBe(true);
    });

    it('deep() is a deprecated alias of deepMerge()', () => {
        const p = new Prop.MergeProp({}).deep();
        expect(p.shouldDeepMerge()).toBe(true);
    });

    it('matchOn wraps a string into an array', () => {
        expect(new Prop.MergeProp([]).matchOn('id').matchesOn()).toEqual(['id']);
        expect(new Prop.MergeProp([]).matchOn(['a', 'b']).matchesOn()).toEqual(['a', 'b']);
    });

    it('append(path) records a nested path and disables root merging', () => {
        const p = new Prop.MergeProp({}).append('data');
        expect(p.appendsAtPaths()).toEqual(['data']);
        expect(p.appendsAtRoot()).toBe(false);
        expect(p.prependsAtRoot()).toBe(false);
    });

    it('append(path, matchOn) also records "path.matchOn"', () => {
        const p = new Prop.MergeProp({}).append('data', 'id');
        expect(p.appendsAtPaths()).toEqual(['data']);
        expect(p.matchesOn()).toEqual(['data.id']);
    });

    it('append(array) and append(object) fan out', () => {
        const arr = new Prop.MergeProp({}).append(['a', 'b']);
        expect(arr.appendsAtPaths()).toEqual(['a', 'b']);

        const obj = new Prop.MergeProp({}).append({ data: 'id', items: 'uuid' });
        expect(obj.appendsAtPaths()).toEqual(['data', 'items']);
        expect(obj.matchesOn()).toEqual(['data.id', 'items.uuid']);
    });

    it('prepend() at root flips the append flag', () => {
        const p = new Prop.MergeProp([]).prepend();
        expect(p.prependsAtRoot()).toBe(true);
        expect(p.appendsAtRoot()).toBe(false);
    });

    it('prepend(path, matchOn) records path and match key', () => {
        const p = new Prop.MergeProp({}).prepend('data', 'id');
        expect(p.prependsAtPaths()).toEqual(['data']);
        expect(p.matchesOn()).toEqual(['data.id']);
    });

    it('append(false) behaves like prepend at root', () => {
        const p = new Prop.MergeProp([]).append(false);
        expect(p.prependsAtRoot()).toBe(true);
    });
});

describe('DeferProp / defersProps mixin', () => {
    it('defaults to the "default" group', () => {
        const p = new Prop.DeferProp(() => 1);
        expect(p.shouldDefer()).toBe(true);
        expect(p.group()).toBe('default');
    });

    it('honors a custom group', () => {
        expect(new Prop.DeferProp(() => 1, 'sidebar').group()).toBe('sidebar');
    });

    it('exposes rescue', () => {
        expect(new Prop.DeferProp(() => 1).shouldRescue()).toBe(false);
        expect(new Prop.DeferProp(() => 1, 'default', true).shouldRescue()).toBe(true);
    });

    it('supports the once chain', () => {
        const p = new Prop.DeferProp(() => 1).once();
        expect(p.shouldResolveOnce()).toBe(true);
    });

    it('resolves its callback', () => {
        expect(new Prop.DeferProp(() => 42).resolve()).toBe(42);
    });
});

describe('OnceProp / resolvesOnce mixin', () => {
    it('is once by default', () => {
        const p = new Prop.OnceProp(() => 1);
        expect(p.shouldResolveOnce()).toBe(true);
        expect(p.shouldBeRefreshed()).toBe(false);
        expect(p.getKey()).toBe(null);
        expect(p.expiresAt()).toBe(null);
    });

    it('as() sets a custom key', () => {
        expect(new Prop.OnceProp(() => 1).as('me').getKey()).toBe('me');
    });

    it('fresh() marks for refresh', () => {
        expect(new Prop.OnceProp(() => 1).fresh().shouldBeRefreshed()).toBe(true);
    });

    it('until(seconds) yields an epoch-ms expiry', () => {
        const p = new Prop.OnceProp(() => 1).until(60);
        const expected = (Math.floor(Date.now() / 1000) + 60) * 1000;
        expect(Math.abs(p.expiresAt() - expected)).toBeLessThanOrEqual(1000);
        expect(p.expiresAt() % 1000).toBe(0);
    });

    it('until(Date) yields an epoch-ms expiry near the date', () => {
        const date = new Date(Date.now() + 120000);
        const p = new Prop.OnceProp(() => 1).until(date);
        expect(Math.abs(p.expiresAt() - date.getTime())).toBeLessThanOrEqual(2000);
    });

    it('once(true, as, until) applies all three', () => {
        const p = new Prop.MergeProp([]).once(true, 'k', 30);
        expect(p.shouldResolveOnce()).toBe(true);
        expect(p.getKey()).toBe('k');
        expect(p.expiresAt()).not.toBe(null);
    });

    it('MergeProp is not once by default', () => {
        expect(new Prop.MergeProp([]).shouldResolveOnce()).toBe(false);
    });
});

describe('OptionalProp / LazyProp', () => {
    it('is ignore-first-load and resolves its callback', () => {
        const p = new Prop.OptionalProp(() => 'v');
        expect(Prop.isIgnoreFirstLoad(p)).toBe(true);
        expect(p.resolve()).toBe('v');
    });

    it('LazyProp is an alias of OptionalProp', () => {
        expect(Prop.LazyProp).toBe(Prop.OptionalProp);
    });
});

describe('AlwaysProp', () => {
    it('resolves plain values and callbacks', () => {
        expect(new Prop.AlwaysProp('x').resolve()).toBe('x');
        expect(new Prop.AlwaysProp(() => 'y').resolve()).toBe('y');
    });

    it('is not mergeable or onceable', () => {
        const p = new Prop.AlwaysProp('x');
        expect(Prop.isAlways(p)).toBe(true);
        expect(Prop.isMergeable(p)).toBe(false);
        expect(Prop.isOnceable(p)).toBe(false);
    });
});

describe('ScrollProp', () => {
    const paginator = {
        data: [1, 2, 3],
        meta: { pageName: 'start', previousPage: null, nextPage: 12, currentPage: 0 }
    };

    it('defaults wrapper to "data" and merges', () => {
        const p = new Prop.ScrollProp(paginator);
        expect(p.wrapper).toBe('data');
        expect(p.shouldMerge()).toBe(true);
        expect(p.shouldDeepMerge()).toBe(false);
    });

    it('configureMergeIntent(null) appends at the wrapper path', () => {
        const p = new Prop.ScrollProp(paginator).configureMergeIntent(null);
        expect(p.appendsAtPaths()).toEqual(['data']);
        expect(p.appendsAtRoot()).toBe(false);
    });

    it('configureMergeIntent("prepend") prepends at the wrapper path', () => {
        const p = new Prop.ScrollProp(paginator, 'items').configureMergeIntent('prepend');
        expect(p.prependsAtPaths()).toEqual(['items']);
    });

    it('default metadata provider reads resolved.meta with currentPage (regression: current_start)', () => {
        const p = new Prop.ScrollProp(paginator);
        expect(p.metadata()).toEqual({
            pageName: 'start',
            previousPage: null,
            nextPage: 12,
            currentPage: 0
        });
    });

    it('accepts a metadata provider object', () => {
        const p = new Prop.ScrollProp(paginator, 'data', {
            pageName: 'page', previousPage: 1, nextPage: 3, currentPage: 2
        });
        expect(p.metadata().currentPage).toBe(2);
    });

    it('accepts a metadata provider function receiving the resolved value', () => {
        const p = new Prop.ScrollProp(() => paginator, 'data', (value) => ({
            pageName: 'p', previousPage: null, nextPage: null, currentPage: value.meta.currentPage
        }));
        expect(p.metadata().currentPage).toBe(0);
    });

    it('memoizes resolve()', () => {
        let calls = 0;
        const p = new Prop.ScrollProp(() => { calls++; return paginator; });
        p.resolve();
        p.resolve();
        p.metadata();
        expect(calls).toBe(1);
    });

    it('supports the defer chain', () => {
        const p = new Prop.ScrollProp(paginator).defer('feed');
        expect(p.shouldDefer()).toBe(true);
        expect(p.group()).toBe('feed');
        expect(Prop.isIgnoreFirstLoad(p)).toBe(false); // Deferrable but NOT IgnoreFirstLoad
    });
});

describe('capability checks', () => {
    it('classifies each prop type', () => {
        const always = new Prop.AlwaysProp(1);
        const optional = new Prop.OptionalProp(() => 1);
        const defer = new Prop.DeferProp(() => 1);
        const merge = new Prop.MergeProp(1);
        const once = new Prop.OnceProp(() => 1);
        const scroll = new Prop.ScrollProp({});

        expect([always, optional, defer, merge, once, scroll].every(Prop.isPropType)).toBe(true);
        expect(Prop.isPropType({})).toBe(false);
        expect(Prop.isPropType(null)).toBe(false);
        expect(Prop.isPropType(() => 1)).toBe(false);

        expect(Prop.isIgnoreFirstLoad(optional)).toBe(true);
        expect(Prop.isIgnoreFirstLoad(defer)).toBe(true);
        expect(Prop.isIgnoreFirstLoad(scroll)).toBe(false);

        expect(Prop.isDeferrable(defer)).toBe(true);
        expect(Prop.isDeferrable(scroll)).toBe(true);
        expect(Prop.isDeferrable(merge)).toBe(false);

        expect(Prop.isMergeable(merge)).toBe(true);
        expect(Prop.isMergeable(defer)).toBe(true);
        expect(Prop.isMergeable(scroll)).toBe(true);
        expect(Prop.isMergeable(once)).toBe(false);

        expect(Prop.isOnceable(once)).toBe(true);
        expect(Prop.isOnceable(merge)).toBe(true);
        expect(Prop.isOnceable(defer)).toBe(true);
        expect(Prop.isOnceable(optional)).toBe(true);
        expect(Prop.isOnceable(scroll)).toBe(false);

        expect(Prop.isRescuable(defer)).toBe(true);
        expect(Prop.isRescuable(merge)).toBe(false);

        expect(Prop.isScroll(scroll)).toBe(true);
    });
});
