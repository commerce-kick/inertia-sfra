module.exports = `<?xml version="1.0" encoding="UTF-8"?>
<metadata xmlns="http://www.demandware.com/xml/impex/metadata/2006-10-31">
    <type-extension type-id="OrganizationPreferences">
        <custom-attribute-definitions>
            <attribute-definition attribute-id="b2cToolsFeaturesVersion">
                <display-name xml:lang="x-default">b2c-tools Features Metadata Version</display-name>
                <description xml:lang="x-default"></description>
                <type>int</type>
                <mandatory-flag>false</mandatory-flag>
                <externally-managed-flag>true</externally-managed-flag>
            </attribute-definition>
            <attribute-definition attribute-id="b2cToolsFeaturesBootstrappedClientIDs">
                <display-name xml:lang="x-default">b2c-tools Features Bootstrapped Client IDs</display-name>
                <description xml:lang="x-default"></description>
                <type>text</type>
                <mandatory-flag>false</mandatory-flag>
                <externally-managed-flag>true</externally-managed-flag>
            </attribute-definition>
        </custom-attribute-definitions>
        <group-definitions>
            <attribute-group group-id="b2cToolkit">
                <display-name xml:lang="x-default">b2c-tools</display-name>
                <attribute attribute-id="b2cToolkitDataVersion"/>
                <attribute attribute-id="b2cToolsVars"/>
                <attribute attribute-id="b2cToolkitMigrations"/>
                <attribute attribute-id="b2cToolsBootstrappedClientIDs"/>
                <attribute attribute-id="b2cToolsFeaturesVersion"/>
                <attribute attribute-id="b2cToolsFeaturesBootstrappedClientIDs"/>
            </attribute-group>
        </group-definitions>
    </type-extension>

    <custom-type type-id="B2CToolsFeature">
        <display-name xml:lang="x-default">B2C Tools Feature</display-name>
        <description xml:lang="x-default">Stores the current state of a deployed b2c-tools feature</description>
        <staging-mode>no-staging</staging-mode>
        <storage-scope>organization</storage-scope>
        <key-definition attribute-id="featureName">
            <type>string</type>
            <min-length>0</min-length>
        </key-definition>
        <attribute-definitions>
            <attribute-definition attribute-id="secretVars">
                <display-name xml:lang="x-default">Secret Vars</display-name>
                <type>password</type>
                <mandatory-flag>false</mandatory-flag>
                <externally-managed-flag>false</externally-managed-flag>
            </attribute-definition>
            <attribute-definition attribute-id="vars">
                <display-name xml:lang="x-default">Vars</display-name>
                <type>text</type>
                <localizable-flag>false</localizable-flag>
                <mandatory-flag>false</mandatory-flag>
                <externally-managed-flag>false</externally-managed-flag>
            </attribute-definition>
        </attribute-definitions>
        <group-definitions>
            <attribute-group group-id="feature">
                <display-name xml:lang="x-default">Feature</display-name>
                <attribute attribute-id="creationDate" system="true"/>
                <attribute attribute-id="lastModified" system="true"/>
                <attribute attribute-id="featureName"/>
                <attribute attribute-id="vars"/>
                <attribute attribute-id="secretVars"/>
            </attribute-group>
        </group-definitions>
    </custom-type>
</metadata>`