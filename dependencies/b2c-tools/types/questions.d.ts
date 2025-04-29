export namespace SERVER {
    let name: string;
    let message: string;
    function filter(v: any): any;
    function validate(v: any): any;
}
export namespace CODE_VERSION {
    let name_1: string;
    export { name_1 as name };
    let message_1: string;
    export { message_1 as message };
    export function validate_1(v: any): any;
    export { validate_1 as validate };
}
export namespace USERNAME {
    let name_2: string;
    export { name_2 as name };
    let message_2: string;
    export { message_2 as message };
    export function validate_2(v: any): any;
    export { validate_2 as validate };
}
export namespace PASSWORD {
    let name_3: string;
    export { name_3 as name };
    export function message_3(answers: any): string;
    export { message_3 as message };
    export function validate_3(v: any): any;
    export { validate_3 as validate };
}
export namespace CONFIRM {
    let name_4: string;
    export { name_4 as name };
    let message_4: string;
    export { message_4 as message };
    export let type: string;
    let _default: boolean;
    export { _default as default };
}
export namespace CONFIRM_YES {
    let name_5: string;
    export { name_5 as name };
    let message_5: string;
    export { message_5 as message };
    let type_1: string;
    export { type_1 as type };
    let _default_1: boolean;
    export { _default_1 as default };
}
export function CLIENT_ID(defaultClientID: any): {
    name: string;
    message: string;
    default: any;
};
export function CLIENT_SECRET(defaultClientID: any): {
    name: string;
    message: string;
    default: string;
    when: (answers: any) => boolean;
};
export function DW_JSON_CONFIG_NAME(configFile: any): {
    name: string;
    message: string;
    type: string;
    choices: () => {
        name: string;
        value: string;
        short: string;
    }[];
    validate: (v: any) => any;
};
//# sourceMappingURL=questions.d.ts.map