sap.ui.define(["sap/ui/core/format/DateFormat","sap/ui/core/format/NumberFormat"],function(t,e){const n=t.getInstance({pattern:"dd/MM/yyyy"});const a=e.getIntegerInstance();const r=e.getFloatInstance({maxFractionDigits:2,minFractionDigits:2});return function(t){if(t){switch(t.SQLDataType){case 3:return new sap.m.Text({text:{path:t.SourceColumn,formatter:function(t){return r.format(t)}},wrapping:false});case 4:return new sap.m.Text({text:{path:t.SourceColumn,formatter:function(t){return a.format(t)}},wrapping:false});case 91:case 93:return new sap.m.Text({text:{path:t.SourceColumn,formatter:function(t){return t?n.format(new Date(t)):null}},wrapping:false});default:return new sap.m.Text({text:"{"+t.SourceColumn+"}",wrapping:false})}}else{return new sap.m.Text({text:"",wrapping:false})}}});