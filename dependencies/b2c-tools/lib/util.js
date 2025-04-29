/**
 * Sleep for ms milliseconds
 *
 * @param ms {number} milliseconds
 * @return {Promise<void>}
 */
exports.sleep = function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
