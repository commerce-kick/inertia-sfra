const MY_CUSTOM_VERSION = 10;
const MY_CUSTOM_CLIENT_VERSION = 6;
module.exports = {
    /**
     * @param {object} args
     * @param {import('@SalesforceCommerceCloud/b2c-tools').Environment} args.env
     * @param {ToolkitInstanceState} instanceState
     * @return {Promise<void>}
     */
    onBootstrap: async function ({env}, instanceState) {
        // DO SOMETHING
        instanceState.clients[env.clientID]._myCustomVersion = MY_CUSTOM_CLIENT_VERSION;
        instanceState.vars._myCustomVersion = MY_CUSTOM_VERSION;
    },

    /**
     * Called to determine if a bootstrap should occur
     * Return true or throwing an exception will trigger a bootstrap
     *
     * @param {object} args
     * @param {import('@SalesforceCommerceCloud/b2c-tools').Environment} args.env
     * @param {ToolkitInstanceState} instanceState
     * @return {Promise<boolean>}
     */
    shouldBootstrap: async function ({env}, instanceState) {
        if ((!instanceState.clients[env.clientID]._myCustomVersion ||
                instanceState.clients[env.clientID]._myCustomVersion < MY_CUSTOM_CLIENT_VERSION) ||
            (!instanceState.vars._myCustomVersion ||
                instanceState.vars._myCustomVersion < MY_CUSTOM_VERSION)
        ) {
            return true;
        }
    }
}

