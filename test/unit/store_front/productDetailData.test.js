import { describe, it, expect } from 'bun:test';
import { join } from 'node:path';

const loadModule = require('../inertia_plugin/helpers/loadModule');

const CARTRIDGE_ROOT = join(
    import.meta.dir, '..', '..', '..',
    'store_front/cartridges/store_front/cartridge'
);

function load(path, mocks) {
    return loadModule(path, { cartridgeRoot: CARTRIDGE_ROOT, mocks: mocks || {} });
}

/**
 * Variant selection is server-owned: the PDP follows the URLs this DTO emits.
 * If the rewrite or the selectable/url passthrough regresses, the swatches go
 * inert again — which is the bug this suite exists to catch.
 */

const productUrls = load('scripts/data/productUrls.js');

describe('productUrls.normalizeVariationUrl', () => {
    it('rewrites the Product-Variation pipeline to Product-Show', () => {
        expect(productUrls.normalizeVariationUrl(
            'https://x/on/demandware.store/Sites-RefArch-Site/en_US/Product-Variation?dwvar_25604524_color=BLACK&pid=25604524'
        )).toBe(
            'https://x/on/demandware.store/Sites-RefArch-Site/en_US/Product-Show?dwvar_25604524_color=BLACK&pid=25604524'
        );
    });

    it('keeps the query string, including dwvar params, intact', () => {
        const out = productUrls.normalizeVariationUrl(
            '/Product-Variation?dwvar_1_color=RED&dwvar_1_size=M&quantity=1'
        );
        expect(out).toContain('dwvar_1_color=RED');
        expect(out).toContain('dwvar_1_size=M');
        expect(out).toContain('quantity=1');
    });

    it('accepts a dw.web.URL-like object', () => {
        expect(productUrls.normalizeVariationUrl({
            toString: () => '/Product-Variation?pid=1'
        })).toBe('/Product-Show?pid=1');
    });

    it('returns an empty string for a missing url', () => {
        expect(productUrls.normalizeVariationUrl(undefined)).toBe('');
        expect(productUrls.normalizeVariationUrl('')).toBe('');
    });

    it('leaves an already-normalized url alone', () => {
        expect(productUrls.normalizeVariationUrl('/Product-Show?pid=1'))
            .toBe('/Product-Show?pid=1');
    });
});

const ProductDetailData = load('scripts/data/ProductDetailData.js');

const COLOR_ATTR = {
    attributeId: 'color',
    displayName: 'Colour',
    displayValue: 'Black',
    swatchable: true,
    resetUrl: '/Product-Variation?dwvar_1_color=',
    values: [
        {
            id: 'BLACK',
            displayValue: 'Black',
            selected: true,
            selectable: true,
            url: '/Product-Variation?dwvar_1_color=BLACK',
            images: { swatch: [{ url: { toString: () => '/black.png' }, alt: 'Black' }] }
        },
        {
            id: 'RED',
            displayValue: 'Red',
            selected: false,
            selectable: false
        }
    ]
};

function mapAttributes(attrs) {
    return ProductDetailData.from({ variationAttributes: attrs }).variationAttributes;
}

describe('ProductDetailData variation attributes', () => {
    it('carries the selecting URL, normalized to Product-Show', () => {
        const [attr] = mapAttributes([COLOR_ATTR]);
        expect(attr.values[0].url).toBe('/Product-Show?dwvar_1_color=BLACK');
    });

    it('normalizes the attribute reset URL too', () => {
        const [attr] = mapAttributes([COLOR_ATTR]);
        expect(attr.resetUrl).toBe('/Product-Show?dwvar_1_color=');
    });

    it('exposes the selected value label on the attribute', () => {
        const [attr] = mapAttributes([COLOR_ATTR]);
        expect(attr.displayValue).toBe('Black');
    });

    it('marks an unorderable value unselectable with no URL', () => {
        const [attr] = mapAttributes([COLOR_ATTR]);
        expect(attr.values[1].selectable).toBe(false);
        expect(attr.values[1].url).toBe('');
    });

    it('preserves selection state and swatch imagery', () => {
        const [attr] = mapAttributes([COLOR_ATTR]);
        expect(attr.swatchable).toBe(true);
        expect(attr.values[0].selected).toBe(true);
        expect(attr.values[0].image).toEqual({ url: '/black.png', alt: 'Black' });
        expect(attr.values[1].image).toBeNull();
    });

    it('falls back to id when the attribute has no display name', () => {
        const [attr] = mapAttributes([{ id: 'size', values: [] }]);
        expect(attr.id).toBe('size');
        expect(attr.displayName).toBe('');
        expect(attr.displayValue).toBe('');
        expect(attr.resetUrl).toBe('');
    });

    it('defaults to an empty list when the model has no variations', () => {
        expect(ProductDetailData.from({}).variationAttributes).toEqual([]);
        expect(mapAttributes(null)).toEqual([]);
    });
});

describe('ProductDetailData quickview additions', () => {
    it('carries the raw Product-Variation URL alongside the Product-Show one', () => {
        const [attr] = mapAttributes([COLOR_ATTR]);
        // The PDP navigates with `url`; quickview fetches `variationUrl` so it
        // can swap the variant without leaving the grid.
        expect(attr.values[0].url).toBe('/Product-Show?dwvar_1_color=BLACK');
        expect(attr.values[0].variationUrl).toBe('/Product-Variation?dwvar_1_color=BLACK');
    });

    it('leaves variationUrl empty for an unselectable value', () => {
        const [attr] = mapAttributes([COLOR_ATTR]);
        expect(attr.values[1].variationUrl).toBe('');
    });

    it('maps promotion callouts', () => {
        const data = ProductDetailData.from({
            promotions: [
                { id: 'p1', calloutMsg: '<b>20% off</b>', name: 'Spring', details: 'Ends soon' }
            ]
        });
        expect(data.promotions).toEqual([
            { id: 'p1', calloutMsg: '<b>20% off</b>', name: 'Spring', details: 'Ends soon' }
        ]);
    });

    it('defaults promotions to an empty list', () => {
        expect(ProductDetailData.from({}).promotions).toEqual([]);
        expect(ProductDetailData.from({ promotions: null }).promotions).toEqual([]);
    });
});
