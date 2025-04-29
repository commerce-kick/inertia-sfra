'use strict';

var formValidation = require('base/components/formValidation');

/**
 * Switches the current state and updates the UI.
 * @param {Object} currentStep - The current step in the loop
 * @param {Object []} steps - The array of steps
 * @param {integer} index - The index of the current step in the array of steps
 * @returns {void}
 */
function switchState(currentStep, steps, index) {
    $('.failedAttempt').addClass('d-none').html('');

    if (currentStep.state === 'edit') {
        // hide form and show summary for current state
        $(currentStep.fieldset).addClass('d-none');
        $(currentStep.summary).removeClass('d-none');
        // update the step with new state
        currentStep.state = 'summary'; // eslint-disable-line no-param-reassign
        $('body').trigger('lib:updateState', { currentStep: currentStep, steps: steps, index: index });

        // update the next step
        if (index !== steps.length) {
            var nextStep = steps[index + 1];
            $(nextStep.fieldset).removeClass('d-none');
            $(nextStep.summary).addClass('d-none');
            nextStep.state = 'edit';
            $('body').trigger('lib:updateNextState', {
                currentStep: currentStep,
                nextStep: nextStep,
                steps: steps,
                index: index
            });
        }
    } else {
        // show form and hid summary for current state
        $(currentStep.fieldset).removeClass('d-none');
        $(currentStep.summary).addClass('d-none');
        // update the step with new state
        currentStep.state = 'edit'; // eslint-disable-line no-param-reassign
        $('body').trigger('lib:updateState', { currentStep: currentStep, steps: steps, index: index });

        if (index !== steps.length) {
            for (var i = index + 1; i < steps.length; i++) {
                var futureStep = steps[i];
                $(futureStep.fieldset).addClass('d-none');
                $(futureStep.summary).addClass('d-none');
                futureStep.state = 'none';
            }
        }
    }
}

/**
 * Initialize the gift registry lib, wire up events
 * @param {Object []} steps - An array of steps in the flow
 * @param {jQuery} $form - The form in use
 * @returns {void}
 */
function initialize(steps, $form) {
    steps.forEach(function (step, index) {
        $(step.action).on('click', function (e) {
            e.preventDefault();
            step.submit.call(this, step, step.success || function (data) {
                $($form).find('.form-control.is-invalid').removeClass('is-invalid');
                step.populateSummary(step, data);
                switchState(step, steps, index);
            }, function (error) {
                if (error.responseJSON.redirectUrl) {
                    window.location.href = error.responseJSON.redirectUrl;
                } else {
                    formValidation($form, error.responseJSON);
                }
            });
        });

        if (step.editButton) {
            $(step.editButton).on('click', function (e) {
                e.preventDefault();
                switchState(step, steps, index);
            });
        }
    });
}

module.exports = {
    initialize: initialize,
    switchState: switchState
};
