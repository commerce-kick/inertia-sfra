import SourceCodeGroup = require('./SourceCodeGroup')
import URLRedirect = require('../web/URLRedirect')

declare class SourceCodeInfo {
    static STATUS_ACTIVE  :  number
    static STATUS_INACTIVE  :  number
    static STATUS_INVALID  :  number

    readonly code  :  string
    readonly group  :  SourceCodeGroup
    readonly redirect  :  URLRedirect | null
    readonly status  :  number


    private constructor();

}

export = SourceCodeInfo
