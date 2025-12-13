import List = require('../util/List')

/**
 * This class represents the resources of a custom editor, i.e. URLs to scripts and styles which are required for client side functionality in Page Designer in context of the corresponding custom attribute UI. These resources are initially specified as part of your custom editor type (i.e. the respective json file). If needed you can revise and refine them as part of the init function that is called during initialization of the CustomEditor, i.e. is subject to your implementation of the respective custom editor type js file.
 */
declare class CustomEditorResources {
	/**
	 * The specified script resource URLs. You can further modify this list at runtime of your init function to add more required scripts. Absolute URLs will be retained, relative paths will be resolved to absolute ones based on the cartridge path for static resources (e.g. similar to what URLUtils.httpStatic(String) or URLUtils.httpsStatic(String)) does.
	 */
	readonly scripts: List<string>

	/**
	 * The specified style URLs. You can further modify this list at runtime of your init function to add more required styles.Absolute URLs will be retained, relative paths will be resolved to absolute ones based on the cartridge path for static resources(e.g.similar to what URLUtils.httpStatic(String) or URLUtils.httpsStatic(String)) does
	 */
	readonly styles: List<string>


}


export = CustomEditorResources
