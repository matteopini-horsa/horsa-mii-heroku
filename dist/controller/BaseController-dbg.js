sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/routing/History",
        "sap/ui/core/UIComponent",
        "it/horsa/gualapack/macchina/model/formatter",
        "sap/ui/model/json/JSONModel",
        "../services/SqlFieldType",
        "../services/MesServices",
        "it/horsa/gualapack/macchina/control/Info",
        "../services/AppService"
    ],
    function (Controller, History, UIComponent, formatter, JSONModel, SqlFieldType, MesServices, Info, AppService) {
        "use strict";

        return Controller.extend("it.horsa.gualapack.macchina.controller.BaseController", {

            route: null,

            onInit: function () {
                AppService.init(this.getOwnerComponent());
                let tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1)
                tomorrow = tomorrow.toISOString().substring(0, 10);

                let hash = document.location.hash.split('/').pop();
                hash = hash || 'stampa';

                this.route = hash;

                this.pars = {
                    data_inizio: new Date().toISOString().substring(0, 10),
                    data_fine: tomorrow,
                    cdl: hash,
                    data_inizio_tmp: new Date().toISOString().substring(0, 10),
                    data_fine_tmp: tomorrow,
                    cdl_tmp: hash
                }

                const cdl_data = AppService.get('cdl');
                const cdl = new sap.ui.model.json.JSONModel();
                cdl.setData(cdl_data);
                this.getView().setModel(cdl, "cdl");
                this.pars.cdl = cdl_data.find(c => c.key === hash)
                this.pars.cdl_tmp = this.pars.cdl;

                MesServices(hash)
                    .then(
                        (scheda_data) => this.scheda(scheda_data)
                    )

                this.getRouter().getRoute(this.route).attachMatched(this._onRouteMatched, this);

            },
            _onRouteMatched: function () {

                if (sessionStorage.getItem('pars')) {
                    this.pars = JSON.parse(sessionStorage.getItem('pars'));
                    sessionStorage.removeItem('pars');
                }

                this.fetch_data({
                    params: [
                        this.pars.data_inizio,
                        this.pars.data_fine,
                        null,
                        this.route.charAt(0).toUpperCase() + this.route.substring(1)
                    ]
                });
            },
            onAfterRendering: function () {
                this.afterRendering = true;
                this.infos();

            },
            fetch_data: function (options) {
                MesServices('orders', options)
                    .then(
                        (orders_data) => this.ordini(orders_data)
                    );
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
                const cdl_data = this.getModel('scheda');
                const tab_columns = [];
                const orders = new sap.ui.model.json.JSONModel();

                const scheda = this.getModel('scheda').oData;

                if (scheda.patches) {
                    orders_data = this.patch_orders_data(orders_data, scheda.patches);
                }
                orders.setData(orders_data);
                this.getView().setModel(orders, "ordini");

                const t = this.getView().byId('tabella');

                if (t.getColCount() === 0) {

                    const i18n = this.getResourceBundle();
                    cdl_data.oData.columns.forEach((col, idx) => {
                        const column = orders_data.Rowsets.Rowset[0].Columns.Column.find(c => c.Name === col);
                        if (column) {
                            t.addColumn(new sap.m.Column({
                                header: new sap.m.Label({text: i18n.getText(column.Name) || column.Name}),
                                hAlign: (column.SQLDataType >= 3 && column.SQLDataType < 10) ? 'Right' : 'Left'
                            }))

                            tab_columns.push(SqlFieldType(column));
                        }
                    })

                    t.bindItems('/Rowsets/Rowset/0/Row', new sap.m.ColumnListItem({
                        cells: tab_columns
                    }));

                }

                //  Tabella
                t.setModel(orders);
                const oDateFormat = sap.ui.core.format.DateFormat.getInstance({pattern: "dd/MM/yyyy"});
                t.setHeaderText('Ordini' + ' dal ' + oDateFormat.format(new Date(this.pars.data_inizio)) + ' al ' + oDateFormat.format(new Date(this.pars.data_fine)));
                t.setFixedLayout(false);
                t.setAlternateRowColors(true);

            },
            scheda: function (cdl_data) {

                const scheda = new sap.ui.model.json.JSONModel(cdl_data);
                this.setModel(scheda, 'scheda');

                // const i18n = this.getModel('i18n');
                document.title = cdl_data.nome

                //  Microchart
                var m = this.getView().byId('microchart');
                m.setModel(scheda)

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

                        return new sap.m.Button({
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
                            new sap.ui.layout.Grid({
                                defaultSpan: 'XL6 L6 M12 S12',
                                content: {
                                    path: 'scheda>/ordini',
                                    template: button_template()
                                }
                            })
                        ]
                    }).addStyleClass('ordini_bg')
                        .setLayoutData(new sap.ui.layout.GridData({
                                span: "XL4 L4 M4 S6"
                            })
                        );

                    const funzioni = new sap.ui.layout.FixFlex({
                        fixContent: [
                            new sap.m.Title({
                                text: 'Funzioni',
                                level: 'H1'
                            }).addStyleClass('grid_title'),
                            new sap.ui.layout.Grid({
                                defaultSpan: 'XL4 L4 M6 S12',
                                content: {
                                    path: 'scheda>/funzioni',
                                    template: button_template()
                                }
                            })
                        ]
                    }).addStyleClass('funzioni_bg')
                        .setLayoutData(new sap.ui.layout.GridData({
                                span: "XL8 L8 M8 S6"
                            })
                        );

                    const flex = [
                        ordini,
                        funzioni
                    ];
                    // const grid = new sap.m.FlexBox({
                    //     items: flex
                    // });

                    const grid = new sap.ui.layout.Grid({
                        content: flex
                    });

                    this.TTS_dialog = new sap.m.Dialog({
                        title: "Menu TTS",
                        // contentWidth: "80%",
                        // contentHeight: "80%",
                        content: grid,
                        endButton: new sap.m.Button({
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
                        return new sap.m.Button({
                            text: '{scheda>text}',
                            type: type || 'Default',
                            width: '100%'
                        })
                    };

                    this.funzioniOrdineAttivo_dialog = new sap.m.Dialog({
                        title: "Funzioni ordine attivo",
                        content: new sap.ui.layout.Grid({
                            defaultSpan: 'XL4 L4 M6 S12',
                            content: {
                                path: 'scheda>/funzioni_ordine_attivo',
                                template: button_template()
                            }
                        }),
                        endButton: new sap.m.Button({
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
                    const data_inizio = new sap.m.FlexBox({
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
                                displayFormat: 'long',
                                change: function (e) {
                                    this.pars.data_inizio_tmp = e.getParameters('value').value;
                                }.bind(this),
                            }).addStyleClass('modal_text')
                        ]
                    })
                    //  Data fine
                    const data_fine = new sap.m.FlexBox({
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
                                displayFormat: 'long',
                                change: function (e) {
                                    this.pars.data_fine_tmp = e.getParameters('value').value;
                                }.bind(this)
                            }).addStyleClass('modal_text')
                        ]
                    })

                    //  Centro di lavoro
                    const cdl = new sap.m.FlexBox({
                        justifyContent: 'SpaceBetween',
                        alignItems: 'Center',
                        fitContainer: true,
                        items: [
                            new sap.m.Label({
                                text: 'Centro di lavoro'
                            }).addStyleClass('modal_label'),
                            new sap.m.ComboBox({
                                placeholder: 'Scegli centro di lavoro',
                                selectedKey: this.route,
                                selectionChange: function (e) {
                                    this.pars.cdl_tmp = e.getParameter('selectedItem').getKey();
                                }.bind(this),
                                items: {
                                    path: 'cdl>/',
                                    template: new sap.ui.core.Item({
                                        key: "{cdl>key}",
                                        text: "{cdl>text}",
                                    })
                                }
                            }).addStyleClass('modal_text')
                        ]
                    })
                    //  Solo ordini aperti?
                    const ordini_aperti = new sap.m.FlexBox({
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

                    const grid = new sap.m.FlexBox({
                        direction: 'Column',
                        items: [
                            data_inizio,
                            data_fine,
                            ordini_aperti,
                            cdl
                        ]
                    }).addStyleClass('modal_scelte');

                    this.scelte_dialog = new sap.m.Dialog({
                        title: "Scelte",
                        content: grid,
                        beforeOpen: function (o) {

                            if (o.getSource().getContent()[0].getItems().length) {
                                o.getSource().getContent()[0].getItems()[3].getItems()[1].setSelectedKey(this.route);
                                this.pars.cdl = this.route;
                                this.pars.cdl_tmp = this.route;
                            }
                        }.bind(this),
                        beginButton: new sap.m.Button({
                            type: sap.m.ButtonType.Emphasized,
                            text: "OK",
                            press: function () {
                                this.scelte_dialog.close();
                                this.pars.data_inizio = this.pars.data_inizio_tmp;
                                this.pars.data_fine = this.pars.data_fine_tmp;
                                if (this.route === this.pars.cdl_tmp) {
                                    this.fetch_data({
                                        params: [
                                            this.pars.data_inizio,
                                            this.pars.data_fine,
                                            null,
                                            this.pars.cdl_tmp.charAt(0).toUpperCase() + this.pars.cdl_tmp.substring(1)
                                        ]
                                    });
                                } else {
                                    this.pars.cdl = this.pars.cdl_tmp;
                                    const tmp = Object.assign({}, this.pars);
                                    delete tmp.cdl;
                                    delete tmp.cdl_tmp;
                                    sessionStorage.setItem('pars', JSON.stringify(tmp));
                                    const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                                    oRouter.navTo(this.pars.cdl);
                                }
                            }.bind(this)
                        }),
                        endButton: new sap.m.Button({
                            text: "Chiudi",
                            press: function () {
                                this.pars.cdl_tmp = this.pars.cdl;
                                this.pars.data_inizio_tmp = this.pars.data_inizio;
                                this.pars.data_fine_tmp = this.pars.data_fine;
                                this.scelte_dialog.close();
                            }.bind(this)
                        })
                    });

                    //to get access to the controller's model
                    this.getView().addDependent(this.scelte_dialog);
                }
                this.scelte_dialog.open();
            },
            patch_orders_data: function (orders_data, patches) {
                patches.forEach(patch => {
                    orders_data.Rowsets.Rowset[0].Columns.Column.push({
                        Name: patch,
                        SQLDataType: -999
                    })
                    if (orders_data.Rowsets.Rowset[0].hasOwnProperty('Row')) {
                        orders_data.Rowsets.Rowset[0].Row.forEach(r => r[patch] = ' ')
                    }
                })
                return orders_data;
            }
            // home: function () {
            //     const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            //     oRouter.navTo("home");
            // },
            // estrusione: function (oEvent) {
            //     const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            //     if (document.location.hash === '#/estrusione') {
            //         oRouter.navTo("stampa");
            //     } else {
            //         oRouter.navTo("estrusione");
            //     }
            // },
        });
    }
);
