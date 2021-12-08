sap.ui.define(
    [
        'sap/ui/core/format/DateFormat',
        'sap/ui/core/format/NumberFormat'
    ],
    function (date_format, number_format) {
        const oDateFormat = date_format.getInstance({pattern: "dd/MM/yyyy"});
        const oIntegerFormat = number_format.getIntegerInstance();
        const oFloatFormat = number_format.getFloatInstance({
            maxFractionDigits: 2,
            minFractionDigits: 2
        });

        //  Crea il template delle colonne in base al tipo di colonna definito da SQLDataType
        return function (column) {
            if (column) {
                switch (column.SQLDataType) {
                    // http://www.cs.toronto.edu/~nn/csc309/guide/pointbase/docs/html/htmlfiles/appendixedatatypecode.html
                    //  Decimal
                    case 3:
                        return new sap.m.Text({
                            text: {
                                path: column.SourceColumn,
                                formatter: function (n) {
                                    return oFloatFormat.format(n)
                                }
                            },
                            wrapping: false
                        })
                    //  Integer
                    case 4:
                        return new sap.m.Text({
                            text: {
                                path: column.SourceColumn,
                                formatter: function (n) {
                                    return oIntegerFormat.format(n)
                                }
                            },
                            wrapping: false
                        })
                    //  Date
                    case 91:
                    //  Timeestamp
                    case 93:
                        return new sap.m.Text({
                            text: {
                                path: column.SourceColumn,
                                formatter: function (d) {
                                    return d ? oDateFormat.format(new Date(d)) : null;
                                }
                            },
                            wrapping: false
                        })

                    default:
                        return new sap.m.Text({
                            text: "{" + column.SourceColumn + "}",
                            wrapping: false
                        })
                }
            } else {
                return new sap.m.Text({
                    text: '',
                    wrapping: false
                });
            }
        }
    }
)
