import Iterator = require('../util/Iterator');
import SuggestedTerm = require('./SuggestedTerm');

/**
 * This container represents a list of suggested terms, all belonging to a particular single original term of the users input search phrase. Each user input term of the search phrase is being processed separately by the suggestion engine. For each original term, a list of terms will be suggested, either completed terms, corrected terms or even the exact term if they are known to the engine as they are. A instance of this class refers to the original unmodified term, as well as to a list of SuggestedTerms objects representing a single suggested term.
 */
declare class SuggestedTerms {
    /**
     * Returns true if this set of suggested terms is empty.
     */
    readonly empty  :  boolean

    /**
     * This method returns the suggested term which is considered best matching with the original term. See getTerms() for a note on ordering of suggested terms.
     */
    readonly firstTerm  :  SuggestedTerm

    /**
     * The original term of the user input, for which this instance provides a list of suggested terms. Suggested terms can either be corrected, or completed or exact matching.
     */
    readonly originalTerm  :  string

    /**
     * The list of SuggestedTerms suggested for the original term.
     */
    readonly terms  :  Iterator<SuggestedTerm>

    private constructor();


}

export = SuggestedTerms;
