sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/routing/History",
        "sap/ui/core/UIComponent",
        "it/horsa/gualapack/macchina/model/formatter",
        "sap/ui/model/json/JSONModel",
        "sap/m/Button",
        "sap/m/Dialog",
        "sap/m/List",
        "sap/m/StandardListItem",
        "sap/ui/layout/Grid",
    ],
    function (Controller, History, UIComponent, formatter, JSONModel, Button, Dialog, List, StandardListItem, Grid) {
        "use strict";

        return Controller.extend("it.horsa.gualapack.macchina.controller.BaseController", {

            onAfterRendering: function () {

                this.actions();
                this.gauge_init();
                this.macchina_load_data('resources/stampa.json');

            },
            actions: function () {
                const actions = [];
                for (let i = 0; i < 10; i++) {
                    actions.push({
                        id: i,
                        label: 'Azione personalizzata ' + i
                    })
                }

                var azioni = new sap.ui.model.json.JSONModel({
                    azioni: actions
                });
                this.getView().setModel(azioni, 'azioni');

                const button_ordini = this.getView().byId('button-ordini');
                const button_ordini_menu = new sap.m.Menu;
                actions.forEach(a => {
                    button_ordini_menu.addItem(new sap.m.MenuItem({
                        text: a.label
                    }))
                })
                button_ordini.setMenu(button_ordini_menu);
            },
            /**
             * Carica il file di dati json_file_path
             * crea le colonne ed esegue il bind dei dati
             * @param json_file_path
             */
            macchina_load_data: function (json_file_path) {

                var macchina_data = new sap.ui.model.json.JSONModel();
                this.getView().setModel(macchina_data, "scheda");
                var i18n = this.getView().getModel('i18n');

                var oType = new sap.ui.model.type.DateTime({source: {pattern: "yyyy-MM-dd HH:mm:ss Z"}});
                var oDateFormat = sap.ui.core.format.DateFormat.getInstance({pattern: "MM/dd/yyyy"});

                var t = this.getView().byId('tabella');
                const cells = [];

                macchina_data.loadData(json_file_path)
                    .then(
                        () => {

                            var dati = macchina_data.getData()

                            document.title = i18n.getResourceBundle().getText('title') + ' > ' + dati.nome

                            dati.columns.forEach((column, idx) => {
                                t.addColumn(new sap.m.Column({
                                    header: new sap.m.Label({text: column.label}),
                                    // minScreenWidth: 'Desktop',
                                    // demandPopin: idx > 5
                                }))

                                switch (column.type) {

                                    case 'boolean':
                                        cells.push(new sap.ui.core.Icon({
                                            src: {
                                                path: column.template,
                                                formatter: function (v) {
                                                    if (v) {
                                                        return 'sap-icon://accept'
                                                    } else if (v === false) {
                                                        return 'sap-icon://decline'
                                                    }
                                                }
                                            },
                                            color: {
                                                path: column.template,
                                                formatter: function (v) {
                                                    if (v) {
                                                        return '#3fa45b'
                                                    } else if (v === false) {
                                                        return '#C00'
                                                    } else {
                                                        return ''
                                                    }
                                                }
                                            }

                                        }))
                                        break;

                                    case 'date':
                                        cells.push(new sap.m.Text({
                                            text: {
                                                path: column.template,
                                                formatter: function (d) {
                                                    return d ? oDateFormat.format(new Date(d)) : null;
                                                },
                                                wrapping: false
                                            }
                                        }))
                                        break;

                                    default:
                                        cells.push(new sap.m.Text({
                                            text: "{" + column.template + "}",
                                            wrapping: false
                                        }))
                                }

                            });
                            //  Inserisco gli status in maniera random
                            const statuses = ['Success', 'Warning', 'Error', 'Information']
                            dati.rows.forEach(d => {
                                d.status = statuses[Math.floor(Math.random() * statuses.length)];
                            })
                            //  Tabella
                            t.bindItems('/rows', new sap.m.ColumnListItem({
                                cells: cells,
                                highlight: '{= ${status}}',
                                //  Custom data per colorare righe
                                // customData: {
                                //     key: 'status',
                                //     value: '{= ${status}}',
                                //     writeToDom: true
                                // }
                            }));
                            t.setModel(macchina_data);
                            // t.setAutoPopinMode(true)
                            t.setFixedLayout(false);
                            t.setAlternateRowColors(true);

                            //  Micorchart
                            var m = this.getView().byId('microchart');
                            m.setModel(macchina_data)

                            // var ml = this.getView().byId('macchina-list');
                            // ml.setModel(macchina_data)

                        }
                    )
            },
            /**
             * Inizializzazione e render del gauge
             */
            gauge_init: function () {
                var gauge_min = 0;
                var gauge_max = 380

                var intervals = {
                    min: 0,
                    max: 380,
                    error_min: 0,
                    error_max: 90
                }

                var gauge = new RadialGauge({
                    renderTo: 'canvas-id',
                    width: 222,
                    height: 222,
                    units: "",
                    minValue: intervals.min,
                    startAngle: 180,
                    ticksAngle: 180,
                    valueBox: false,
                    maxValue: intervals.max,
                    value: 0,
                    majorTicks: [
                        "0",
                        "76",
                        "152",
                        "228",
                        "304",
                        "380"
                    ],
                    minorTicks: 2,
                    strokeTicks: true,
                    highlights: [
                        {
                            from: intervals.error_min,
                            to: intervals.error_max,
                            color: "#C00"
                        },
                        {
                            "from": 90,
                            "to": 152,
                            "color": "rgba(255, 255, 0, .75)"
                        },
                        {
                            "from": 152,
                            "to": 380,
                            "color": "#3fa45b"
                        }
                    ],
                    colorPlate: "rgba(240, 240, 240, 1)",
                    // colorPlate: "transparent",
                    borderShadowWidth: 0,
                    borders: false,
                    needleType: "arrow",
                    needleStart: 1,
                    needleWidth: 3,
                    needleCircleSize: 7,
                    needleCircleOuter: true,
                    needleCircleInner: false,
                    animationDuration: 1000,
                    animationRule: "dequad" //"linear"
                }).draw();

                this.gauge_update(gauge, intervals)

                setInterval(() => {
                    this.gauge_update(gauge, intervals)
                }, 10000);
            },

            gauge_update: function (gauge, intervals) {
                gauge.value = this.random_number(20, 180)
                var status = document.querySelector('.status-tile');
                status.classList.remove('status-tile--error');
                status.classList.remove('status-tile--success');
                var is_error = gauge.value >= intervals.error_min && gauge.value <= intervals.error_max;
                status.classList.add(is_error ? 'status-tile--error' : 'status-tile--success');
                var icon_path = 'sap-icon://message-success';
                if (is_error) {
                    document.querySelector('.status-tile__label--error').style.display = 'block';
                    document.querySelector('.status-tile__label--success').style.display = 'none';
                    icon_path = 'sap-icon://message-warning'
                } else {
                    document.querySelector('.status-tile__label--error').style.display = 'none';
                    document.querySelector('.status-tile__label--success').style.display = 'block';
                }

                // this.getView().byId('status--icon__icon').setSrc(icon_path);

            },

            random_number: function (min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1)) + min;
            },
            formatter: formatter,

            /**
             * Convenience method for getting the view model by name in every controller of the application.
             * @public
             * @param {string} sName the model name
             * @returns {sap.ui.model.Model} the model instance
             */
            getModel: function (sName) {
                return this.getView().getModel(sName);
            },

            /**
             * Convenience method for setting the view model in every controller of the application.
             * @public
             * @param {sap.ui.model.Model} oModel the model instance
             * @param {string} sName the model name
             * @returns {sap.ui.mvc.View} the view instance
             */
            setModel: function (oModel, sName) {
                return this.getView().setModel(oModel, sName);
            },

            /**
             * Convenience method for getting the resource bundle.
             * @public
             * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
             */
            getResourceBundle: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

            /**
             * Method for navigation to specific view
             * @public
             * @param {string} psTarget Parameter containing the string for the target navigation
             * @param {Object.<string, string>} pmParameters? Parameters for navigation
             * @param {boolean} pbReplace? Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
             */
            navTo: function (psTarget, pmParameters, pbReplace) {
                this.getRouter().navTo(psTarget, pmParameters, pbReplace);
            },

            getRouter: function () {
                return UIComponent.getRouterFor(this);
            },

            onNavBack: function () {
                var sPreviousHash = History.getInstance().getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.back();
                } else {
                    this.getRouter().navTo("appHome", {}, true /*no history*/);
                }
            },

            onDialogWithSizePress: function () {
                if (!this.oFixedSizeDialog) {
                    const button_template = new Button({
                        text: '{azioni>label}',
                        type: 'Emphasized'
                    });
                    const grid = new Grid({
                        content: {
                            path: 'azioni>/azioni',
                            template: button_template
                        }
                    });

                    this.oFixedSizeDialog = new Dialog({
                        title: "Funzioni ordine attivo",
                        // contentWidth: "80%",
                        // contentHeight: "80%",
                        content: grid,
                        endButton: new Button({
                            text: "Chiudi",
                            press: function () {
                                this.oFixedSizeDialog.close();
                            }.bind(this)
                        })
                    });

                    //to get access to the controller's model
                    this.getView().addDependent(this.oFixedSizeDialog);
                }

                this.oFixedSizeDialog.open();
            },
        });
    }
);
