export = InMemoryPersistingTransport;
declare class InMemoryPersistingTransport extends TransportStream {
    /**
     * Constructor function for the InMemoryTransport object responsible for
     * persisting logs in memory with the goal of persisting them on the b2c instance
     *
     * @param {Object} options - Options for the InMemoryTransport object
     */
    constructor(options?: any);
    logs: any[];
    currentMark: number;
    clear(): void;
    /**
     * Mark a point in the log stream
     */
    mark(): void;
    /**
     * Get all logs since the last mark
     */
    getMarkedLogs(): any[];
    clearMark(): void;
    /**
     * Core logging method exposed to Winston.
     * @returns {undefined}
     */
    log(info: any, callback: any): undefined;
}
import TransportStream = require("winston-transport");
//# sourceMappingURL=in-memory-transport.d.ts.map