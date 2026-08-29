import { describe, it, expect, beforeEach } from 'bun:test';

const loadModule = require('./helpers/loadModule');
const createSession = require('./mocks/session');
const createLoggerMock = require('./mocks/dw/Logger');
const { createRequest } = require('./mocks/request');

function load({ session, request, logger } = {}) {
    return loadModule('scripts/inertia/SessionFlash.js', {
        mocks: { 'dw/system/Logger': logger || createLoggerMock() },
        globals: {
            session: session || createSession(),
            request: request || createRequest()
        }
    });
}

describe('SessionFlash', () => {
    let session;
    let request;
    let flash;

    beforeEach(() => {
        session = createSession();
        request = createRequest();
        flash = load({ session, request });
    });

    it('round-trips values as JSON strings in session.privacy', () => {
        flash.put('flash', { message: 'Saved!', count: 2 });
        expect(typeof session.privacy.inertia_flash).toBe('string');
        expect(flash.peek('flash')).toEqual({ message: 'Saved!', count: 2 });
    });

    it('peek does not delete; pull does', () => {
        flash.put('flash', { a: 1 });
        expect(flash.peek('flash')).toEqual({ a: 1 });
        expect(session.privacy.inertia_flash).toBeDefined();
        expect(flash.pull('flash')).toEqual({ a: 1 });
        expect(session.privacy.inertia_flash).toBeNull();
        expect(flash.pull('flash', 'fallback')).toBe('fallback');
    });

    it('merge combines with the stored object', () => {
        flash.put('errors', { default: { email: 'Required' } });
        flash.merge('errors', { login: { password: 'Wrong' } });
        expect(flash.peek('errors')).toEqual({
            default: { email: 'Required' },
            login: { password: 'Wrong' }
        });
    });

    it('flags: setFlag / pullFlag are one-shot', () => {
        flash.setFlag('clear_history');
        expect(session.privacy.inertia_clear_history).toBe('1');
        expect(flash.pullFlag('clear_history')).toBe(true);
        expect(flash.pullFlag('clear_history')).toBe(false);
    });

    it('survives a simulated redirect (nothing pulled) then is consumed on render', () => {
        flash.put('flash', { notice: 'Created' });
        // redirect happens: adapter never pulls
        expect(flash.peek('flash')).toEqual({ notice: 'Created' });
        // next request renders: pull consumes
        expect(flash.pull('flash')).toEqual({ notice: 'Created' });
        expect(flash.peek('flash')).toBeUndefined();
    });

    it('does not delete on pull inside a remote include request', () => {
        const includeRequest = createRequest({ includeRequest: true });
        const includeFlash = load({ session, request: includeRequest });
        includeFlash.put('flash', { keep: true });
        expect(includeFlash.pull('flash')).toEqual({ keep: true });
        expect(session.privacy.inertia_flash).toBeDefined(); // still there
        expect(includeFlash.pullFlag('missing')).toBe(false);
    });

    it('discards corrupt JSON and returns the default', () => {
        const logger = createLoggerMock();
        const corruptFlash = load({ session, request, logger });
        session.privacy.inertia_flash = '{not json';
        expect(corruptFlash.peek('flash', 'dflt')).toBe('dflt');
        expect(session.privacy.inertia_flash).toBeNull();
        expect(logger.calls.some((c) => c.level === 'warn')).toBe(true);
    });

    it('drops oversized values with a warning instead of throwing', () => {
        const logger = createLoggerMock();
        const guarded = load({ session, request, logger });
        const big = { blob: new Array(3000).join('x') };
        expect(guarded.put('flash', big)).toBe(false);
        expect(session.privacy.inertia_flash).toBeUndefined();
        expect(logger.calls.some((c) => c.level === 'warn')).toBe(true);
    });

    it('exposes the well-known keys', () => {
        expect(flash.KEYS).toEqual({
            FLASH: 'flash',
            ERRORS: 'errors',
            CLEAR_HISTORY: 'clear_history',
            PRESERVE_FRAGMENT: 'preserve_fragment'
        });
    });
});

describe('utils', () => {
    const utils = loadModule('scripts/inertia/utils.js');

    it('getRequestHeader works with .get() maps and plain objects', () => {
        const { makeHeaders } = require('./mocks/request');
        const viaMap = makeHeaders({ 'X-Inertia': 'true' });
        expect(utils.getRequestHeader(viaMap, 'x-inertia')).toBe('true');
        expect(utils.getRequestHeader({ 'x-inertia': 'true' }, 'x-inertia')).toBe('true');
        expect(utils.getRequestHeader({ 'x-inertia': '' }, 'x-inertia')).toBe(null);
        expect(utils.getRequestHeader(null, 'x-inertia')).toBe(null);
    });

    it('parseListHeader mirrors Laravel parseHeader', () => {
        expect(utils.parseListHeader('a,b,c')).toEqual(['a', 'b', 'c']);
        expect(utils.parseListHeader('a,,b')).toEqual(['a', 'b']);
        expect(utils.parseListHeader('')).toBe(null);
        expect(utils.parseListHeader(null)).toBe(null);
        expect(utils.parseListHeader(',')).toBe(null);
    });

    it('isPlainObject excludes arrays, dates, and prop wrappers', () => {
        expect(utils.isPlainObject({})).toBe(true);
        expect(utils.isPlainObject([])).toBe(false);
        expect(utils.isPlainObject(new Date())).toBe(false);
        expect(utils.isPlainObject({ __inertiaProp: true })).toBe(false);
        expect(utils.isPlainObject(null)).toBe(false);
    });

    it('deepSet creates intermediate objects', () => {
        const target = { auth: { user: { id: 1 } } };
        utils.deepSet(target, 'auth.user.name', 'Sam');
        utils.deepSet(target, 'brand.new.path', true);
        expect(target.auth.user).toEqual({ id: 1, name: 'Sam' });
        expect(target.brand.new.path).toBe(true);
    });

    it('firstSegment', () => {
        expect(utils.firstSegment('auth.user')).toBe('auth');
        expect(utils.firstSegment('plain')).toBe('plain');
    });
});
