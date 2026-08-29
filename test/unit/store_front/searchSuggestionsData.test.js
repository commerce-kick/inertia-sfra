import { describe, it, expect } from 'bun:test';
import { join } from 'node:path';

const loadModule = require('../inertia_plugin/helpers/loadModule');
const URLUtilsMock = require('../inertia_plugin/mocks/dw/URLUtils');

const CARTRIDGE_ROOT = join(
    import.meta.dir, '..', '..', '..',
    'store_front/cartridges/store_front/cartridge'
);

const SearchSuggestionsData = loadModule('scripts/data/SearchSuggestionsData.js', {
    cartridgeRoot: CARTRIDGE_ROOT,
    mocks: { 'dw/web/URLUtils': URLUtilsMock }
});

/**
 * Base answers {} for a too-short phrase or a miss, and its six models each
 * carry an `available` flag that must gate its group — otherwise a model that
 * reported nothing still contributes a heading to the typeahead.
 */

const PRODUCTS = {
    available: true,
    phrases: [
        { exactMatch: true, value: 'shirt' },
        { exactMatch: false, value: 'shirts' }
    ],
    products: [
        { name: 'Striped Shirt', imageUrl: '/shirt.jpg', url: '/Product-Show?pid=1' }
    ]
};

describe('SearchSuggestionsData.fromModels', () => {
    it('returns empty groups and a zero total for a missing payload', () => {
        const data = SearchSuggestionsData.fromModels(undefined);
        expect(data.total).toBe(0);
        expect(data.products).toEqual([]);
        expect(data.didYouMean).toEqual([]);
        expect(data.recent).toEqual([]);
    });

    it('treats base\'s empty {} response the same way', () => {
        expect(SearchSuggestionsData.fromModels({}).total).toBe(0);
    });

    it('keeps only non-exact phrases as "did you mean", with a built URL', () => {
        const data = SearchSuggestionsData.fromModels({ product: PRODUCTS });
        expect(data.didYouMean).toHaveLength(1);
        expect(data.didYouMean[0].value).toBe('shirts');
        expect(data.didYouMean[0].url).toContain('Search-Show');
        expect(data.didYouMean[0].url).toContain('shirts');
    });

    it('maps suggested products', () => {
        const data = SearchSuggestionsData.fromModels({ product: PRODUCTS });
        expect(data.products).toEqual([
            { name: 'Striped Shirt', url: '/Product-Show?pid=1', imageUrl: '/shirt.jpg', detail: '' }
        ]);
    });

    it('drops a group whose model reports itself unavailable', () => {
        const data = SearchSuggestionsData.fromModels({
            product: { available: false, phrases: [], products: [{ name: 'nope' }] },
            category: { available: false, categories: [{ name: 'nope' }] },
            content: { available: false, contents: [{ name: 'nope' }] },
            recent: { available: false, phrases: [{ value: 'nope' }] }
        });
        expect(data.products).toEqual([]);
        expect(data.categories).toEqual([]);
        expect(data.contents).toEqual([]);
        expect(data.recent).toEqual([]);
        expect(data.total).toBe(0);
    });

    it('names the parent category in `detail`, but not for root', () => {
        const data = SearchSuggestionsData.fromModels({
            category: {
                available: true,
                categories: [
                    { name: 'Shirts', url: '/c/shirts', imageUrl: '', parentID: 'mens', parentName: 'Mens' },
                    { name: 'Mens', url: '/c/mens', imageUrl: '', parentID: 'root', parentName: 'Root' }
                ]
            }
        });
        expect(data.categories[0].detail).toBe('Mens');
        expect(data.categories[1].detail).toBe('');
    });

    it('maps recent, popular and brand phrase groups', () => {
        const phrases = { available: true, phrases: [{ value: 'boots', url: '/Search-Show?q=boots' }] };
        const data = SearchSuggestionsData.fromModels({
            recent: phrases, popular: phrases, brand: phrases
        });
        expect(data.recent[0]).toEqual({ value: 'boots', url: '/Search-Show?q=boots' });
        expect(data.popular).toHaveLength(1);
        expect(data.brands).toHaveLength(1);
    });

    it('totals every group', () => {
        const data = SearchSuggestionsData.fromModels({
            product: PRODUCTS,
            recent: { available: true, phrases: [{ value: 'a', url: '/a' }, { value: 'b', url: '/b' }] }
        });
        // 1 did-you-mean + 1 product + 2 recent
        expect(data.total).toBe(4);
    });
});
