sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/core/UIComponent","it/horsa/gualapack/macchina/model/formatter","sap/ui/model/json/JSONModel","sap/m/Button","sap/m/Dialog","sap/m/List","sap/m/StandardListItem","sap/ui/layout/Grid","sap/m/FlexBox","./SqlFieldType","./MesServices","it/horsa/gualapack/macchina/control/Info"],function(e,t,n,i,o,a,s,l,d,r,c,u,h,p){"use strict";return e.extend("it.horsa.gualapack.macchina.controller.BaseController",{onInit:function(){const e=this.getOwnerComponent().getModel("prova");console.log(`%cBaseController onInit`,`border:1px solid black;color:black;padding:2px 4px;`,`prova`,e);let t=new Date;t.setDate(t.getDate()+1);t=t.toISOString().substring(0,10);let n=document.location.hash.split("/").pop();n=n||"stampa";this.pars={data_inizio:(new Date).toISOString().substring(0,10),data_fine:t,cdl:n};h("cdl").then(e=>{const t=new sap.ui.model.json.JSONModel;t.setData(e);this.getView().setModel(t,"cdl");this.pars.cdl=e.cdl.find(e=>e.key===n)});h("orders").then(e=>this.ordini(e));h(n).then(e=>this.cdl(e))},onAfterRendering:function(){this.afterRendering=true;this.infos()},infos:function(){if(this.getModel("scheda")){const e=document.querySelector("#"+this.getView().sId);if(!e){return}const t=this.getModel("scheda");t.getProperty("/stazione/info").forEach((e,t)=>{this.getView().byId("stazione__info").insertItem(new p({label:e.key,text:e.value,type:typeof e.value,size:"L"}),t)});t.getProperty("/stazione/data").forEach((e,t)=>{this.getView().byId("stazione__data").insertItem(new p({label:e.key,text:e.value,type:typeof e.value}),t)});t.getProperty("/macchina/info").forEach((e,t)=>{this.getView().byId("graph__info").insertItem(new p({label:e.key,text:e.value,type:typeof e.value}),t)})}},ordini:function(e){const t=[];const n=new sap.ui.model.json.JSONModel;n.setData(e);this.getView().setModel(n,"ordini");var i=this.getView().byId("tabella");e.Rowsets.Rowset[0].Columns.Column.forEach((e,n)=>{i.addColumn(new sap.m.Column({header:new sap.m.Label({text:e.Name}),hAlign:e.SQLDataType>=3&&e.SQLDataType<10?"Right":"Left"}));t.push(u(e))});i.setModel(n);i.bindItems("/Rowsets/Rowset/0/Row",new sap.m.ColumnListItem({cells:t}));const o=sap.ui.core.format.DateFormat.getInstance({pattern:"dd-MM-yyyy"});i.setHeaderText("Ordini"+" dal "+o.format(new Date(this.pars.data_inizio))+" al "+o.format(new Date(this.pars.data_fine)));i.setFixedLayout(false);i.setAlternateRowColors(true)},cdl:function(e){const t=new sap.ui.model.json.JSONModel(e);this.setModel(t,"scheda");const n=this.getModel("i18n");document.title=e.nome;var i=this.getView().byId("microchart");i.setModel(t);if(this.afterRendering){this.infos()}},gauge_change:function(e){const t=this.random_number(20,180);e.oSource.value=t;e.oSource.text=t>90?"In funzione":"Fermo Rispetto Qualità";e.oSource.time=this.random_number(1,10)+" min."},random_number:function(e,t){e=Math.ceil(e);t=Math.floor(t);return Math.floor(Math.random()*(t-e+1))+e},formatter:i,getModel:function(e){return this.getView().getModel(e)},setModel:function(e,t){return this.getView().setModel(e,t)},getResourceBundle:function(){return this.getOwnerComponent().getModel("i18n").getResourceBundle()},navTo:function(e,t,n){this.getRouter().navTo(e,t,n)},getRouter:function(){return n.getRouterFor(this)},onNavBack:function(){var e=t.getInstance().getPreviousHash();if(e!==undefined){window.history.back()}else{this.getRouter().navTo("appHome",{},true)}},menu_TTS:function(){if(!this.TTS_dialog){const e=e=>new a({text:"{scheda>text}",type:e||"Default",width:"100%"});const t=new sap.ui.layout.FixFlex({fixContent:[new sap.m.Title({text:"Ordini",level:"H1"}).addStyleClass("grid_title"),new r({defaultSpan:"XL6 L6 M12 S12",content:{path:"scheda>/ordini",template:e()}})]}).addStyleClass("ordini_bg");const n=new sap.ui.layout.FixFlex({fixContent:[new sap.m.Title({text:"Funzioni",level:"H1"}).addStyleClass("grid_title"),new r({defaultSpan:"XL4 L4 M6 S12",content:{path:"scheda>/funzioni",template:e()}})]}).addStyleClass("funzioni_bg");const i=[t,n];const o=new c({items:i});this.TTS_dialog=new s({title:"Menu TTS",content:o,endButton:new a({text:"Chiudi",press:function(){this.TTS_dialog.close()}.bind(this)})});this.getView().addDependent(this.TTS_dialog)}this.TTS_dialog.open()},menu_funzioniOrdineAttivo:function(){if(!this.funzioniOrdineAttivo_dialog){const e=e=>new a({text:"{scheda>text}",type:e||"Default",width:"100%"});this.funzioniOrdineAttivo_dialog=new s({title:"Funzioni ordine attivo",content:new r({defaultSpan:"XL4 L4 M6 S12",content:{path:"scheda>/funzioni_ordine_attivo",template:e()}}),endButton:new a({text:"Chiudi",press:function(){this.funzioniOrdineAttivo_dialog.close()}.bind(this)})});this.getView().addDependent(this.funzioniOrdineAttivo_dialog)}this.funzioniOrdineAttivo_dialog.open()},menu_scelte:function(){if(!this.scelte_dialog){const e=new c({justifyContent:"SpaceBetween",alignItems:"Center",items:[new sap.m.Label({text:"Data inizio"}).addStyleClass("modal_label"),new sap.m.DatePicker({placeholder:"Inserisci data inizio",value:this.pars.data_inizio,valueFormat:"yyyy-MM-dd",displayFormat:"long"}).addStyleClass("modal_text")]});const t=new c({justifyContent:"SpaceBetween",alignItems:"Center",fitContainer:true,items:[new sap.m.Label({text:"Data fine"}).addStyleClass("modal_label"),new sap.m.DatePicker({placeholder:"Inserisci data fine",value:this.pars.data_fine,valueFormat:"yyyy-MM-dd",displayFormat:"long"}).addStyleClass("modal_text")]});const n=new c({justifyContent:"SpaceBetween",alignItems:"Center",fitContainer:true,items:[new sap.m.Label({text:"Centro di lavoro"}).addStyleClass("modal_label"),new sap.m.ComboBox({placeholder:"Scegli centro di lavoro",selectedKey:this.pars.cdl.key,selectionChange:function(e){const t=sap.ui.core.UIComponent.getRouterFor(this);t.navTo(e.getParameter("selectedItem").getKey())}.bind(this),items:{path:"cdl>/cdl",template:new sap.ui.core.Item({key:"{cdl>key}",text:"{cdl>text}"})}}).addStyleClass("modal_text")]});const i=new c({justifyContent:"SpaceBetween",alignItems:"Center",fitContainer:true,items:[new sap.m.Label({text:"Solo ordini aperti"}).addStyleClass("modal_label"),new sap.m.CheckBox({}).addStyleClass("modal_text")]});const o=new c({direction:"Column",items:[e,t,i,n]}).addStyleClass("modal_scelte");this.scelte_dialog=new s({title:"Scelte",content:o,beginButton:new a({type:sap.m.ButtonType.Emphasized,text:"OK",press:function(){this.scelte_dialog.close()}.bind(this)}),endButton:new a({text:"Chiudi",press:function(){this.scelte_dialog.close()}.bind(this)})});this.getView().addDependent(this.scelte_dialog)}this.scelte_dialog.open()},home:function(){const e=sap.ui.core.UIComponent.getRouterFor(this);e.navTo("home")},estrusione:function(e){const t=sap.ui.core.UIComponent.getRouterFor(this);if(document.location.hash==="#/estrusione"){t.navTo("stampa")}else{t.navTo("estrusione")}}})});