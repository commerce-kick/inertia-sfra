import Calendar = require('./Calendar');
import Money = require('../value/Money');

/**
 * String utility class.
 */
declare class StringUtils {

    /**
     * String encoding type HTML.
     * 
     * See Also:
    encodeString(String, Number)
    */
    static readonly ENCODE_TYPE_HTML  :  number

    /**
     * String encoding type XML.
    See Also:
    encodeString(String, Number)
    */
    static readonly ENCODE_TYPE_XML  :  number

    /**
     * String truncate mode 'char'. Truncate string to the nearest character. Default mode if no truncate mode is specified.
    See Also:
    truncate(String, Number, String, String)
    */
    static readonly TRUNCATE_CHAR  :  string

    /**
     * String truncate mode 'sentence'. Truncate string to the nearest sentence.
    See Also:
    truncate(String, Number, String, String)
    */
    static readonly TRUNCATE_SENTENCE  :  string

    /**
     * String truncate mode 'word'. Truncate string to the nearest word.
    See Also:
    truncate(String, Number, String, String)
    */
    static readonly TRUNCATE_WORD  :  string

    private constructor();


}

export = StringUtils;
