sap.ui.define(["sap/ui/test/Opa5"], function (Opa5) {
    "use strict";

    return Opa5.extend("it.horsa.gualapack.macchina.test.integration.arrangements.Startup", {
        iStartMyApp: function () {
            this.iStartMyUIComponent({
                componentConfig: {
                    name: "it.horsa.gualapack.macchina",
                    async: true,
                    manifest: true
                }
            });
        }
    });
});
