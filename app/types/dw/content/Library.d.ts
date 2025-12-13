import ExtensibleObject = require('../object/ExtensibleObject');
import Folder = require('./Folder')
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface Library extends CustomAttributes {
        }
    }
}

declare class Library extends ExtensibleObject<ICustomAttributes.Library> {
    readonly displayName: string;
    readonly ID: string;
    readonly root: Folder | null;

}

export = Library;
