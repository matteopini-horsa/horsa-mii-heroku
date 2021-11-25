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
        "sap/m/FlexBox",
        "./SqlFieldType",
        "./MesServices",
        "it/horsa/gualapack/macchina/control/Info"
    ],
    function (Controller, History, UIComponent, formatter, JSONModel, Button, Dialog, List, StandardListItem, Grid, FlexBox, SqlFieldType, MesServices, Info) {
        "use strict";

        return Controller.extend("it.horsa.gualapack.macchina.controller.BaseController", {
            onInit: function () {
                const prova = this.getOwnerComponent().getModel("prova")
                console.log(`%cBaseController onInit`, `border:1px solid black;color:black;padding:2px 4px;`, `prova`, prova);
                let tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1)
                tomorrow = tomorrow.toISOString().substring(0, 10);

                let hash = document.location.hash.split('/').pop();
                hash = hash || 'stampa';

                this.pars = {
                    data_inizio: new Date().toISOString().substring(0, 10),
                    data_fine: tomorrow,
                    cdl: hash
                }


                MesServices('cdl')
                    .then(
                        (cdl_data) => {
                            const cdl = new sap.ui.model.json.JSONModel();
                            cdl.setData(cdl_data);
                            this.getView().setModel(cdl, "cdl");
                            this.pars.cdl = cdl_data.cdl.find(c => c.key === hash)
                        }
                    )
                MesServices('orders')
                    .then(
                        (orders_data) => this.ordini(orders_data)
                    );

                MesServices(hash)
                    .then(
                        (cdl_data) => this.cdl(cdl_data)
                    )

            },
            onAfterRendering: function () {
                this.afterRendering = true;
                this.infos();

            },
            infos: function () {
                if (this.getModel('scheda')) {
                    const page = document.querySelector('#' + this.getView().sId);
                    if (!page) {
                        return
                    }

                    const cdl_data = this.getModel('scheda');

                    //  Info
                    cdl_data.getProperty('/stazione/info').forEach((info, idx) => {
                        // page.querySelector('#stazione__info').append(this.info(i, {size: 'L'}))
                        this.getView().byId('stazione__info').insertItem(new Info({
                            label: info.key,
                            text: info.value,
                            type: typeof info.value,
                            size: 'L'
                        }), idx)
                    })

                    //  Data
                    cdl_data.getProperty('/stazione/data').forEach((info, idx) => {
                        // page.querySelector('#stazione__data').append(this.info(i))
                        this.getView().byId('stazione__data').insertItem(new Info({
                            label: info.key,
                            text: info.value,
                            type: typeof info.value
                        }), idx)
                    })

                    //   Info
                    cdl_data.getProperty('/macchina/info').forEach((info, idx) => {
                        // page.querySelector('#graph__info').append(this.info(i))
                        this.getView().byId('graph__info').insertItem(new Info({
                            label: info.key,
                            text: info.value,
                            type: typeof info.value
                        }), idx)
                    })
                }
            },
            ordini: function (orders_data) {

                const tab_columns = [];
                const orders = new sap.ui.model.json.JSONModel();
                orders.setData(orders_data);
                this.getView().setModel(orders, "ordini");

                var t = this.getView().byId('tabella');

                orders_data.Rowsets.Rowset[0].Columns.Column.forEach((column, idx) => {

                    //  Creazione colonna
                    t.addColumn(new sap.m.Column({
                        header: new sap.m.Label({text: column.Name}),
                        hAlign: (column.SQLDataType >= 3 && column.SQLDataType < 10) ? 'Right' : 'Left'
                    }))

                    //  Definizione tipi colonna
                    tab_columns.push(SqlFieldType(column));

                });

                //  Tabella
                t.setModel(orders);
                t.bindItems('/Rowsets/Rowset/0/Row', new sap.m.ColumnListItem({
                    cells: tab_columns
                }));
                // valueFormat: "yyyy-MM-dd",
                //     displayFormat: 'long'
                const oDateFormat = sap.ui.core.format.DateFormat.getInstance({pattern: "dd-MM-yyyy"});
                t.setHeaderText('Ordini' + ' dal ' + oDateFormat.format(new Date(this.pars.data_inizio)) + ' al ' + oDateFormat.format(new Date(this.pars.data_fine)));
                t.setFixedLayout(false);
                t.setAlternateRowColors(true);

            },
            cdl: function (cdl_data) {

                const cdl = new sap.ui.model.json.JSONModel(cdl_data);
                this.setModel(cdl, 'scheda');

                const i18n = this.getModel('i18n');
                document.title = cdl_data.nome

                //  Microchart
                var m = this.getView().byId('microchart');
                m.setModel(cdl)

                if (this.afterRendering) {
                    this.infos();
                }
            },
            /**
             * Aggiornamento gauge
             */
            gauge_change: function (e) {
                const value = this.random_number(20, 180);
                e.oSource.value = value;
                e.oSource.text = value > 90 ? 'In funzione' : 'Fermo Rispetto Qualità'
                e.oSource.time = this.random_number(1, 10) + ' min.'
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

            menu_TTS: function () {
                if (!this.TTS_dialog) {
                    const button_template = (type) => {

                        return new Button({
                            text: '{scheda>text}',
                            type: type || 'Default',
                            width: '100%'
                        })
                    };

                    const ordini = new sap.ui.layout.FixFlex({
                        fixContent: [
                            new sap.m.Title({
                                text: 'Ordini',
                                level: 'H1'
                            }).addStyleClass('grid_title'),
                            new Grid({
                                defaultSpan: 'XL6 L6 M12 S12',
                                content: {
                                    path: 'scheda>/ordini',
                                    template: button_template()
                                }
                            })
                        ]
                    }).addStyleClass('ordini_bg');

                    const funzioni = new sap.ui.layout.FixFlex({
                        fixContent: [
                            new sap.m.Title({
                                text: 'Funzioni',
                                level: 'H1'
                            }).addStyleClass('grid_title'),
                            new Grid({
                                defaultSpan: 'XL4 L4 M6 S12',
                                content: {
                                    path: 'scheda>/funzioni',
                                    template: button_template()
                                }
                            })
                        ]
                    }).addStyleClass('funzioni_bg')

                    const flex = [
                        ordini,
                        funzioni
                    ];
                    const grid = new FlexBox({
                        items: flex
                    });

                    this.TTS_dialog = new Dialog({
                        title: "Menu TTS",
                        // contentWidth: "80%",
                        // contentHeight: "80%",
                        content: grid,
                        endButton: new Button({
                            text: "Chiudi",
                            press: function () {
                                this.TTS_dialog.close();
                            }.bind(this)
                        })
                    });

                    this.getView().addDependent(this.TTS_dialog);
                }

                this.TTS_dialog.open();
            },
            menu_funzioniOrdineAttivo: function () {
                if (!this.funzioniOrdineAttivo_dialog) {
                    const button_template = (type) => {
                        return new Button({
                            text: '{scheda>text}',
                            type: type || 'Default',
                            width: '100%'
                        })
                    };

                    this.funzioniOrdineAttivo_dialog = new Dialog({
                        title: "Funzioni ordine attivo",
                        content: new Grid({
                            defaultSpan: 'XL4 L4 M6 S12',
                            content: {
                                path: 'scheda>/funzioni_ordine_attivo',
                                template: button_template()
                            }
                        }),
                        endButton: new Button({
                            text: "Chiudi",
                            press: function () {
                                this.funzioniOrdineAttivo_dialog.close();
                            }.bind(this)
                        })
                    });

                    this.getView().addDependent(this.funzioniOrdineAttivo_dialog);
                }
                this.funzioniOrdineAttivo_dialog.open();
            },
            menu_scelte: function () {

                if (!this.scelte_dialog) {

                    // //  Data inizio
                    const data_inizio = new FlexBox({
                        justifyContent: 'SpaceBetween',
                        alignItems: 'Center',
                        items: [
                            new sap.m.Label({
                                text: 'Data inizio'
                            }).addStyleClass('modal_label'),
                            new sap.m.DatePicker({
                                placeholder: 'Inserisci data inizio',
                                value: this.pars.data_inizio,
                                valueFormat: "yyyy-MM-dd",
                                displayFormat: 'long'
                            }).addStyleClass('modal_text')
                        ]
                    })
                    //  Data fine
                    const data_fine = new FlexBox({
                        justifyContent: 'SpaceBetween',
                        alignItems: 'Center',
                        fitContainer: true,
                        items: [
                            new sap.m.Label({
                                text: 'Data fine'
                            }).addStyleClass('modal_label'),
                            new sap.m.DatePicker({
                                placeholder: 'Inserisci data fine',
                                value: this.pars.data_fine,
                                valueFormat: "yyyy-MM-dd",
                                displayFormat: 'long'
                            }).addStyleClass('modal_text')
                        ]
                    })

                    //  Centro di lavoro
                    const cdl = new FlexBox({
                        justifyContent: 'SpaceBetween',
                        alignItems: 'Center',
                        fitContainer: true,
                        items: [
                            new sap.m.Label({
                                text: 'Centro di lavoro'
                            }).addStyleClass('modal_label'),
                            new sap.m.ComboBox({
                                placeholder: 'Scegli centro di lavoro',
                                selectedKey: this.pars.cdl.key,
                                selectionChange: function (e) {
                                    const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                                    oRouter.navTo(e.getParameter('selectedItem').getKey());
                                }.bind(this),
                                items: {
                                    path: 'cdl>/cdl',
                                    template: new sap.ui.core.Item({
                                        key: "{cdl>key}",
                                        text: "{cdl>text}",
                                    })
                                }
                            }).addStyleClass('modal_text')
                        ]
                    })
                    //  Solo ordini aperti?
                    const ordini_aperti = new FlexBox({
                        justifyContent: 'SpaceBetween',
                        alignItems: 'Center',
                        fitContainer: true,
                        items: [
                            new sap.m.Label({
                                text: 'Solo ordini aperti'
                            }).addStyleClass('modal_label'),
                            new sap.m.CheckBox({}).addStyleClass('modal_text')
                        ]
                    })

                    const grid = new FlexBox({
                        direction: 'Column',
                        items: [
                            data_inizio,
                            data_fine,
                            ordini_aperti,
                            cdl
                        ]
                    }).addStyleClass('modal_scelte');

                    this.scelte_dialog = new Dialog({
                        title: "Scelte",
                        content: grid,
                        beginButton: new Button({
                            type: sap.m.ButtonType.Emphasized,
                            text: "OK",
                            press: function () {
                                this.scelte_dialog.close();
                            }.bind(this)
                        }),
                        endButton: new Button({
                            text: "Chiudi",
                            press: function () {
                                this.scelte_dialog.close();
                            }.bind(this)
                        })
                    });

                    //to get access to the controller's model
                    this.getView().addDependent(this.scelte_dialog);
                }
                this.scelte_dialog.open();
            },
            home: function () {
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("home");
            },
            estrusione: function (oEvent) {
                const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                if (document.location.hash === '#/estrusione') {
                    oRouter.navTo("stampa");
                } else {
                    oRouter.navTo("estrusione");
                }
            },
        });
    }
);
