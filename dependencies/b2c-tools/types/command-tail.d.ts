declare namespace _exports {
    export { LogFile };
}
declare namespace _exports {
    let command: string;
    let desc: string;
    function builder(yargs: any): any;
    function handler(argv: any): Promise<void>;
}
export = _exports;
type LogFile = {
    name: string;
    lastModified: Date;
};
//# sourceMappingURL=command-tail.d.ts.map