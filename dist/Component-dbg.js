sap.ui.define(
    ["sap/ui/core/UIComponent", "sap/ui/Device", "it/horsa/gualapack/macchina/model/models", "it/horsa/gualapack/macchina/services/AppService"],
    function (UIComponent, Device, models, AppService) {
        "use strict";

        return UIComponent.extend("it.horsa.gualapack.macchina.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                AppService.init(this);

                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

            }
        });
    }
);
