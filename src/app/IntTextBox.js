define([
    'dojo/_base/declare',
    'dijit/form/NumberTextBox'
], function (declare, NumberTextBox) {
    return declare(NumberTextBox, {
        //invalidMessage: 'Number must be between -20000 to +20000',
        require: true,
        constraints: {
            min: -20000,
            max: 20000,
            places: 0
        }
    });
});