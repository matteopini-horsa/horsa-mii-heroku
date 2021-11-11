sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/core/UIComponent","it/horsa/gualapack/macchina/model/formatter","sap/ui/model/json/JSONModel","sap/m/Button","sap/m/Dialog","sap/m/List","sap/m/StandardListItem","sap/ui/layout/Grid"],function(e,t,a,o,n,i,s,r,l,u){"use strict";return e.extend("it.horsa.gualapack.macchina.controller.BaseController",{onAfterRendering:function(){this.actions();this.gauge_init();this.macchina_load_data("resources/stampa.json")},actions:function(){const e=[];for(let t=0;t<10;t++){e.push({id:t,label:"Azione personalizzata "+t})}var t=new sap.ui.model.json.JSONModel({azioni:e});this.getView().setModel(t,"azioni");const a=this.getView().byId("button-ordini");const o=new sap.m.Menu;e.forEach(e=>{o.addItem(new sap.m.MenuItem({text:e.label}))});a.setMenu(o)},macchina_load_data:function(e){var t=new sap.ui.model.json.JSONModel;this.getView().setModel(t,"scheda");var a=this.getView().getModel("i18n");var o=new sap.ui.model.type.DateTime({source:{pattern:"yyyy-MM-dd HH:mm:ss Z"}});var n=sap.ui.core.format.DateFormat.getInstance({pattern:"MM/dd/yyyy"});var i=this.getView().byId("tabella");const s=[];t.loadData(e).then(()=>{var e=t.getData();document.title=a.getResourceBundle().getText("title")+" > "+e.nome;e.columns.forEach((e,t)=>{i.addColumn(new sap.m.Column({header:new sap.m.Label({text:e.label})}));switch(e.type){case"boolean":s.push(new sap.ui.core.Icon({src:{path:e.template,formatter:function(e){if(e){return"sap-icon://accept"}else if(e===false){return"sap-icon://decline"}}},color:{path:e.template,formatter:function(e){if(e){return"#3fa45b"}else if(e===false){return"#C00"}else{return""}}}}));break;case"date":s.push(new sap.m.Text({text:{path:e.template,formatter:function(e){return e?n.format(new Date(e)):null},wrapping:false}}));break;default:s.push(new sap.m.Text({text:"{"+e.template+"}",wrapping:false}))}});const o=["Success","Warning","Error","Information"];e.rows.forEach(e=>{e.status=o[Math.floor(Math.random()*o.length)]});i.bindItems("/rows",new sap.m.ColumnListItem({cells:s,highlight:"{= ${status}}"}));i.setModel(t);i.setFixedLayout(false);var r=this.getView().byId("microchart");r.setModel(t)})},gauge_init:function(){var e=0;var t=380;var a={min:0,max:380,error_min:0,error_max:90};var o=new RadialGauge({renderTo:"canvas-id",width:222,height:222,units:"",minValue:a.min,startAngle:180,ticksAngle:180,valueBox:false,maxValue:a.max,value:0,majorTicks:["0","76","152","228","304","380"],minorTicks:2,strokeTicks:true,highlights:[{from:a.error_min,to:a.error_max,color:"#C00"},{from:90,to:152,color:"rgba(255, 255, 0, .75)"},{from:152,to:380,color:"#3fa45b"}],colorPlate:"rgba(240, 240, 240, 1)",borderShadowWidth:0,borders:false,needleType:"arrow",needleStart:1,needleWidth:3,needleCircleSize:7,needleCircleOuter:true,needleCircleInner:false,animationDuration:1e3,animationRule:"dequad"}).draw();this.gauge_update(o,a);setInterval(()=>{this.gauge_update(o,a)},1e4)},gauge_update:function(e,t){e.value=this.random_number(20,180);var a=document.querySelector(".status-tile");a.classList.remove("status-tile--error");a.classList.remove("status-tile--success");var o=e.value>=t.error_min&&e.value<=t.error_max;a.classList.add(o?"status-tile--error":"status-tile--success");var n="sap-icon://message-success";if(o){document.querySelector(".status-tile__label--error").style.display="block";document.querySelector(".status-tile__label--success").style.display="none";n="sap-icon://message-warning"}else{document.querySelector(".status-tile__label--error").style.display="none";document.querySelector(".status-tile__label--success").style.display="block"}},random_number:function(e,t){e=Math.ceil(e);t=Math.floor(t);return Math.floor(Math.random()*(t-e+1))+e},formatter:o,getModel:function(e){return this.getView().getModel(e)},setModel:function(e,t){return this.getView().setModel(e,t)},getResourceBundle:function(){return this.getOwnerComponent().getModel("i18n").getResourceBundle()},navTo:function(e,t,a){this.getRouter().navTo(e,t,a)},getRouter:function(){return a.getRouterFor(this)},onNavBack:function(){var e=t.getInstance().getPreviousHash();if(e!==undefined){window.history.back()}else{this.getRouter().navTo("appHome",{},true)}},onDialogWithSizePress:function(){if(!this.oFixedSizeDialog){const e=new i({text:"{azioni>label}",type:"Emphasized"});const t=new u({content:{path:"azioni>/azioni",template:e}});this.oFixedSizeDialog=new s({title:"Funzioni ordine attivo",content:t,endButton:new i({text:"Chiudi",press:function(){this.oFixedSizeDialog.close()}.bind(this)})});this.getView().addDependent(this.oFixedSizeDialog)}this.oFixedSizeDialog.open()}})});