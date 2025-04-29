const SENSITIVE_KEYS = [
    'password', 'token', 'secret', 'client_secret',
    'refresh_token', 'access_token', 'authorization', 'authorization_code',
    'bearer', 'api_key', 'api_secret', 'api_token', 'c_secretVars'
]
exports.redactSensitiveData = function (obj) {
    function redact(obj) {
        if (obj === null || obj === undefined) return obj; // Return as is if null or undefined
        if (typeof obj !== 'object' || Array.isArray(obj)) {
            // Non-object and array values are returned as-is
            return obj;
        }

        // For dealing with Dates and other objects that shouldn't be traversed
        if (obj.constructor && obj.constructor !== Object) {
            return obj;
        }

        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            if (SENSITIVE_KEYS.includes(key) && typeof value === 'string') {
                // If the key is sensitive, redact the value
                result[key] = 'REDACTED';
            } else if (typeof value === 'object') {
                // If the value is an object, recurse
                result[key] = redact(value);
            } else {
                // Otherwise, copy the value as is
                result[key] = value;
            }
        }
        return result;
    }

    return redact(obj);
};