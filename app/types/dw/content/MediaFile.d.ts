import URL = require('../web/URL');

declare type scaleModes = 'cut' | 'fit';

declare type formats = 'tif' | 'tiff' | 'jpg' | 'jpeg' | 'png' | 'gif';

interface ITransform {
    scaleWidth?: number;
    scaleHeight?: number;
    scaleMode?: scaleModes;

    imageX?: number;
    imageY?: number;
    imageURI? : string;

    cropX?: number;
    cropY?: number;
    cropWidth?: number;
    cropHeight?: number;

    format?: formats
}

declare class MediaFile {
    absURL  :  URL;
    alt  :  string;
    httpsURL  :  URL;
    httpURL  :  URL;
    title  :  string;
    URL  :  URL;
    viewType  :  string;

}

export = MediaFile;
