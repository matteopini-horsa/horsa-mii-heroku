sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "./MesServices"
], function (Controller, MesServices) {
    "use strict";

    return Controller.extend("it.horsa.gualapack.macchina.controller.RootView", {

        onInit: function () {
            const t = this;
            MesServices('cdl')
                .then(
                    (cdl_data) => {
                        const cdl = new sap.ui.model.json.JSONModel();
                        cdl.setData(cdl_data);
                        this.getView().setModel(cdl, "cdl");

                        const pulsantiera = this.getView().byId('pulsantiera');
                        pulsantiera.items = []

                        const button_template = (type) => {
                            return new sap.m.Button({
                                text: '{cdl>text}',
                                type: type || 'Default',
                                width: '100%',
                                press: function (e) {
                                    const path = e.getSource().oBindingContexts.cdl.sPath
                                    this.goto(e.getSource().oBindingContexts.cdl.oModel.getProperty(path).key);
                                }.bind(t)
                            })
                        };

                        const grid = new sap.ui.layout.Grid({
                            defaultSpan: 'XL12 L12 M12 S12',
                            content: {
                                path: 'cdl>/cdl',
                                template: button_template()
                            }
                        })

                        pulsantiera.addItem(grid);

                    }
                )
        },
        goto: function(page) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo(page);
        }

    });

});
