# API Usage

TODO

### Combined Example

See [../examples](../examples)

```js
var {Environment, siteArchiveExportJson} = require('@SalesforceCommerceCloud/b2c-tools');
```

### Table of Contents

*   [runAsScript][1]
*   [parseConfig][2]
    *   [Parameters][3]
*   [decryptCredentials][4]
    *   [Parameters][5]
*   [encryptCredentials][6]
    *   [Parameters][7]
*   [convertDWJsonToIntellij][8]
    *   [Parameters][9]
*   [getIntellijSFCCConnectionSettings][10]
    *   [Parameters][11]
*   [setIntellijSFCCConnectionSettings][12]
    *   [Parameters][13]
*   [isStream][14]
    *   [Parameters][15]
*   [EnvironmentOpts][16]
    *   [Properties][17]
*   [Environment][18]
    *   [Examples][19]
    *   [am][20]
    *   [ocapi][21]
    *   [ods][22]
    *   [scapi][23]
    *   [webdav][24]
    *   [deauthenticate][25]
*   [AccessTokenResponse][26]
    *   [Properties][27]
*   [collectMigrations][28]
    *   [Parameters][29]
*   [MigrationHelpers][30]
*   [MigrationScriptArguments][31]
    *   [Properties][32]
*   [MigrationScriptCallback][33]
    *   [Parameters][34]
*   [ToolkitClientState][35]
    *   [Properties][36]
*   [ToolkitInstanceState][37]
    *   [Properties][38]
*   [InitLifecycleFunction][39]
    *   [Parameters][40]
*   [ShouldBootstrapLifecycleFunction][41]
    *   [Parameters][42]
*   [OnBootstrapLifecycleFunction][43]
    *   [Parameters][44]
*   [BeforeAllLifecycleFunction][45]
    *   [Parameters][46]
*   [BeforeEachLifecycleFunction][47]
    *   [Parameters][48]
*   [AfterEachLifecycleFunction][49]
    *   [Parameters][50]
*   [AfterAllLifecycleFunction][51]
    *   [Parameters][52]
*   [OnFailureLifecycleFunction][53]
    *   [Parameters][54]
*   [MigrationLifecycleFunctions][55]
    *   [Properties][56]
*   [getInstanceState][57]
    *   [Parameters][58]
*   [updateInstanceMetadata][59]
    *   [Parameters][60]
*   [updateInstanceMigrations][61]
    *   [Parameters][62]
*   [isBootstrapRequired][63]
    *   [Parameters][64]
*   [isBootstrapRequired][65]
    *   [Parameters][66]
*   [migrateInstance][67]
    *   [Parameters][68]
*   [lifeCycleModule][69]
*   [runMigrationScript][70]
    *   [Parameters][71]
*   [runMigrationScriptText][72]
    *   [Parameters][73]
*   [uploadArchive][74]
    *   [Parameters][75]
*   [uploadArchiveText][76]
    *   [Parameters][77]
*   [LibraryNode][78]
    *   [Properties][79]
*   [processContent][80]
    *   [Parameters][81]
*   [node][82]
*   [FilterCallback][83]
    *   [Parameters][84]
*   [TraverseCallback][85]
    *   [Parameters][86]
*   [LibraryExport][87]
    *   [Properties][88]
*   [Library][89]
    *   [traverse][90]
        *   [Parameters][91]
    *   [reset][92]
    *   [filter][93]
        *   [Parameters][94]
    *   [toXMLString][95]
        *   [Parameters][96]
    *   [outputLibraryTree][97]
        *   [Parameters][98]
    *   [parse][99]
        *   [Parameters][100]
*   [Library][101]
    *   [Properties][102]
    *   [traverse][103]
        *   [Parameters][104]
    *   [reset][105]
    *   [filter][106]
        *   [Parameters][107]
    *   [toXMLString][108]
        *   [Parameters][109]
    *   [outputLibraryTree][110]
        *   [Parameters][111]
    *   [parse][112]
        *   [Parameters][113]
*   [root][114]
*   [exportPagesToFolder][115]
    *   [Parameters][116]
*   [CollectionLists][117]
    *   [Properties][118]
*   [getCollectionsFromInstance][119]
    *   [Parameters][120]
*   [getDataUnitsFromWeb][121]
    *   [Parameters][122]
*   [getDataUnitsFromArgument][123]
    *   [Parameters][124]
*   [configNameFromHostname][125]
    *   [Parameters][126]
*   [LogFile][127]
    *   [Properties][128]
*   [getLogs][129]
    *   [Parameters][130]
*   [tailCommand][131]
    *   [Parameters][132]
*   [Question][133]
    *   [Properties][134]
*   [Feature][135]
    *   [Properties][136]
*   [FeatureState][137]
    *   [Properties][138]
*   [FeaturesClientState][139]
    *   [Properties][140]
*   [InstanceFeatureState][141]
    *   [Properties][142]
*   [collectFeatures][143]
    *   [Parameters][144]
*   [featureStateFromCustomObject][145]
    *   [Parameters][146]
*   [getInstanceFeatureState][147]
    *   [Parameters][148]
*   [boostrapFeatures][149]
    *   [Parameters][150]
*   [updateFeatureState][151]
    *   [Parameters][152]
*   [FeatureHelpers][153]
*   [FeatureScriptArguments][154]
    *   [Properties][155]
*   [deployFeature][156]
    *   [Parameters][157]
*   [removeFeature][158]
    *   [Parameters][159]
*   [waitForJob][160]
    *   [Parameters][161]
*   [JobExecutionParameter][162]
    *   [Properties][163]
*   [JobExecution][164]
    *   [Properties][165]
*   [executeJob][166]
    *   [Parameters][167]
*   [siteArchiveImport][168]
    *   [Parameters][169]
*   [ExportSitesConfiguration][170]
    *   [Properties][171]
*   [ExportGlobalDataConfiguration][172]
    *   [Properties][173]
*   [ExportDataUnitsConfiguration][174]
    *   [Properties][175]
*   [siteArchiveExport][176]
    *   [Parameters][177]
*   [siteArchiveExportJSON][178]
    *   [Parameters][179]
*   [siteArchiveImportJSON][180]
    *   [Parameters][181]
*   [siteArchiveExportText][182]
    *   [Parameters][183]
*   [siteArchiveImportText][184]
    *   [Parameters][185]
*   [ResourceDocument][186]
    *   [Properties][187]
*   [permissionValidatorCallback][188]
*   [compareResourceDocuments][189]
    *   [Parameters][190]
*   [ensureDataAPIPermissions][191]
    *   [Parameters][192]
*   [current][193]
*   [PermissionDocument][194]
    *   [Properties][195]
*   [comparePermissionDocuments][196]
    *   [Parameters][197]
*   [ensureWebDAVPermissions][198]
    *   [Parameters][199]
*   [sleep][200]
    *   [Parameters][201]
*   [CartridgeMapping][202]
    *   [Properties][203]
*   [findCartridges][204]
    *   [Parameters][205]
*   [reloadCodeVersion][206]
    *   [Parameters][207]
*   [syncCartridges][208]
    *   [Parameters][209]
*   [downloadCodeVersion][210]
    *   [Parameters][211]
*   [GlobalConfig][212]
*   [Site][213]
    *   [Properties][214]
*   [CodeVersion][215]
    *   [Properties][216]
*   [InstanceInformationResult][217]
    *   [Properties][218]
*   [InstanceInformationOptions][219]
    *   [Properties][220]
*   [Preferences][221]
    *   [Properties][222]
*   [GlobalPreferences][223]
    *   [Properties][224]
*   [InstancePreferenceInfo][225]
    *   [Properties][226]
*   [getInstancePreferenceInfo][227]
    *   [Parameters][228]
*   [getInstanceInfo][229]
    *   [Parameters][230]

## runAsScript

[lib/config.js:394-421][231]

Run's the current nodejs main module (i.e. entry point) as a migration

Returns **[Promise][232]\<void>**

## parseConfig

[lib/config.js:432-455][233]

Parse the environment headlessly (i.e. not via CLI directly) to
return the parsed configuration

### Parameters

*   `argv`   (optional, default `""`)
*   `args` **([string][234] | [Array][235]<[string][234]>)** arguments in lieu of command line

Returns **[object][236]**

## decryptCredentials

[lib/intellij.js:35-41][237]

Decrypts the credentials blob; which should be in base64 encoding

This method is synchronous

### Parameters

*   `cipherText` **[string][234]** base64 string
*   `key` **[string][234]**

Returns **[string][234]** plaintext

## encryptCredentials

[lib/intellij.js:51-54][238]

Encrypt the given plaintext to a credentials blob

This method is synchronous

### Parameters

*   `plainText` **[string][234]**
*   `key` **[string][234]**

## convertDWJsonToIntellij

[lib/intellij.js:71-172][239]

converts a dwjson multi-config object (i.e. pre-2022.3 config) to a post-2022.3 config
and encrypted credentials file. Connections source is considered to be in .idea/misc.xml
and credentials file is passed in

Note: ALL dw.json passwords are assumed to be webdav access keys and will be inserted
into the credentials store as this is typical of SSO AM usage. Existing access keys will
NOT be updated (a warning will be printed).

Your intellij project should already be initialized (i.e. create a single connection)

### Parameters

*   `dwJson` **[object][236]**
*   `credentialsFilename` **[string][234]**
*   `key` **[string][234]**
*   `projectFile`

## getIntellijSFCCConnectionSettings

[lib/intellij.js:185-209][240]

Gets the currently encoded connections setting document from the IDEA
user project settings file.

NOTE: this uses fast-xml-parser internally as opposed to xml2js to allow sync use;
this is less robust than xml2js but fast and allows for usage in sync scenarios
like config loading

### Parameters

*   `filename` **[string][234]**

Returns **[object][236]**

## setIntellijSFCCConnectionSettings

[lib/intellij.js:221-237][241]

Writes a new connections setting object

NOTE: for compatibility this object should be a modified version of
the object read from the get function above

### Parameters

*   `filename` **[string][234]**
*   `obj` **[object][236]**

Returns **[Promise][232]\<void>**

## isStream

[lib/environment.js:50-54][242]

Is this object a stream?

### Parameters

*   `stream`

Returns **[boolean][243]**

## EnvironmentOpts

[lib/environment.js:163-518][244]

Type: [Object][236]

### Properties

*   `server` **[string][234]**
*   `secureServer` **[string][234]** optional hostname used for WebDAV access
*   `username` **[string][234]**
*   `password` **[string][234]**
*   `clientID` **[string][234]**
*   `clientSecret` **[string][234]**
*   `codeVersion` **[string][234]**
*   `shortCode` **[string][234]**
*   `verify` **[boolean][243]** verify SSL
*   `certificate` **[string][234]** pfx path
*   `passphrase` **[string][234]** passphrase for pfx above
*   `scopes` **[Array][235]<[string][234]>** authz scopes

## Environment

[lib/environment.js:163-518][245]

Provides for authentication and WebDAV/API access

`server` and `secureServer` represent ECOM (b2c) instances but an Environment can be used
in non-ECOM contexts (SCAPI, ODS, etc)

### Examples

```javascript
const {Environment} = require('@SalesforceCommerceCloud/b2c-tools');
const env = new Environment({
    server: '...',
    clientID: '...',
    clientSecret: '...'
});
const resp = await env.ocapi.get('sites');
```

### am

[lib/environment.js:228-243][246]

account manager (account.demandware.net) scoped Axios instance

Type: axios.AxiosInstance

### ocapi

[lib/environment.js:250-265][247]

OCAPI scoped Axios Client

Type: axios.AxiosInstance

### ods

[lib/environment.js:272-287][248]

ODS scoped Axios Client

Type: axios.AxiosInstance

### scapi

[lib/environment.js:294-313][249]

SCAPI scoped Axios Client

Type: axios.AxiosInstance

### webdav

[lib/environment.js:320-335][250]

WebDAV scoped Axios Client

Type: axios.AxiosInstance

### deauthenticate

[lib/environment.js:513-517][251]

Clear access token so auths are performed anew

Returns **[Promise][232]\<void>**

## AccessTokenResponse

[lib/environment.js:457-475][252]

Type: [Object][236]

### Properties

*   `accessToken` **[string][234]**
*   `expires` **[Date][253]**

## collectMigrations

[lib/migrations.js:42-52][254]

Find all migration directories and scripts; excluding those matching the given patterns

### Parameters

*   `dir`  {string}
*   `exclude`  {string\[]} (optional, default `[]`)

Returns **[Promise][232]<[Array][235]<[string][234]>>**

## MigrationHelpers

[lib/migrations.js:57-94][255]

## MigrationScriptArguments

[lib/migrations.js:204-236][256]

Type: [Object][236]

### Properties

*   `env` **[Environment][257]**
*   `logger` **winston.Logger**
*   `helpers` **[MigrationHelpers][258]**
*   `vars` **([object][236] | [undefined][259])**

## MigrationScriptCallback

[lib/migrations.js:204-236][260]

Type: [Function][261]

### Parameters

*   `args` **[MigrationScriptArguments][262]**

Returns **[Promise][232]<([boolean][243] | void)>**

## ToolkitClientState

[lib/migrations.js:204-236][263]

Type: [Object][236]

### Properties

*   `version` **[number][264]**

## ToolkitInstanceState

[lib/migrations.js:204-236][265]

Type: [Object][236]

### Properties

*   `version` **[number][264]**
*   `migrations` **[Array][235]<[string][234]>**
*   `clients` **[Object][236]<[string][234], [ToolkitClientState][266]>** map of client IDs that have been bootstrapped
*   `vars` **[object][236]**

## InitLifecycleFunction

[lib/migrations.js:204-236][267]

Type: [Function][261]

### Parameters

*   `args` **[MigrationScriptArguments][262]**

Returns **[Promise][232]\<void>**

## ShouldBootstrapLifecycleFunction

[lib/migrations.js:204-236][268]

Type: [Function][261]

### Parameters

*   `args` **[MigrationScriptArguments][262]**
*   `instanceState` **[ToolkitInstanceState][269]**

Returns **[Promise][232]<[boolean][243]>**

## OnBootstrapLifecycleFunction

[lib/migrations.js:204-236][270]

Type: [Function][261]

### Parameters

*   `args` **[MigrationScriptArguments][262]**
*   `instanceState` **[ToolkitInstanceState][269]**

Returns **[Promise][232]\<void>**

## BeforeAllLifecycleFunction

[lib/migrations.js:204-236][271]

Type: [Function][261]

### Parameters

*   `args` **[MigrationScriptArguments][262]**
*   `migrationsToRun` **[Array][235]<[string][234]>** list of migrations that will be run (mutable)
*   `willApply` **[boolean][243]** true if migrations will be applied to the instance
*   `dryRun` **[boolean][243]** true if dry run is requested

Returns **[Promise][232]\<void>**

## BeforeEachLifecycleFunction

[lib/migrations.js:204-236][272]

Type: [Function][261]

### Parameters

*   `args` **[MigrationScriptArguments][262]**
*   `migration` **[string][234]** migration to be run
*   `willApply` **[boolean][243]** true if migrations will be applied to the instance

Returns **[Promise][232]<[boolean][243]>** return false to skip the current migration

## AfterEachLifecycleFunction

[lib/migrations.js:204-236][273]

Type: [Function][261]

### Parameters

*   `args` **[MigrationScriptArguments][262]**
*   `migration` **[string][234]** migration to be run
*   `willApply` **[boolean][243]** true if migrations will be applied to the instance

Returns **[Promise][232]\<void>**

## AfterAllLifecycleFunction

[lib/migrations.js:204-236][274]

Type: [Function][261]

### Parameters

*   `args` **[MigrationScriptArguments][262]**
*   `migrationsRan` **[Array][235]<[string][234]>** list of migrations ran
*   `willApply` **[boolean][243]** true if migrations will be applied to the instance

Returns **[Promise][232]\<void>**

## OnFailureLifecycleFunction

[lib/migrations.js:204-236][275]

Type: [Function][261]

### Parameters

*   `args` **[MigrationScriptArguments][262]**
*   `migration` **[string][234]** migration to be run
*   `e` **[Error][276]** exception raised during migration run

Returns **[Promise][232]\<void>** re-raise exception or new exception to stop migration run

## MigrationLifecycleFunctions

[lib/migrations.js:204-236][277]

Type: [Object][236]

### Properties

*   `init` **([InitLifecycleFunction][278] | [undefined][259])**
*   `shouldBootstrap` **([ShouldBootstrapLifecycleFunction][279] | [undefined][259])**
*   `onBootstrap` **([OnBootstrapLifecycleFunction][280] | [undefined][259])**
*   `beforeAll` **([BeforeAllLifecycleFunction][281] | [undefined][259])**
*   `beforeEach` **([BeforeEachLifecycleFunction][282] | [undefined][259])**
*   `afterEach` **([AfterAllLifecycleFunction][283] | [undefined][259])**
*   `afterAll` **([AfterAllLifecycleFunction][283] | [undefined][259])**
*   `onFailure` **([OnFailureLifecycleFunction][284] | [undefined][259])**

## getInstanceState

[lib/migrations.js:204-236][285]

Get the instance state from global preferences

### Parameters

*   `env`  {Environment}

Returns **[Promise][232]<[ToolkitInstanceState][269]>**

## updateInstanceMetadata

[lib/migrations.js:245-327][286]

Imports the latest toolkit metadata

### Parameters

*   `env` **[Environment][257]**
*   `lifeCycleModule` **[MigrationLifecycleFunctions][287]**
*   `vars`

Returns **[Promise][232]\<void>**

## updateInstanceMigrations

[lib/migrations.js:335-349][288]

Updates instance with new migrations set

### Parameters

*   `env`  {Environment}
*   `migrations`  {string\[]}

Returns **[Promise][232]\<void>**

## isBootstrapRequired

[lib/migrations.js:357-366][289]

Determines if bootstrap/upgrade is required

### Parameters

*   `env` **[Environment][257]**
*   `instanceState` **[ToolkitInstanceState][269]**

Returns **[boolean][243]**

## isBootstrapRequired

[lib/features.js:296-305][290]

Determines if bootstrap/upgrade is required

### Parameters

*   `env` **[Environment][257]**
*   `instanceState` **[InstanceFeatureState][291]**

Returns **[boolean][243]**

## migrateInstance

[lib/migrations.js:383-526][292]

Inspects an instance and executes site impex imports and "migration scripts" from the
given `dir`.

### Parameters

*   `env` **[Environment][257]**
*   `dir` **[string][234]** migrations directory
*   `options` **[object][236]** options

    *   `options.exclude` **[Array][235]<[string][234]>** array of regular expression strings (optional, default `[]`)
    *   `options.apply` **[boolean][243]** should migrations be applied to the instance after running? (optional, default `true`)
    *   `options.dryRun` **[boolean][243]** only output migrations to be run (optional, default `false`)
    *   `options.forceBootstrap` **[boolean][243]**  (optional, default `false`)
    *   `options.allowBootstrap` **[boolean][243]**  (optional, default `true`)
    *   `options.vars` **[object][236]**  (optional, default `{}`)

Returns **[Promise][232]\<void>**

## lifeCycleModule

[lib/migrations.js:402-402][293]

## runMigrationScript

[lib/migrations.js:536-561][294]

### Parameters

*   `env` **[Environment][257]**
*   `target` **[string][234]** path to migration script
*   `options` **[object][236]**

    *   `options.vars` **[object][236]**  (optional, default `{}`)

Returns **[Promise][232]<[boolean][243]>**

## runMigrationScriptText

[lib/migrations.js:572-600][295]

Execute a migration script provided as a string (i.e. from a heredoc)

### Parameters

*   `env` **[Environment][257]**
*   `scriptText` **[string][234]**
*   `options` **[object][236]**

    *   `options.vars` **[object][236]**  (optional, default `{}`)

Returns **[Promise][232]\<void>**

## uploadArchive

[lib/webdav.js:32-84][296]

Higher level helpers for WebDAV uploading of multiple files.
Supports regular files, zip Files, directories or Buffers with automatic extraction.

Directories are added recursively to the root of the archive (i.e. without given
directory name)

### Parameters

*   `env` **[Environment][257]**
*   `target` **([string][234] | [Buffer][297])** file, directory or zip buffer
*   `uploadPath` **[string][234]** target directory related to webdav root
*   `options` **[object][236]**  (optional, default `{}`)

    *   `options.extract` **[boolean][243]**  (optional, default `true`)
    *   `options.keepArchive` **[boolean][243]** if zip and true leave on server (optional, default `false`)
    *   `options.archiveName` **[boolean][243]** required if a buffer is provided

Returns **[Promise][232]<[string][234]>** the filename of the uploaded file/archive

## uploadArchiveText

[lib/webdav.js:98-117][298]

Import a zip file created from a mapping of filenames to text strings

### Parameters

*   `env` **[Environment][257]**
*   `data` **[Map][299]<[string][234], [string][234]>** map of filenames to text data to archive
*   `uploadPath` **[string][234]** target directory related to webdav root
*   `options` **[object][236]**

    *   `options.extract` **[boolean][243]** should we extract the file
    *   `options.keepArchive` **[boolean][243]** if zip and true leave on server
    *   `options.archiveName` **[boolean][243]** required if a buffer is provided

Returns **[Promise][232]<[string][234]>** the filename of the uploaded archive

## LibraryNode

[lib/page-designer.js:34-98][300]

Represents a library tree (JSONifiable)

Type: [object][236]

### Properties

*   `ID` **[string][234]** identifier
*   `type` **(`"LIBRARY"` | `"PAGE"` | `"CONTENT"` | `"COMPONENT"` | `"STATIC"`)** node type
*   `typeID` **[string][234]** page/component type
*   `data` **[object][236]** component data if COMPONENT type
*   `children` **[Array][235]<[LibraryNode][301]>** child nodes
*   `xml` **[object][236]** underlying xmljs structure
*   `hidden` **[boolean][243]** is this node hidden

## processContent

[lib/page-designer.js:34-98][302]

Recursively process a <content> to extract child components and images to a
LibraryNode

### Parameters

*   `content` **[object][236]** jsonified version of <content> via xml2js
*   `allContent` **[object][236]** all content in library
*   `assetQuery` **[Array][235]<[string][234]>** asset query to find static assets

Returns **[LibraryNode][301]** tree for this content and all children

## node

[lib/page-designer.js:41-49][303]

Type: [LibraryNode][301]

## FilterCallback

[lib/page-designer.js:118-118][304]

Type: [Function][261]

### Parameters

*   `node` **[LibraryNode][301]**

Returns **[boolean][243]**

## TraverseCallback

[lib/page-designer.js:118-118][305]

Type: [Function][261]

### Parameters

*   `node` **[LibraryNode][301]**

Returns **void**

## LibraryExport

[lib/page-designer.js:118-118][306]

Provides an export of

Type: [object][236]

### Properties

*   `XML` **[string][234]** processed library XML
*   `tree` **[LibraryNode][301]** tree structure of library exported

## Library

[lib/page-designer.js:125-311][307]

Provides an interface to manipulating content libraries

### traverse

[lib/page-designer.js:212-230][308]

Traverse (depth-first) the library tree

#### Parameters

*   `callback` **[TraverseCallback][309]**
*   `options` **[object][236]**  (optional, default `{}`)

    *   `options.traverseHidden` **[boolean][243]** traverse through hidden nodes (optional, default `true`)
    *   `options.callbackHidden` **[boolean][243]** execute callback for hidden nodes (optional, default `false`)

Returns **[Library][310]**

### reset

[lib/page-designer.js:236-241][311]

Reset tree visibility state

Returns **[Library][310]**

### filter

[lib/page-designer.js:251-262][312]

Filter this library. Callback should return true if the node should be included

#### Parameters

*   `callback` **[FilterCallback][313]**
*   `options` **[object][236]**  (optional, default `{}`)

    *   `options.recursive` **[boolean][243]** filter recursively (depth-first) (optional, default `false`)

Returns **[Library][310]**

### toXMLString

[lib/page-designer.js:271-286][314]

Returns this Library as an importable XML

#### Parameters

*   `options` **[object][236]**  (optional, default `{}`)

    *   `options.traverseHidden` **[boolean][243]** traverse through hidden nodes (optional, default `true`)

Returns **[string][234]** library XML

### outputLibraryTree

[lib/page-designer.js:299-310][315]

Output's the page designer tree structure to the given logger

#### Parameters

*   `logger` **winston.Logger**  (optional, default `{}`)

    *   `logger.traverseHidden`   (optional, default `false`)
*   `logger` **winston.Logger**  (optional, default `{}`)

    *   `logger.traverseHidden`   (optional, default `false`)
*   `tree` **[LibraryNode][301]**

Returns **void**

### parse

[lib/page-designer.js:144-201][316]

Parse the given library XML

#### Parameters

*   `libraryXML` **[string][234]** plain text XML of a library
*   `options` **[object][236]** options (optional, default `{}`)

    *   `options.assetQuery` **[Array][235]<[string][234]>** list of object paths to find static assets (optional, default `['image.path']`)
    *   `options.keepOrphans` **[boolean][243]** keep orphan components (optional, default `false`)

Returns **[Promise][232]<[Library][310]>**

## Library

[lib/info.js:95-107][317]

Type: [object][236]

### Properties

*   `id` **[string][234]**
*   `isSiteLibrary` **[boolean][243]**
*   `sites` **[Array][235]<[string][234]>**

### traverse

[lib/page-designer.js:212-230][308]

Traverse (depth-first) the library tree

#### Parameters

*   `callback` **[TraverseCallback][309]**
*   `options` **[object][236]**  (optional, default `{}`)

    *   `options.traverseHidden` **[boolean][243]** traverse through hidden nodes (optional, default `true`)
    *   `options.callbackHidden` **[boolean][243]** execute callback for hidden nodes (optional, default `false`)

Returns **[Library][310]**

### reset

[lib/page-designer.js:236-241][311]

Reset tree visibility state

Returns **[Library][310]**

### filter

[lib/page-designer.js:251-262][312]

Filter this library. Callback should return true if the node should be included

#### Parameters

*   `callback` **[FilterCallback][313]**
*   `options` **[object][236]**  (optional, default `{}`)

    *   `options.recursive` **[boolean][243]** filter recursively (depth-first) (optional, default `false`)

Returns **[Library][310]**

### toXMLString

[lib/page-designer.js:271-286][314]

Returns this Library as an importable XML

#### Parameters

*   `options` **[object][236]**  (optional, default `{}`)

    *   `options.traverseHidden` **[boolean][243]** traverse through hidden nodes (optional, default `true`)

Returns **[string][234]** library XML

### outputLibraryTree

[lib/page-designer.js:299-310][315]

Output's the page designer tree structure to the given logger

#### Parameters

*   `logger` **winston.Logger**  (optional, default `{}`)

    *   `logger.traverseHidden`   (optional, default `false`)
*   `logger` **winston.Logger**  (optional, default `{}`)

    *   `logger.traverseHidden`   (optional, default `false`)
*   `tree` **[LibraryNode][301]**

Returns **void**

### parse

[lib/page-designer.js:144-201][316]

Parse the given library XML

#### Parameters

*   `libraryXML` **[string][234]** plain text XML of a library
*   `options` **[object][236]** options (optional, default `{}`)

    *   `options.assetQuery` **[Array][235]<[string][234]>** list of object paths to find static assets (optional, default `['image.path']`)
    *   `options.keepOrphans` **[boolean][243]** keep orphan components (optional, default `false`)

Returns **[Promise][232]<[Library][310]>**

## root

[lib/page-designer.js:157-165][318]

Type: [LibraryNode][301]

## exportPagesToFolder

[lib/page-designer.js:325-416][319]

Exports page(s) from page designer to an extracted impex folder, downloading
static assets (images, etc) using an object query path(s)

### Parameters

*   `pages` **([Array][235]<[string][234]> | [Array][235]<[RegExp][320]>)** list of page IDs to export
*   `library` **[string][234]** library ID (or site id if isSite is true)
*   `outputPath` **[string][234]** output path to save extracted library to
*   `options` **[object][236]** options

    *   `options.isSite` **[boolean][243]** is this a site library? (optional, default `false`)
    *   `options.assetQuery` **[Array][235]<[string][234]>** list of object paths to find static assets to download (optional, default `['image.path']`)
    *   `options.libraryFile`   (optional, default `null`)
    *   `options.offline`   (optional, default `false`)

Returns **[Promise][232]\<void>**

## CollectionLists

[lib/command-export.js:29-97][321]

Type: [Object][236]

### Properties

*   `sites` **[Array][235]<[string][234]>**
*   `inventoryLists` **[Array][235]<[string][234]>**
*   `catalogs` **[Array][235]<[string][234]>**
*   `libraries` **[Array][235]<[string][234]>**

## getCollectionsFromInstance

[lib/command-export.js:29-97][322]

Retrieves list of catalogs, inventory lists, sites and libraries for interactive display

### Parameters

*   `env`  {Environment}

Returns **[Promise][232]<[CollectionLists][323]>**

## getDataUnitsFromWeb

[lib/command-export.js:106-191][324]

Launch a web page to collect data units to export

### Parameters

*   `env`  {Environment}
*   `collections`  {CollectionLists}

Returns **[Promise][232]<[object][236]>**

## getDataUnitsFromArgument

[lib/command-export.js:199-208][325]

Use the -d (dataunits) argument value to use data units to export

### Parameters

*   `dataUnitsParam`  {String}

Returns **[Promise][232]<[object][236]>**

## configNameFromHostname

[lib/command-instance.js:20-23][326]

### Parameters

*   `hostname` **[string][234]**

## LogFile

[lib/command-tail.js:19-42][327]

Type: [Object][236]

### Properties

*   `name` **[string][234]**
*   `lastModified` **[Date][253]**

## getLogs

[lib/command-tail.js:19-42][328]

Get the logs from the instance

### Parameters

*   `env`  {Environment}

Returns **[Promise][232]<[Array][235]<[LogFile][329]>>**

## tailCommand

[lib/command-tail.js:49-104][330]

### Parameters

*   `filters`  {string\[]}

Returns **[Promise][232]\<void>**

## Question

[lib/features.js:50-50][331]

These are question objects from the inquirer module. We're only interested in the name

Type: [Object][236]

### Properties

*   `name` **[string][234]**

## Feature

[lib/features.js:50-50][332]

Type: [Object][236]

### Properties

*   `featureName` **[string][234]**
*   `requires` **[Array][235]<[string][234]>**
*   `defaultVars` **[object][236]**
*   `secretVars` **[Array][235]<[string][234]>**
*   `questions` **([function][261] | [Array][235]<[Question][333]>)**
*   `excludeMigrations` **[Array][235]<[string][234]>**
*   `excludeCartridges` **[Array][235]<[string][234]>**
*   `remove` **[function][261]**
*   `finish` **[function][261]**
*   `path` **[string][234]**

## FeatureState

[lib/features.js:50-50][334]

Type: [Object][236]

### Properties

*   `featureName` **[string][234]**
*   `vars` **[object][236]**
*   `creationDate` **[Date][253]**
*   `lastModified` **[Date][253]**

## FeaturesClientState

[lib/features.js:50-50][335]

Type: [Object][236]

### Properties

*   `version` **[number][264]**

## InstanceFeatureState

[lib/features.js:50-50][336]

Type: [Object][236]

### Properties

*   `b2cToolsFeaturesVersion` **[number][264]**
*   `b2cToolsFeaturesBootstrappedClientIDs` **[Object][236]<[string][234], [FeaturesClientState][337]>**
*   `features` **[Array][235]<[FeatureState][338]>**

## collectFeatures

[lib/features.js:57-72][339]

### Parameters

*   `dir`

Returns **[Promise][232]<[Array][235]<[Feature][340]>>**

## featureStateFromCustomObject

[lib/features.js:78-93][341]

### Parameters

*   `obj` **[Object][236]**

Returns **[FeatureState][338]**

## getInstanceFeatureState

[lib/features.js:101-137][342]

Get the current state of features

### Parameters

*   `env` **[Environment][257]**

Returns **[Promise][232]<([InstanceFeatureState][291] | null)>** returns null if instance feature state is blocked

## boostrapFeatures

[lib/features.js:146-238][343]

Boostrap feature functionality (access and custom object)
or update to latest

### Parameters

*   `env` **[Environment][257]**

Returns **[Promise][232]\<void>**

## updateFeatureState

[lib/features.js:250-288][344]

Updates feature state on instance

### Parameters

*   `env` **[Environment][257]**
*   `featureName` **[string][234]**
*   `vars` **[object][236]**
*   `secretVars` **[Array][235]<[string][234]>**
*   `saveSecrets` **[boolean][243]**

Returns **[Promise][232]\<void>**

## FeatureHelpers

[lib/features.js:310-315][345]

## FeatureScriptArguments

[lib/features.js:335-443][346]

Type: [object][236]

### Properties

*   `featureHelpers` **[FeatureHelpers][347]**
*   `featuresDir` **[string][234]** directory of current features
*   `saveSecrets` **[boolean][243]** persist secrets to instance
*   `instanceState` **[InstanceFeatureState][291]**

## deployFeature

[lib/features.js:335-443][348]

### Parameters

*   `env` **[Environment][257]**
*   `featureName` **[string][234]**
*   `options` **[object][236]**  (optional, default `{}`)

    *   `options.featuresDir` **[string][234]**
    *   `options.vars` **[object][236]**  (optional, default `{}`)
    *   `options.saveSecrets` **[boolean][243]**  (optional, default `true`)

Returns **[Promise][232]\<void>**

## removeFeature

[lib/features.js:454-491][349]

Remove a feature

### Parameters

*   `env` **[Environment][257]**
*   `featureName` **[string][234]**
*   `$2` **[Object][236]**

    *   `$2.featuresDir`
    *   `$2.vars`   (optional, default `{}`)
*   `featuresDir`
*   `vars`

Returns **[Promise][232]\<void>**

## waitForJob

[lib/jobs.js:23-54][350]

### Parameters

*   `env` **[Environment][257]**
*   `jobId` **[string][234]** job identifier
*   `executionId` **[string][234]** job execution id

Returns **[Promise][232]\<void>**

## JobExecutionParameter

[lib/jobs.js:78-119][351]

Type: [Object][236]

### Properties

*   `name` **[string][234]**
*   `value` **[string][234]**

## JobExecution

[lib/jobs.js:78-119][352]

Type: [Object][236]

### Properties

*   `id` **[string][234]**
*   `job_id` **[string][234]**
*   `status` **[string][234]**

## executeJob

[lib/jobs.js:78-119][353]

### Parameters

*   `env` **[Environment][257]**
*   `jobId` **[string][234]** job identifier
*   `parameters` **[Array][235]<[JobExecutionParameter][354]>**  (optional, default `[]`)
*   `$3` **[Object][236]**  (optional, default `{}`)

    *   `$3.waitForRunningJobs`   (optional, default `true`)
*   `options` **[object][236]**
*   `waitForRunningJobs` **[boolean][243]** wait for running executions to finish (Default true)

Returns **[Promise][232]<[JobExecution][355]>**

## siteArchiveImport

[lib/jobs.js:131-181][356]

Import a site impex

### Parameters

*   `env` **[Environment][257]**
*   `target` **([string][234] | [Buffer][297])** directory, zip file path or buffer of zip content
*   `options` **[object][236]**  (optional, default `{}`)

    *   `options.archiveName` **[string][234]?** required if Buffer is used
    *   `options.keepArchive` **[boolean][243]?** if true, keep archive on isntance

Returns **[Promise][232]\<void>**

## ExportSitesConfiguration

[lib/jobs.js:265-283][357]

Type: [Object][236]

### Properties

*   `ab_tests` **([undefined][259] | [boolean][243])**
*   `active_data_feeds` **([undefined][259] | [boolean][243])**
*   `all` **([undefined][259] | [boolean][243])**
*   `cache_settings` **([undefined][259] | [boolean][243])**
*   `campaigns_and_promotions` **([undefined][259] | [boolean][243])**
*   `content` **([undefined][259] | [boolean][243])**
*   `coupons` **([undefined][259] | [boolean][243])**
*   `custom_objects` **([undefined][259] | [boolean][243])**
*   `customer_cdn_settings` **([undefined][259] | [boolean][243])**
*   `customer_groups` **([undefined][259] | [boolean][243])**
*   `distributed_commerce_extensions` **([undefined][259] | [boolean][243])**
*   `dynamic_file_resources` **([undefined][259] | [boolean][243])**
*   `gift_certificates` **([undefined][259] | [boolean][243])**
*   `ocapi_settings` **([undefined][259] | [boolean][243])**
*   `payment_methods` **([undefined][259] | [boolean][243])**
*   `payment_processors` **([undefined][259] | [boolean][243])**
*   `redirect_urls` **([undefined][259] | [boolean][243])**
*   `search_settings` **([undefined][259] | [boolean][243])**
*   `shipping` **([undefined][259] | [boolean][243])**
*   `site_descriptor` **([undefined][259] | [boolean][243])**
*   `site_preferences` **([undefined][259] | [boolean][243])**
*   `sitemap_settings` **([undefined][259] | [boolean][243])**
*   `slots` **([undefined][259] | [boolean][243])**
*   `sorting_rules` **([undefined][259] | [boolean][243])**
*   `source_codes` **([undefined][259] | [boolean][243])**
*   `static_dynamic_alias_mappings` **([undefined][259] | [boolean][243])**
*   `stores` **([undefined][259] | [boolean][243])**
*   `tax` **([undefined][259] | [boolean][243])**
*   `url_rules` **([undefined][259] | [boolean][243])**

## ExportGlobalDataConfiguration

[lib/jobs.js:265-283][358]

Type: [Object][236]

### Properties

*   `access_roles` **([undefined][259] | [boolean][243])**
*   `all` **([undefined][259] | [boolean][243])**
*   `csc_settings` **([undefined][259] | [boolean][243])**
*   `csrf_whitelists` **([undefined][259] | [boolean][243])**
*   `custom_preference_groups` **([undefined][259] | [boolean][243])**
*   `custom_quota_settings` **([undefined][259] | [boolean][243])**
*   `custom_types` **([undefined][259] | [boolean][243])**
*   `geolocations` **([undefined][259] | [boolean][243])**
*   `global_custom_objects` **([undefined][259] | [boolean][243])**
*   `job_schedules` **([undefined][259] | [boolean][243])**
*   `job_schedules_deprecated` **([undefined][259] | [boolean][243])**
*   `locales` **([undefined][259] | [boolean][243])**
*   `meta_data` **([undefined][259] | [boolean][243])**
*   `oauth_providers` **([undefined][259] | [boolean][243])**
*   `ocapi_settings` **([undefined][259] | [boolean][243])**
*   `page_meta_tags` **([undefined][259] | [boolean][243])**
*   `preferences` **([undefined][259] | [boolean][243])**
*   `price_adjustment_limits` **([undefined][259] | [boolean][243])**
*   `services` **([undefined][259] | [boolean][243])**
*   `sorting_rules` **([undefined][259] | [boolean][243])**
*   `static_resources` **([undefined][259] | [boolean][243])**
*   `system_type_definitions` **([undefined][259] | [boolean][243])**
*   `users` **([undefined][259] | [boolean][243])**
*   `webdav_client_permissions` **([undefined][259] | [boolean][243])**

## ExportDataUnitsConfiguration

[lib/jobs.js:265-283][359]

Type: [Object][236]

### Properties

*   `catalog_static_resources` **([undefined][259] | [Object][236]<[string][234], [boolean][243]>)**
*   `catalogs` **([undefined][259] | [Object][236]<[string][234], [boolean][243]>)**
*   `customer_lists` **([undefined][259] | [Object][236]<[string][234], [boolean][243]>)**
*   `inventory_lists` **([undefined][259] | [Object][236]<[string][234], [boolean][243]>)**
*   `library_static_resources` **([undefined][259] | [Object][236]<[string][234], [boolean][243]>)**
*   `libraries` **([undefined][259] | [Object][236]<[string][234], [boolean][243]>)**
*   `price_books` **([undefined][259] | [Object][236]<[string][234], [boolean][243]>)**
*   `sites` **([undefined][259] | [Object][236]<[string][234], [ExportSitesConfiguration][360]>)**
*   `global_data` **([undefined][259] | [ExportGlobalDataConfiguration][361])**

## siteArchiveExport

[lib/jobs.js:265-283][362]

Export the given site archive, returning the zip data

### Parameters

*   `env` **[Environment][257]**
*   `dataUnits` **[ExportDataUnitsConfiguration][363]**
*   `zipFilename` **[string][234]** filename of the export

Returns **[Promise][232]<[Buffer][297]>**

## siteArchiveExportJSON

[lib/jobs.js:299-313][364]

Export an object of impex files to JSON objects in xml2js form

returns:
{
"meta/system-objecttype-extensions.xml": {
...
}
}

### Parameters

*   `env` **[Environment][257]**
*   `dataUnits` **[ExportDataUnitsConfiguration][363]**

Returns **[Promise][232]<[Map][299]<[string][234], [object][236]>>**

## siteArchiveImportJSON

[lib/jobs.js:322-345][365]

Imports an object of impex filenames to objects to XML/JSON/text

### Parameters

*   `env` **[Environment][257]**
*   `data` **[Map][299]<[string][234], [object][236]>**

Returns **[Promise][232]\<void>**

## siteArchiveExportText

[lib/jobs.js:359-376][366]

Export an object of impex files to strings of XML

returns:
{
"meta/system-objecttype-extensions.xml": "\<?xml version="1.0"...."
}

### Parameters

*   `env` **[Environment][257]**
*   `dataUnits` **[ExportDataUnitsConfiguration][363]**

Returns **[Promise][232]<[Map][299]<[string][234], [string][234]>>**

## siteArchiveImportText

[lib/jobs.js:385-400][367]

Import filename to text strings as site impex

### Parameters

*   `env` **[Environment][257]**
*   `data` **[Map][299]<[string][234], [string][234]>**

Returns **[Promise][232]\<void>**

## ResourceDocument

[lib/jobs.js:423-430][368]

Type: [Object][236]

### Properties

*   `resource_id` **[string][234]**
*   `cache_time` **[number][264]**
*   `methods` **[Array][235]<[string][234]>**
*   `read_attributes` **[string][234]**
*   `write_attributes` **[string][234]**

## permissionValidatorCallback

[lib/jobs.js:423-430][369]

This callback is displayed as part of the Requester class.

Type: [Function][261]

Returns **[boolean][243]** true if permission is validated

## compareResourceDocuments

[lib/jobs.js:423-430][370]

### Parameters

*   `current` **[ResourceDocument][371]**
*   `wanted` **[ResourceDocument][371]**

Returns **[boolean][243]** true if the documents are equal or if the current is a superset

## ensureDataAPIPermissions

[lib/jobs.js:451-526][372]

Ensures the environment has access to the given DATA API resources by adding or updating
Resource Documents for the client ID.

If changes are made `validator` will be called asynchronously until it returns true

Note: this method only trivially compares resource identifiers, methods and read/write attributes. If all
values are equal to the instance's state the resource will not be updated.

Pass {clientID: '...'} to the options to use an arbitrary client ID rather than the current environment

### Parameters

*   `env` **[Environment][257]**
*   `resources` **[Array][235]<[ResourceDocument][371]>** array of resources to add/update (optional, default `[]`)
*   `validator` **[permissionValidatorCallback][373]** array of resources to add/update
*   `options` **[object][236]**  (optional, default `{maximumChecks:60}`)

    *   `options.maximumChecks` **[number][264]?** maximum number of permission checks
    *   `options.clientID` **[number][264]?** set permissions for this client id (Default: environments)

Returns **[Promise][232]\<void>**

## current

[lib/jobs.js:489-489][374]

Type: [ResourceDocument][371]

## PermissionDocument

[lib/jobs.js:539-544][375]

Type: [Object][236]

### Properties

*   `path` **[string][234]**
*   `operations` **[Array][235]<[string][234]>**

## comparePermissionDocuments

[lib/jobs.js:539-544][376]

### Parameters

*   `a` **[PermissionDocument][377]**
*   `b` **[PermissionDocument][377]**

Returns **[boolean][243]** true if the documents are trivially equal

## ensureWebDAVPermissions

[lib/jobs.js:563-624][378]

Ensures the environment has access to the given WEBDAV resources by adding or updating
Resource Documents for the client ID.

If changes are made `validator` will be called asynchronously until it returns true

Note: this method only trivially compares resource identifiers, methods and read/write attributes. If all
values are equal to the instance's state the resource will not be updated.

### Parameters

*   `env` **[Environment][257]**
*   `permissions` **[Array][235]<[PermissionDocument][377]>** array of permissions to add/update (optional, default `[]`)
*   `validator` **[permissionValidatorCallback][373]** array of resources to add/update
*   `options` **[object][236]**  (optional, default `{maximumChecks:60}`)

    *   `options.maximumChecks` **[number][264]?** maximum number of permission checks
    *   `options.clientID` **[number][264]?** set permissions for this client id (Default: environments)

Returns **[Promise][232]\<void>**

## sleep

[lib/util.js:7-9][379]

Sleep for ms milliseconds

### Parameters

*   `ms`  {number} milliseconds

Returns **[Promise][232]\<void>**

## CartridgeMapping

[lib/code.js:20-38][380]

Type: [Object][236]

### Properties

*   `dest` **[string][234]** cartridge name
*   `src` **[string][234]** directory

## findCartridges

[lib/code.js:20-38][381]

Find Cartridges recursively in the working directory

### Parameters

*   `directory` **[string][234]?** directory search for cartridges

Returns **[Array][235]<[CartridgeMapping][382]>**

## reloadCodeVersion

[lib/code.js:46-64][383]

Reloads (or activates) the environments code version

### Parameters

*   `env` **[Environment][257]**

Returns **[Promise][232]\<void>**

## syncCartridges

[lib/code.js:76-124][384]

Syncs the given cartridge mapping (src:dest) to the environments code version

### Parameters

*   `env` **[Environment][257]**
*   `cartridges` **[Array][235]<[CartridgeMapping][382]>**
*   `reload` **[boolean][243]**  (optional, default `false`)
*   `options` **[Object][236]**  (optional, default `{}`)

    *   `options.cleanCartridges` **[boolean][243]**

Returns **[Promise][232]\<void>**

## downloadCodeVersion

[lib/code.js:132-145][385]

Downloads the code version as a zipped archive

### Parameters

*   `env` **[Environment][257]**

Returns **[Promise][232]<[Buffer][297]>**

## GlobalConfig

[lib/global-config.js:9-13][386]

Internal global configuration
This should be limited to "aspect" type configuration available in library form as well as CLI
to avoid drilling parameters into subcommands/methods

## Site

[lib/info.js:95-107][387]

Type: [object][236]

### Properties

*   `id` **[string][234]**
*   `cartridges` **[Array][235]<[string][234]>**
*   `preferences` **[Preferences][388]**

## CodeVersion

[lib/info.js:95-107][389]

Type: [object][236]

### Properties

*   `id` **[string][234]**
*   `compatibilityMode` **[string][234]**
*   `cartridges` **[Array][235]<[string][234]>**
*   `active` **[boolean][243]**

## InstanceInformationResult

[lib/info.js:95-107][390]

Type: [object][236]

### Properties

*   `codeVersions` **[Array][235]<[CodeVersion][391]>**
*   `sites` **[Array][235]<[Site][392]>**
*   `libraries` **[Array][235]<[Library][310]>**
*   `preferences` **[Object][236]<[string][234], [Preferences][388]>**
*   `global` **[GlobalPreferences][393]**

## InstanceInformationOptions

[lib/info.js:95-107][394]

Type: [object][236]

### Properties

*   `codeVersions` **[boolean][243]**
*   `sites` **[boolean][243]**
*   `libraries` **[boolean][243]**
*   `locales` **[boolean][243]**
*   `currencies` **[boolean][243]**
*   `global` **[boolean][243]**
*   `preferences` **[boolean][243]**
*   `customPreferences` **[Array][235]<[string][234]>**

## Preferences

[lib/info.js:95-107][395]

Type: [object][236]

### Properties

*   `catalog` **[string][234]** storefront catalog ID
*   `customerList` **[string][234]**
*   `inventoryList` **[string][234]**
*   `timezone` **[string][234]**
*   `library` **[string][234]**
*   `priceBooks` **[Array][235]<[string][234]>**
*   `currencies` **[Array][235]<[string][234]>**
*   `locales` **[Array][235]<[string][234]>**
*   `defaultLocale` **[string][234]**
*   `defaultCurrency` **[string][234]**

## GlobalPreferences

[lib/info.js:95-107][396]

Type: [object][236]

### Properties

*   `cartridges` **[Array][235]<[string][234]>**
*   `timezone` **[string][234]**

## InstancePreferenceInfo

[lib/info.js:95-107][397]

Type: [object][236]

### Properties

*   `libraries` **[Array][235]<[Library][310]>**
*   `globalPreferences` **[GlobalPreferences][393]**
*   `sitePreferences` **[Object][236]<[string][234], [Preferences][388]>** site ID to preferences

## getInstancePreferenceInfo

[lib/info.js:160-237][398]

Get useful site and global information

### Parameters

*   `env` **[Environment][257]**
*   `options` **[object][236]**  (optional, default `{customPreferences:[]}`)

    *   `options.customPreferences` **[Array][235]<[string][234]>** list of custom preferences to retrieve

Returns **[Promise][232]<[InstancePreferenceInfo][399]>**

## getInstanceInfo

[lib/info.js:246-316][400]

Query various information from instance

### Parameters

*   `env` **[Environment][257]**
*   `infoOptions`   (optional, default `{codeVersions:true,sites:true,libraries:true,global:true,preferences:true,customPreferences:[]}`)
*   `dict` **[InstanceInformationOptions][401]** of booleans for information to query

Returns **[Promise][232]<[InstanceInformationResult][402]>**

[1]: #runasscript

[2]: #parseconfig

[3]: #parameters

[4]: #decryptcredentials

[5]: #parameters-1

[6]: #encryptcredentials

[7]: #parameters-2

[8]: #convertdwjsontointellij

[9]: #parameters-3

[10]: #getintellijsfccconnectionsettings

[11]: #parameters-4

[12]: #setintellijsfccconnectionsettings

[13]: #parameters-5

[14]: #isstream

[15]: #parameters-6

[16]: #environmentopts

[17]: #properties

[18]: #environment

[19]: #examples

[20]: #am

[21]: #ocapi

[22]: #ods

[23]: #scapi

[24]: #webdav

[25]: #deauthenticate

[26]: #accesstokenresponse

[27]: #properties-1

[28]: #collectmigrations

[29]: #parameters-7

[30]: #migrationhelpers

[31]: #migrationscriptarguments

[32]: #properties-2

[33]: #migrationscriptcallback

[34]: #parameters-8

[35]: #toolkitclientstate

[36]: #properties-3

[37]: #toolkitinstancestate

[38]: #properties-4

[39]: #initlifecyclefunction

[40]: #parameters-9

[41]: #shouldbootstraplifecyclefunction

[42]: #parameters-10

[43]: #onbootstraplifecyclefunction

[44]: #parameters-11

[45]: #beforealllifecyclefunction

[46]: #parameters-12

[47]: #beforeeachlifecyclefunction

[48]: #parameters-13

[49]: #aftereachlifecyclefunction

[50]: #parameters-14

[51]: #afteralllifecyclefunction

[52]: #parameters-15

[53]: #onfailurelifecyclefunction

[54]: #parameters-16

[55]: #migrationlifecyclefunctions

[56]: #properties-5

[57]: #getinstancestate

[58]: #parameters-17

[59]: #updateinstancemetadata

[60]: #parameters-18

[61]: #updateinstancemigrations

[62]: #parameters-19

[63]: #isbootstraprequired

[64]: #parameters-20

[65]: #isbootstraprequired-1

[66]: #parameters-21

[67]: #migrateinstance

[68]: #parameters-22

[69]: #lifecyclemodule

[70]: #runmigrationscript

[71]: #parameters-23

[72]: #runmigrationscripttext

[73]: #parameters-24

[74]: #uploadarchive

[75]: #parameters-25

[76]: #uploadarchivetext

[77]: #parameters-26

[78]: #librarynode

[79]: #properties-6

[80]: #processcontent

[81]: #parameters-27

[82]: #node

[83]: #filtercallback

[84]: #parameters-28

[85]: #traversecallback

[86]: #parameters-29

[87]: #libraryexport

[88]: #properties-7

[89]: #library

[90]: #traverse

[91]: #parameters-30

[92]: #reset

[93]: #filter

[94]: #parameters-31

[95]: #toxmlstring

[96]: #parameters-32

[97]: #outputlibrarytree

[98]: #parameters-33

[99]: #parse

[100]: #parameters-34

[101]: #library-1

[102]: #properties-8

[103]: #traverse-1

[104]: #parameters-35

[105]: #reset-1

[106]: #filter-1

[107]: #parameters-36

[108]: #toxmlstring-1

[109]: #parameters-37

[110]: #outputlibrarytree-1

[111]: #parameters-38

[112]: #parse-1

[113]: #parameters-39

[114]: #root

[115]: #exportpagestofolder

[116]: #parameters-40

[117]: #collectionlists

[118]: #properties-9

[119]: #getcollectionsfrominstance

[120]: #parameters-41

[121]: #getdataunitsfromweb

[122]: #parameters-42

[123]: #getdataunitsfromargument

[124]: #parameters-43

[125]: #confignamefromhostname

[126]: #parameters-44

[127]: #logfile

[128]: #properties-10

[129]: #getlogs

[130]: #parameters-45

[131]: #tailcommand

[132]: #parameters-46

[133]: #question

[134]: #properties-11

[135]: #feature

[136]: #properties-12

[137]: #featurestate

[138]: #properties-13

[139]: #featuresclientstate

[140]: #properties-14

[141]: #instancefeaturestate

[142]: #properties-15

[143]: #collectfeatures

[144]: #parameters-47

[145]: #featurestatefromcustomobject

[146]: #parameters-48

[147]: #getinstancefeaturestate

[148]: #parameters-49

[149]: #boostrapfeatures

[150]: #parameters-50

[151]: #updatefeaturestate

[152]: #parameters-51

[153]: #featurehelpers

[154]: #featurescriptarguments

[155]: #properties-16

[156]: #deployfeature

[157]: #parameters-52

[158]: #removefeature

[159]: #parameters-53

[160]: #waitforjob

[161]: #parameters-54

[162]: #jobexecutionparameter

[163]: #properties-17

[164]: #jobexecution

[165]: #properties-18

[166]: #executejob

[167]: #parameters-55

[168]: #sitearchiveimport

[169]: #parameters-56

[170]: #exportsitesconfiguration

[171]: #properties-19

[172]: #exportglobaldataconfiguration

[173]: #properties-20

[174]: #exportdataunitsconfiguration

[175]: #properties-21

[176]: #sitearchiveexport

[177]: #parameters-57

[178]: #sitearchiveexportjson

[179]: #parameters-58

[180]: #sitearchiveimportjson

[181]: #parameters-59

[182]: #sitearchiveexporttext

[183]: #parameters-60

[184]: #sitearchiveimporttext

[185]: #parameters-61

[186]: #resourcedocument

[187]: #properties-22

[188]: #permissionvalidatorcallback

[189]: #compareresourcedocuments

[190]: #parameters-62

[191]: #ensuredataapipermissions

[192]: #parameters-63

[193]: #current

[194]: #permissiondocument

[195]: #properties-23

[196]: #comparepermissiondocuments

[197]: #parameters-64

[198]: #ensurewebdavpermissions

[199]: #parameters-65

[200]: #sleep

[201]: #parameters-66

[202]: #cartridgemapping

[203]: #properties-24

[204]: #findcartridges

[205]: #parameters-67

[206]: #reloadcodeversion

[207]: #parameters-68

[208]: #synccartridges

[209]: #parameters-69

[210]: #downloadcodeversion

[211]: #parameters-70

[212]: #globalconfig

[213]: #site

[214]: #properties-25

[215]: #codeversion

[216]: #properties-26

[217]: #instanceinformationresult

[218]: #properties-27

[219]: #instanceinformationoptions

[220]: #properties-28

[221]: #preferences

[222]: #properties-29

[223]: #globalpreferences

[224]: #properties-30

[225]: #instancepreferenceinfo

[226]: #properties-31

[227]: #getinstancepreferenceinfo

[228]: #parameters-71

[229]: #getinstanceinfo

[230]: #parameters-72

[231]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/config.js#L394-L421 "Source code on GitHub"

[232]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise

[233]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/config.js#L432-L455 "Source code on GitHub"

[234]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[235]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array

[236]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[237]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/intellij.js#L35-L41 "Source code on GitHub"

[238]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/intellij.js#L51-L54 "Source code on GitHub"

[239]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/intellij.js#L71-L172 "Source code on GitHub"

[240]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/intellij.js#L185-L209 "Source code on GitHub"

[241]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/intellij.js#L221-L237 "Source code on GitHub"

[242]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/environment.js#L50-L54 "Source code on GitHub"

[243]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean

[244]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/environment.js#L129-L143 "Source code on GitHub"

[245]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/environment.js#L163-L518 "Source code on GitHub"

[246]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/environment.js#L228-L243 "Source code on GitHub"

[247]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/environment.js#L250-L265 "Source code on GitHub"

[248]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/environment.js#L272-L287 "Source code on GitHub"

[249]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/environment.js#L294-L313 "Source code on GitHub"

[250]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/environment.js#L320-L335 "Source code on GitHub"

[251]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/environment.js#L513-L517 "Source code on GitHub"

[252]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/environment.js#L446-L450 "Source code on GitHub"

[253]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date

[254]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L42-L52 "Source code on GitHub"

[255]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L57-L94 "Source code on GitHub"

[256]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L97-L103 "Source code on GitHub"

[257]: #environment

[258]: #migrationhelpers

[259]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined

[260]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L105-L110 "Source code on GitHub"

[261]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function

[262]: #migrationscriptarguments

[263]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L112-L115 "Source code on GitHub"

[264]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number

[265]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L117-L123 "Source code on GitHub"

[266]: #toolkitclientstate

[267]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L125-L129 "Source code on GitHub"

[268]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L131-L136 "Source code on GitHub"

[269]: #toolkitinstancestate

[270]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L138-L143 "Source code on GitHub"

[271]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L145-L152 "Source code on GitHub"

[272]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L154-L160 "Source code on GitHub"

[273]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L162-L168 "Source code on GitHub"

[274]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L170-L176 "Source code on GitHub"

[275]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L178-L184 "Source code on GitHub"

[276]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error

[277]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L186-L196 "Source code on GitHub"

[278]: #initlifecyclefunction

[279]: #shouldbootstraplifecyclefunction

[280]: #onbootstraplifecyclefunction

[281]: #beforealllifecyclefunction

[282]: #beforeeachlifecyclefunction

[283]: #afteralllifecyclefunction

[284]: #onfailurelifecyclefunction

[285]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L204-L236 "Source code on GitHub"

[286]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L245-L327 "Source code on GitHub"

[287]: #migrationlifecyclefunctions

[288]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L335-L349 "Source code on GitHub"

[289]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L357-L366 "Source code on GitHub"

[290]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/features.js#L296-L305 "Source code on GitHub"

[291]: #instancefeaturestate

[292]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L383-L526 "Source code on GitHub"

[293]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L402-L402 "Source code on GitHub"

[294]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L536-L561 "Source code on GitHub"

[295]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/migrations.js#L572-L600 "Source code on GitHub"

[296]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/webdav.js#L32-L84 "Source code on GitHub"

[297]: https://nodejs.org/api/buffer.html

[298]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/webdav.js#L98-L117 "Source code on GitHub"

[299]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map

[300]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/page-designer.js#L12-L23 "Source code on GitHub"

[301]: #librarynode

[302]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/page-designer.js#L34-L98 "Source code on GitHub"

[303]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/page-designer.js#L41-L49 "Source code on GitHub"

[304]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/page-designer.js#L100-L104 "Source code on GitHub"

[305]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/page-designer.js#L105-L109 "Source code on GitHub"

[306]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/page-designer.js#L111-L116 "Source code on GitHub"

[307]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/page-designer.js#L125-L311 "Source code on GitHub"

[308]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/page-designer.js#L212-L230 "Source code on GitHub"

[309]: #traversecallback

[310]: #library

[311]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/page-designer.js#L236-L241 "Source code on GitHub"

[312]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/page-designer.js#L251-L262 "Source code on GitHub"

[313]: #filtercallback

[314]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/page-designer.js#L271-L286 "Source code on GitHub"

[315]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/page-designer.js#L299-L310 "Source code on GitHub"

[316]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/page-designer.js#L144-L201 "Source code on GitHub"

[317]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/info.js#L61-L66 "Source code on GitHub"

[318]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/page-designer.js#L157-L165 "Source code on GitHub"

[319]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/page-designer.js#L325-L416 "Source code on GitHub"

[320]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RegExp

[321]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/command-export.js#L15-L21 "Source code on GitHub"

[322]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/command-export.js#L29-L97 "Source code on GitHub"

[323]: #collectionlists

[324]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/command-export.js#L106-L191 "Source code on GitHub"

[325]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/command-export.js#L199-L208 "Source code on GitHub"

[326]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/command-instance.js#L20-L23 "Source code on GitHub"

[327]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/command-tail.js#L7-L11 "Source code on GitHub"

[328]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/command-tail.js#L19-L42 "Source code on GitHub"

[329]: #logfile

[330]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/command-tail.js#L49-L104 "Source code on GitHub"

[331]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/features.js#L9-L14 "Source code on GitHub"

[332]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/features.js#L16-L28 "Source code on GitHub"

[333]: #question

[334]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/features.js#L30-L36 "Source code on GitHub"

[335]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/features.js#L38-L41 "Source code on GitHub"

[336]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/features.js#L43-L48 "Source code on GitHub"

[337]: #featuresclientstate

[338]: #featurestate

[339]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/features.js#L57-L72 "Source code on GitHub"

[340]: #feature

[341]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/features.js#L78-L93 "Source code on GitHub"

[342]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/features.js#L101-L137 "Source code on GitHub"

[343]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/features.js#L146-L238 "Source code on GitHub"

[344]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/features.js#L250-L288 "Source code on GitHub"

[345]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/features.js#L310-L315 "Source code on GitHub"

[346]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/features.js#L317-L323 "Source code on GitHub"

[347]: #featurehelpers

[348]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/features.js#L335-L443 "Source code on GitHub"

[349]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/features.js#L454-L491 "Source code on GitHub"

[350]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L23-L54 "Source code on GitHub"

[351]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L56-L60 "Source code on GitHub"

[352]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L62-L67 "Source code on GitHub"

[353]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L78-L119 "Source code on GitHub"

[354]: #jobexecutionparameter

[355]: #jobexecution

[356]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L131-L181 "Source code on GitHub"

[357]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L183-L214 "Source code on GitHub"

[358]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L216-L242 "Source code on GitHub"

[359]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L244-L255 "Source code on GitHub"

[360]: #exportsitesconfiguration

[361]: #exportglobaldataconfiguration

[362]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L265-L283 "Source code on GitHub"

[363]: #exportdataunitsconfiguration

[364]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L299-L313 "Source code on GitHub"

[365]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L322-L345 "Source code on GitHub"

[366]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L359-L376 "Source code on GitHub"

[367]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L385-L400 "Source code on GitHub"

[368]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L402-L409 "Source code on GitHub"

[369]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L411-L415 "Source code on GitHub"

[370]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L423-L430 "Source code on GitHub"

[371]: #resourcedocument

[372]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L451-L526 "Source code on GitHub"

[373]: #permissionvalidatorcallback

[374]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L489-L489 "Source code on GitHub"

[375]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L528-L532 "Source code on GitHub"

[376]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L539-L544 "Source code on GitHub"

[377]: #permissiondocument

[378]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/jobs.js#L563-L624 "Source code on GitHub"

[379]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/util.js#L7-L9 "Source code on GitHub"

[380]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/code.js#L8-L12 "Source code on GitHub"

[381]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/code.js#L20-L38 "Source code on GitHub"

[382]: #cartridgemapping

[383]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/code.js#L46-L64 "Source code on GitHub"

[384]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/code.js#L76-L124 "Source code on GitHub"

[385]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/code.js#L132-L145 "Source code on GitHub"

[386]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/global-config.js#L9-L13 "Source code on GitHub"

[387]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/info.js#L25-L30 "Source code on GitHub"

[388]: #preferences

[389]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/info.js#L32-L38 "Source code on GitHub"

[390]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/info.js#L40-L47 "Source code on GitHub"

[391]: #codeversion

[392]: #site

[393]: #globalpreferences

[394]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/info.js#L49-L59 "Source code on GitHub"

[395]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/info.js#L68-L80 "Source code on GitHub"

[396]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/info.js#L82-L86 "Source code on GitHub"

[397]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/info.js#L88-L93 "Source code on GitHub"

[398]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/info.js#L160-L237 "Source code on GitHub"

[399]: #instancepreferenceinfo

[400]: https://github.com/SalesforceCommerceCloud/b2c-tools/blob/afd8c9da88115cb414fe0e07f010a01231afc232/lib/info.js#L246-L316 "Source code on GitHub"

[401]: #instanceinformationoptions

[402]: #instanceinformationresult
