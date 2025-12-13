import Collection = require('../util/Collection');
import ExtensibleObject = require('../object/ExtensibleObject');
import Content = require('./Content');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface Folder extends CustomAttributes {
        }
    }
}

declare class Folder extends ExtensibleObject<ICustomAttributes.Folder>{
    readonly content: Collection<Content>;
    readonly description: string | null;
    readonly displayName: string | null;
    readonly ID: string;
    readonly online: boolean;
    readonly onlineContent: Collection<Content>;
    readonly onlineSubFolders: Collection<Folder>;
    readonly pageDescription: string | null;
    readonly pageKeywords: string | null;
    readonly pageTitle: string | null;
    readonly pageURL: string | null;
    readonly parent: Folder | null;
    readonly root: boolean;
    readonly subFolders: Collection<Folder>;
    readonly template: string | null;

    private constructor();


}

export = Folder;
