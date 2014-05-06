require([
    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/request/xhr',
    'dijit/form/Button',
    'dijit/form/Form',
    'dijit/form/TextBox',
    'dijit/layout/BorderContainer',
    'dijit/layout/ContentPane',
    'app/IntTextBox',
    'dojo/domReady!'
], function (construct, style, xhr, Button, Form, TextBox, BorderContainer,
    ContentPane, IntTextBox) {
    var bc, form, onSubmit, param0, resultBox;
    onSubmit = function (e) {
        e.preventDefault();
        if (form.validate()) {
            var param = form.get('value');
            form.reset();
            xhr('/add', {
                data: param,
                method: 'PUT'
            }).then(function (data) {
                var result = Number(param.zero) + Number(param.one);
                resultBox.set('value', result);
                construct.create('p', {
                    innerHTML: param.zero + ' + ' + param.one + ' = ' + result
                }, 'history', 'first');
                param0.focus();
            }, function (error) {
                alert(error);
            });
        } else {
            return false;
        }
        return true;
    };
    bc = new BorderContainer({}, 'borderContainer');
    form = new Form({
        region: 'top',
        onSubmit: onSubmit
    }, 'form');
    resultBox = new TextBox({
        disabled: true
    }, 'result');
    param0 = new IntTextBox({
        name: 'zero'
    }, 'param0');
    new IntTextBox({
        name: 'one'
    }, 'param1');
    new Button({
        label: '=',
        type: 'submit'
    }, 'submit');
    bc.addChild(form);
    bc.addChild(new ContentPane({
        region: 'center'
    }, 'historyPane'));
    style.set('borderContainer', 'display', 'block');
    bc.startup();
});