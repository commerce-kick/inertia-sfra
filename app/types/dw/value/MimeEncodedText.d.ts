
/**
 * Container for an arbitrary text string its mime type, and encoding
 */
declare class MimeEncodedText {

    /**
     * The encoding of the text. Encoding is set at creation time and can't be changed afterwards
     */
    readonly encoding  :  string

    /**
     * The mime type of the text. Mime type is set at creation time and can't be changed afterwards.
     */
    readonly mimeType  :  string

    /**
     * The text. Text is set at creation time and can't be changed afterwards.
     */
    readonly text  :  string


}

export = MimeEncodedText;
