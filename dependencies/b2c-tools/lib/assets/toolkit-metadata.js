module.exports = `<?xml version="1.0" encoding="UTF-8"?>
<metadata xmlns="http://www.demandware.com/xml/impex/metadata/2006-10-31">
    <type-extension type-id="OrganizationPreferences">
        <custom-attribute-definitions>
            <attribute-definition attribute-id="b2cToolkitDataVersion">
                <display-name xml:lang="x-default">b2c-tools Metadata Version</display-name>
                <description xml:lang="x-default"></description>
                <type>int</type>
                <mandatory-flag>false</mandatory-flag>
                <externally-managed-flag>true</externally-managed-flag>
            </attribute-definition>
            <attribute-definition attribute-id="b2cToolsVars">
                <display-name xml:lang="x-default">b2c-tools Instance Vars</display-name>
                <description xml:lang="x-default"></description>
                <type>text</type>
                <mandatory-flag>false</mandatory-flag>
                <externally-managed-flag>true</externally-managed-flag>
            </attribute-definition>
            <attribute-definition attribute-id="b2cToolkitMigrations">
                <display-name xml:lang="x-default">b2c-tools Applied Migrations</display-name>
                <description xml:lang="x-default"></description>
                <type>text</type>
                <mandatory-flag>false</mandatory-flag>
                <externally-managed-flag>true</externally-managed-flag>
            </attribute-definition>
            <attribute-definition attribute-id="b2cToolsBootstrappedClientIDs">
                <display-name xml:lang="x-default">b2c-tools Bootstrapped Client IDs</display-name>
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
</metadata>`