const {encryptCredentials, decryptCredentials, getIntellijSFCCConnectionSettings, setIntellijSFCCConnectionSettings} = require("../../lib/intellij");
const path = require("path");

const IDEA_MISC = path.join(__dirname, "../fixtures/idea/misc.xml");
//const IDEA_MISC = path.join(__dirname, "../../.idea/misc.xml");

test('encrypts file using default algorithm', function () {
    var cipherText = encryptCredentials(CREDENTIALS_OBJ, KEY)
    expect(cipherText).toEqual(CIPHER_FIXTURE)
})

test('decrypts blob using default algorithm', function () {
    var plainText = decryptCredentials(CIPHER_FIXTURE, KEY)
    expect(plainText).toEqual(CREDENTIALS_OBJ)
    expect(JSON.parse(plainText)).toHaveProperty("accounts")
})

test('extracts connection settings from IDEA file', async function () {
    var connectionSettings = await getIntellijSFCCConnectionSettings(IDEA_MISC)
    expect(connectionSettings.source.length).toBe(2)
})

test('sets connection settings', async function () {
    await setIntellijSFCCConnectionSettings(IDEA_MISC, CONNECTIONS_OBJ)
})

const KEY = 'a123-45-2abc123abc123abc'
const CREDENTIALS_OBJ = `{
 "accounts": [
    {
      "username": "clavery@salesforce.com",
      "hidePassword": true,
      "accessKeys": [
        {
          "username": "clavery@salesforce.com",
          "keys": {
            "abcd-123.dx.commercecloud.salesforce.com": {
              "WebDAV": "password"
            },
            "abcd-456.dx.commercecloud.salesforce.com": {
              "WebDAV": "password"
            }
          }
        }
      ],
      "password": "test"
    }
  ],
  "ocapiKeys": [
    {
      "clientId": "xyz123",
      "clientSecret": ""
    },
    {
      "clientId": "abc123",
      "clientSecret": ""
    }
  ]
}`
// should be the ciphertext output of the above
const CIPHER_FIXTURE = "7bKpctg3UtqxUBfklmDsc37EFr61QRWhOUNSoFpaYEK6DfGAOQwkBj16R8qLdJ9RluR8iHLkROF3XofjSjZN+vPXtRlsPznvCDmQEyywxZKRiIG/tu5yVfDWsrX5XV3YxQ5xA29IIJYFrpGD8SA4u+3DkXrgL690YdbqL299iUuxHBMdRbHHYe1eTINHpDzNcvdywpZWXdDB2pzXfk4C4vdUpTWF60eeIj3JCsxqFIv6EqDdZdGgdWt7nfVLJfo6viCMU+9WjYvVe5qoc5RhEG6GJuFf6IhZ0nL0ZKI7s/WpvAQwoSxFml+aND2TtOKWiLSdU9B2vZ/czSuDYRDTMAJRMJ8kNL+2D2HoyAk7hPF5/oKUxp/GClLZRDuO/dmpxtwIT5drhRwCWXIyyKaMOvy/lJgIyAbpVxjFxzz85gYm5sb7/ICK39qXUrVX8fqxUFf3YF3XLDKa9kDZTguM2SBatOShTfCwmRhfWy5RUfQDUj8AKHF4z+K1zIE7H9jRxaH3vPAi7pXxQfGcnClkTZzd3DrncyvFYMYsnNf371BIHREHVyxiZoTe+GriKaqXzVOw7V+o8MVJluK21JfWiEXfhPocdyqL65zPDIP4t71g+sjMdBmEyEHDDBCeRqb0tNRo3n0zcz9zpMJJcQjL7ulh6sjh8mOwxSENsmg4CzD6tfKb+x0ybqe792WlPJA6OQttnyh+foiUXo2ci7aGcEx3Si+g9Em7dMfAWZlaSH9wiP60iRqhMyRK/L1R2iAm3ktR5dZwx+/RJTrzwcd55id6hqWF7lQKXUyI7fVFZ/ZI0hhC3K1Bp5KTb3TQgbGE0hoZfi5k0Ek7DHaX8FT9pA=="

const CONNECTIONS_OBJ = {
    "source": [
        {
            "name": "abcd-123",
            "hostname": "abcd-123.dx.commercecloud.salesforce.com",
            "username": "clavery@salesforce.com",
            "password": "testing",
            "useOcapi": false,
            "ocapi-version": "19.5",
            "code-version": "clavery",
            "useCertificate": false,
            "secureHostname": "",
            "autoUpload": false,
            "malformed": false,
            "connected": false,
            "active": true,
            "configs": [],
            "groupUUID": "",
            "groupName": "",
            "isGroup": false,
            "groupConnections": [],
            "accessKeys": {}
        },
        {
            "name": "abcd-456",
            "hostname": "abcd-456.dx.commercecloud.salesforce.com",
            "username": "clavery@salesforce.com",
            "password": "testing",
            "useOcapi": false,
            "ocapi-version": "19.5",
            "code-version": "clavery",
            "useCertificate": false,
            "secureHostname": "",
            "autoUpload": false,
            "malformed": false,
            "connected": false,
            "active": true,
            "configs": [],
            "groupUUID": "",
            "groupName": "",
            "isGroup": false,
            "groupConnections": [],
            "accessKeys": {}
        }
    ]
}
