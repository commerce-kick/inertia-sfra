
module.exports = {
    command: 'sync',
    deprecated: true,
    desc: false,
    builder: (yargs) => yargs
        .option('r', {
            alias: 'reload',
            default: true
        }),
    handler: async () => { throw new Error('sync command is deprecated; use code deploy') }
};
