sap.ui.define([
    "sap/ui/core/Control"
], function (Control) {
    "use strict";
    return Control.extend("it.horsa.gualapack.macchina.control.Info", {
        metadata : {
            properties: {
                label: {
                    type: "string",
                    defaultValue: ""
                },
                text: {
                    type: "string",
                    defaultValue: ""
                },
                type: {
                    type: "string",
                    defaultValue: ""
                },
                size: {
                    type: "string",
                    defaultValue: ""
                }
            }
        },
        init : function () {
        },
        renderer : function (oRM, oControl) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('value');

            if (oControl.getSize()) {
                wrapper.classList.add('value--' + oControl.getSize())
            }


            const label = document.createElement('div');
            label.classList.add('value__label');
            label.innerHTML = oControl.getLabel();

            const value = document.createElement('div');
            value.classList.add('value__value');

            if (oControl.getType() === 'boolean') {
                const icon = document.createElement('span');
                icon.classList.add('sapUiIcon');
                icon.classList.add('status--icon__icon');
                icon.style.fontFamily = 'SAP-icons';

                if (oControl.getText() === 'true') {
                    icon.setAttribute('data-sap-ui-icon-content', '');
                    value.classList.add('value--success');
                } else {
                    icon.setAttribute('data-sap-ui-icon-content', '');
                    value.classList.add('value--error');
                }
                value.append(icon);

                const text = document.createElement('span');
                text.innerHTML = '&nbsp;' + (oControl.getText() === 'true' ? 'Sì' : 'No');

                value.append(text);
            } else {
                value.innerHTML = oControl.getText();
            }

            wrapper.append(label);
            wrapper.append(value);

            oRM.write(wrapper.outerHTML);
        }
    });
});
