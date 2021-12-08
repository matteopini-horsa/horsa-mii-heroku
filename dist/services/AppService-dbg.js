sap.ui.define(
    [],
    function () {
        return {
            prefix: document.location.hostname === 'localhost' ? '' : '/XMII/CM/Mes/macchina',
            app_data: null,
            init: function (component) {
                this.app_data = component.getModel('app');

                if(Object.keys(this.app_data.oData).length === 0) {

                    this.app_data.loadData(`${this.prefix}/resources/static/app.json`)

                }
            },

            get: function(key) {
                return this.app_data.oData[key] || null;
            }
        }
    })
