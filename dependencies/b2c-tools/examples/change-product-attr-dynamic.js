#!/usr/bin/env node
/* eslint-disable no-unused-vars */

/**
 *
 * run with SFCC_VARS__catalogId=my-catalog b2c-tools import run change-product-attr-dynamic.js
 * @param {MigrationScriptArguments} args
 * @return {Promise<void>}
 */
module.exports = async function ({env, logger, helpers, vars}) {

    logger.info(vars.catalogId)
    // TODO must paginate to use more than 100 products
    const resp = await env.ocapi.post('product_search',
        {
            query: {
                bool_query: {
                    must: [
                        {
                            term_query: {
                                fields: ["catalog_id"],
                                operator: "is",
                                values: [vars.catalogId],
                            },
                        }, {
                            term_query: {
                                fields: ["type"],
                                operator: "one_of",
                                values: ["master"]
                            }
                        }
                    ]
                }
            },
            select: "(**)",
            count: 100
        }
    )


    logger.info(`Found ${resp.data.count} products in ${vars.catalogId}`)
    for (let product of resp.data.hits) {
        /** @type {Array} */
        const activity = product.c_activity?.default
        if (activity) {
            if (activity.includes('Hiking')) {
                product.c_activity.default = ["Hiking", "Camping"]
            }
            // more changes...

            logger.info(`Updating ${product.id}`)
            await env.ocapi.patch(`products/${product.id}`, {
                c_activity: {
                    default: product.c_activity.default
                }
            });
        }
    }
}

require.main === module && require('@SalesforceCommerceCloud/b2c-tools').runAsScript()
