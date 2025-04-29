// In memory winston transport

const {MESSAGE} = require('triple-beam');
const TransportStream = require('winston-transport');

module.exports = class InMemoryPersistingTransport extends TransportStream {
    /**
     * Constructor function for the InMemoryTransport object responsible for
     * persisting logs in memory with the goal of persisting them on the b2c instance
     *
     * @param {Object} options - Options for the InMemoryTransport object
     */
    constructor(options = {}) {
        super(options);

        this.logs = [];
        this.currentMark = 0;
    }

    clear() {
        this.logs = [];
    }

    /**
     * Mark a point in the log stream
     */
    mark() {
        this.currentMark = this.logs.length - 1;
    }

    /**
     * Get all logs since the last mark
     */
    getMarkedLogs() {
        return this.logs.slice(this.currentMark);
    }

    clearMark() {
        this.currentMark = 0;
    }

    /**
     * Core logging method exposed to Winston.
     * @returns {undefined}
     */
    log(info, callback) {
        setImmediate(() => this.emit('logged', info));

        this.logs.push(`${info[MESSAGE]}`);
        if (callback) {
            callback(); // eslint-disable-line callback-return
        }
        return;
    }
};