import Iterator = require('../util/Iterator');
import SuggestedPhrase = require('./SuggestedPhrase');
import SuggestedTerms = require('./SuggestedTerms');

/**
 * The search phrase suggestions contain a list of suggested search phrases (see SuggestedPhrase) as well as, for each of the search phrase terms, a list with corrected and completed alternative terms
 */
declare class SearchPhraseSuggestions {

    /**
     * A list of SuggestedPhrase objects that relates to the user input search phrase.
     */
    readonly suggestedPhrases  :  Iterator<SuggestedPhrase>

    /**
     * A list of SuggestedTerms objects. Each of the returned instances represents a set of terms suggested for a particular single term of the user input search phrase.
     */
    readonly suggestedTerms  :  Iterator<SuggestedTerms>


    private constructor();


}

export  =  SearchPhraseSuggestions;
