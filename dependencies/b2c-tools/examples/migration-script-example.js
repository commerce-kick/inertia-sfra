/**
 * Example migration script w/ a contrived use-case to demonstrate OCAPI and Impex:
 *
 * Migrate all sites to ensure they have a (development) communications handler config
 * if handlerframework is present (i.e. required custom-object is *potentially* missing, but should not be overwritten)
 *
 * @param {MigrationScriptArguments} options
 * @return {Promise<void>}
 */
module.exports = async function ({env, logger, helpers}) {
    const {siteArchiveImportText} = helpers;
    const sites = await env.ocapi.get('sites?select=(**)');

    let missingSites = [];
    for (/** @type Site */ let site of sites.data.data) {
        if (!site.cartridges.includes('int_handlerframework')) {
            continue;
        }

        try {
            await env.ocapi.get(`sites/${site.id}/custom_objects/CommunicationHandlers/development`);
        } catch (/** @type AxiosError*/ e) {
            if (e.response && e.response.status === 404) {
                missingSites.push(site.id);
            } else {
                throw e;
            }
        }
    }

    if (missingSites.length) {
        logger.info(`Updating comms handler custom obj on: ${missingSites.join(',')}`);
        // import comms handler for all missing sites
        await siteArchiveImportText(env, new Map(
            missingSites.map((id) => [
                `sites/${id}/custom-objects/CommunicationHandlers.xml`,
                COMMS_HANDLER_XML
            ])
        ));
    } else {
        logger.info('No sites require updating.');
    }
};

const COMMS_HANDLER_XML = `<?xml version="1.0" encoding="UTF-8"?>
<custom-objects xmlns="http://www.demandware.com/xml/impex/customobject/2006-10-31">
    <custom-object type-id="CommunicationHandlers" object-id="development">
        <object-attribute attribute-id="configJson">{
    "standard_email": {
        "name": "Standard email",
        "cartridge": "int_handlerframework",
        "id": "standard_email",
        "hooks": [
            {
                "name": "app.communication.account.created",
                "script": "~/cartridge/scripts/communication/account",
                "enabled": true
            },
            {
                "name": "app.communication.account.updated",
                "script": "~/cartridge/scripts/communication/account",
                "enabled": true
            },
            {
                "name": "app.communication.account.passwordChanged",
                "script": "~/cartridge/scripts/communication/account",
                "enabled": true
            },
            {
                "name": "app.communication.account.passwordReset",
                "script": "~/cartridge/scripts/communication/account",
                "enabled": true
            },
            {
                "name": "app.communication.account.lockedOut",
                "script": "~/cartridge/scripts/communication/account",
                "enabled": true
            },
            {
                "name": "app.communication.customerService.contactUs",
                "script": "~/cartridge/scripts/communication/customerService",
                "enabled": true
            },
            {
                "name": "app.communication.giftCertificate.sendCertificate",
                "script": "~/cartridge/scripts/communication/giftCertificate",
                "enabled": true
            },
            {
                "name": "app.communication.order.confirmation",
                "script": "~/cartridge/scripts/communication/order",
                "enabled": true
            }
        ],
        "enabled": false
    },
    "int_marketing_cloud": {
        "name": "Marketing Cloud Connector",
        "id": "int_marketing_cloud",
        "cartridge": "int_marketing_cloud",
        "hooks": [
            {
                "name": "app.communication.account.created",
                "script": "~/cartridge/scripts/communication/account",
                "enabled": true
            },
            {
                "name": "app.communication.account.updated",
                "script": "~/cartridge/scripts/communication/account",
                "enabled": true
            },
            {
                "name": "app.communication.account.passwordChanged",
                "script": "~/cartridge/scripts/communication/account",
                "enabled": true
            },
            {
                "name": "app.communication.account.passwordReset",
                "script": "~/cartridge/scripts/communication/account",
                "enabled": true
            },
            {
                "name": "app.communication.account.lockedOut",
                "script": "~/cartridge/scripts/communication/account",
                "enabled": true
            },
            {
                "name": "app.communication.customerService.contactUs",
                "script": "~/cartridge/scripts/communication/customerService",
                "enabled": true
            },
            {
                "name": "app.communication.giftCertificate.sendCertificate",
                "script": "~/cartridge/scripts/communication/giftCertificate",
                "enabled": true
            },
            {
                "name": "app.communication.order.confirmation",
                "script": "~/cartridge/scripts/communication/order",
                "enabled": true
            },
            {
                "name": "app.communication.oms.invoiceProcessed",
                "script": "./communication/oms",
                "enabled": false
            },
            {
                "name": "app.communication.oms.returnOrderCreated",
                "script": "./communication/oms",
                "enabled": false
            },
            {
                "name": "app.communication.oms.shipment",
                "script": "./communication/oms",
                "enabled": false
            }
        ],
        "enabled": true
    }
}</object-attribute>
    </custom-object>

</custom-objects>
`;

/**
 * @typedef {object} Site
 * @property {string} id
 * @property {string} cartridges
 */

