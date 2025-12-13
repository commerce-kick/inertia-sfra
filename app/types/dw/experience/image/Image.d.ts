
import MediaFile = require("../../content/MediaFile")
import FocalPoint = require("./FocalPoint");
import ImageMetaData = require("./ImageMetaData");


/**
 * This class represents an image with additional configuration capabilities (e.g. optional focal point). Furthermore it provides access to meta data of the referenced image file.
 */
declare class Image {
	/**
	 * The image media file from the current site's library.
	 */
	readonly file: MediaFile

	/**
	 * The focal point of the image.
	 */
	readonly focalPoint: FocalPoint

	/**
	 * The meta data of the physical image file. This meta data is obtained when the respective component attribute was saved from Page Designer, i.e. the underlying image is not queried for the meta data every time getMetaData() is called but only on store of the related component attribute.
	 */
	readonly metaData: ImageMetaData

	protected constructor();

}


export = Image;
