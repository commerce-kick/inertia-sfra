# CLI Extension

`b2c-tools` can be used as the basis for new command line interfaces. A developer can create
new CLI tools or enhance existing ones without needing to deal with standard B2C configuration
loading or authentication.

A pre-configured [yargs](http://yargs.js.org/) `argv` is exported that provides the same
configuration, config file loading and global configuration that b2c-tools uses. Additionally 
the [winston]() logger used internally is also exported. By using both export a command line
interface can be developed that leverages the configuration loading functionality of b2c-tools,
any and all commands and the ability to reconfigure the logging of existing commands.

## Example

The following example creates a new CLI with a new, dummy, command and replicates the exact
logging functionality of b2c-tools.

```javascript
#!/usr/bin/env node

// import yargs CLI stub and all commands + logger
const {cli, commands, logger} = require('@SalesforceCommerceCloud/b2c-tools');
// optionally import individual commands
// const exportCommand = require('b2c-tools/lib/command-export');

// same .env behavior
require('dotenv').config({ override: true })

// extend b2c-tools cli
cli
    .epilogue('Example CLI')
    .command('dummy', 'dummy command', (_yargs) => _yargs,
        (argv) => console.log("dummy command")
    )
    // extend all commands b2c-tools provides
    .command(commands)
    // OR import a single command at a time
    // .command(exportCommand)
    // OR include no commands at all from b2c-tools and just use the 
    // configuration system and API
    .fail(function (msg, err, yargs) {
        if (err) {
            logger.error(err.message);
            logger.debug(err.stack);
        } else {
            console.error(yargs.help());
            console.error();
            console.error(msg);
        }
        process.exit(1);
    })
    .demandCommand()
    .help()
    .parse()
```

The above script will produce a CLI that is a direct superset of `b2c-tools`:

```
cli.js <command>

Commands:
  cli.js dummy     dummy command
  cli.js export    exports data from b2c instances
  cli.js import    manage data imports and migrations
  cli.js instance  project setup commands
  cli.js sync      sync catridges and optional activate/reload code version
  cli.js tail      watch instance logs

B2C Connection:
  -i, --instance                            instance name in config file
  -s, --server                              b2c instance hostname
  -u, --username                            webdav username
  -p, --password                            password/webdav access key
      --client-id, --oauth-client-id        API client ID
      --client-secret,                      API client secret
      --oauth-client-secret
      --code-version                        b2c code version
      --verify                              verify SSL [boolean] [default: true]
      --secure-server                       b2c instance hostname (webdav write
                                            access)
      --certificate                         path to pkcs12 certificate
      --passphrase                          passphrase for certificate

Options:
      --version  Show version number                                   [boolean]
  -D, --debug    output debug logging (also to debug.log)
                                                      [boolean] [default: false]
      --config   path to dw.json config                     [default: "dw.json"]
      --help     Show help                                             [boolean]

Example CLI

Not enough non-option arguments: got 0, need at least 1
```

```shell
$ ./cli.js dummy
dummy command
```

## Overriding Logging

When extending you can clear the existing logger configuration adding formats, transports and behavior
for your CLI.

```javascript
const winston = require("winston");

// setup logging the same way b2c-tools does
function setupLogging(debug = false) {
    logger.clear()
        .add(new winston.transports.Console({
            level: debug ? 'debug' : 'info',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.splat(),
                winston.format.simple()
            )
        }));
    if (debug) {
        logger.add(new winston.transports.File({
            filename: 'debug.log',
            level: 'debug',
            format: winston.format.combine(
                winston.format.simple(),
                winston.format.timestamp({format: 'shortTime'})
            )
        }))
    }
}

// call in middleware
cli.middleware(function (argv, _yargs) {
    setupLogging(argv.debug);
})
```
