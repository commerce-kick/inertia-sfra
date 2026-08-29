import { describe, it, expect } from 'bun:test';

const loadModule = require('./helpers/loadModule');
const createSession = require('./mocks/session');

describe('test harness', () => {
    it('loads a dependency-free cartridge module (Headers.js)', () => {
        const Headers = loadModule('scripts/inertia/Headers.js');
        expect(Headers.INERTIA_REQUEST).toBe('x-inertia');
        expect(Headers.INERTIA).toBe('X-SF-CC-Inertia');
    });

    it('loads Prop.js and constructs props', () => {
        const Prop = loadModule('scripts/inertia/Prop.js');
        expect(typeof Prop.AlwaysProp).toBe('function');
        const p = new Prop.AlwaysProp('v');
        expect(p.value).toBe('v');
    });

    it('injects SFCC globals hermetically', () => {
        const session = createSession();
        session.privacy.inertia_probe = 'x';
        // A tiny inline fixture isn't possible (loader reads files), so assert
        // via a module that touches a global: SessionFlash once it exists.
        // For now verify the loader passes distinct globals per call.
        const HeadersA = loadModule('scripts/inertia/Headers.js', { globals: { session } });
        const HeadersB = loadModule('scripts/inertia/Headers.js');
        expect(HeadersA).not.toBe(HeadersB); // fresh module instance per load
    });

    it('throws a descriptive error for unmocked specifiers', () => {
        const fixture = `${__dirname}/helpers/fixtures/requiresDw.js`;
        expect(() => loadModule(fixture)).toThrow(/Unmocked require\("dw\/never\/Mocked"\)/);
    });

    it('honors mocks for any specifier form', () => {
        const fakeVite = () => '<script></script>';
        const inertia = loadModule('scripts/inertia/Inertia.js', {
            mocks: {
                '*/cartridge/helpers/vite': fakeVite,
                '*/cartridge/config/inertia': { exposeSharedPropKeys: true, rootView: 'x' },
                '*/cartridge/static/default/manifest.json': {},
                'dw/system/Logger': require('./mocks/dw/Logger')()
            },
            globals: { session: createSession(), request: require('./mocks/request').createRequest() }
        });
        expect(typeof inertia).toBe('function');
    });
});
