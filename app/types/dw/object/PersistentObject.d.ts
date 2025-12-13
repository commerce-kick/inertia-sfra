
declare abstract class PersistentObject {
    public creationDate: Date;
    public lastModified: Date;
    public UUID: string;

    public getCreationDate() : Date;
    public getLastModified() : Date;
    public getUUID() : string;
}
export = PersistentObject;
