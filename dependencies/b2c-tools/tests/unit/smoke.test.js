const MockAdapter = require('axios-mock-adapter');
const axios = require('axios');

let mock;
let client;

beforeEach(() => {
    client = axios.create({
        baseURL: `https://example.com/`,
        timeout: 600000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });

    mock = new MockAdapter(client);
    mock.onGet("foo").reply(200, {
        "prop1": {
            "prop2": "val1"
        }
    })
})

test("should have working axios mocks", async () => {
    const result = await client.get('foo');
    expect(result.data.prop1.prop2).toBe("val1")
})

afterEach(() => {
    mock.restore();
})
