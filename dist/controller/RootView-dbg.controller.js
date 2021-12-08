sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../services/MesServices",
    "../services/AppService"
], function (Controller, MesServices, AppService) {
    "use strict";

    return Controller.extend("it.horsa.gualapack.macchina.controller.RootView", {

        onInit: function () {
            AppService.init(this.getOwnerComponent());
                const cdl = new sap.ui.model.json.JSONModel();
                cdl.setData(AppService.get('cdl'));
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
                        }.bind(this)
                    })
                };

                const grid = new sap.ui.layout.Grid({
                    defaultSpan: 'XL12 L12 M12 S12',
                    content: {
                        path: 'cdl>/',
                        template: button_template()
                    }
                })

                pulsantiera.addItem(grid);


        },
        goto: function(page) {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo(page);
        }

    });

});
