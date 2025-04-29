
module.exports = async function({logger}) {
    logger.info("This is a null script migration", {
        label: "custom_label"
    });
}

module.exports.notes = `This is a test script migration note`

