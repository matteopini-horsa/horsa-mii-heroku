sap.ui.define([
    "sap/ui/core/Control"
], function (Control) {
    "use strict";
    return Control.extend("it.horsa.gualapack.macchina.control.Gauge", {
        metadata : {
            properties: {
                data: {
                    type: 'object'
                }
            },
            events: {
                change: {enablePreventDefault : true}

            }
        },
        value: 0,
        min: 0,
        text: '',
        gauge: null,
        intervals: {
            min: 0,
            max: 380,
            error_min: 0,
            error_max: 90
        },
        init : function () {
            this._html = new sap.ui.core.HTML({content:
                '<div class="status-tile__wrapper flex" id="canvas--wrapper-' + this.getId() + '">' +
                    '<div class="status-tile__gauge">' +
                        '<div class="canvas-container">' +
                            '<canvas id="canvas-' + this.getId() + '"></canvas>' +
                        '</div>' +
                    '</div>' +
                    '<div class="status-tile__status">' +
                        '<div class="flex--v" style="height:100%">' +
                            '<div class="status-tile__label">' +
                                '<span class="status-tile__label--error" style="display: block;"></span>' +
                                '<span class="status-tile__label--success" style="display:none"></span>' +
                            '</div>' +
                        '<div class="status-tile__icon">' +
                        '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            })
        },
        renderer : function (oRM, oControl) {
            this.id = Math.random().toString().replace('.', '');
            oRM.renderControl(oControl._html)
        },
        onAfterRendering: function() {
            if(sap.ui.core.Control.prototype.onAfterRendering) {
                sap.ui.core.Control.prototype.onAfterRendering.apply(this,arguments);
            }

            this.gauge = new RadialGauge({
                renderTo: 'canvas-' + this.getId(),
                width: 222,
                height: 222,
                units: "",
                minValue: this.intervals.min,
                startAngle: 180,
                ticksAngle: 180,
                valueBox: false,
                maxValue: this.intervals.max,
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
                        from: this.intervals.error_min,
                        to: this.intervals.error_max,
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

            this.gauge_update();

            setInterval(() => {
                this.gauge_update();
            }, 10000)

        },
        gauge_update: function() {
            this.fireChange();
            this.gauge.value = this.value;
            const page = document.querySelector('#canvas--wrapper-' + this.getId());
            var status = page.querySelector('.status-tile__gauge');
            page.classList.remove('status-tile--error');
            page.classList.remove('status-tile--success');
            var is_error = this.value >= this.intervals.error_min && this.value <= this.intervals.error_max;
            page.classList.add(is_error ? 'status-tile--error' : 'status-tile--success');
            var icon_path = 'sap-icon://message-success';

            page.querySelector('.status-tile__icon').innerHTML = this.time;
            if (is_error) {
                page.querySelector('.status-tile__label--error').style.display = 'block';
                page.querySelector('.status-tile__label--error').innerHTML = this.text;
                page.querySelector('.status-tile__label--success').style.display = 'none';
                icon_path = 'sap-icon://message-warning'
            } else {
                page.querySelector('.status-tile__label--error').style.display = 'none';
                page.querySelector('.status-tile__label--success').style.display = 'block';
                page.querySelector('.status-tile__label--success').innerHTML = this.text;
            }

        }
    });
});
