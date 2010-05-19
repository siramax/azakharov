/**
 * Codepage dependent resources
 */
m = {
    buttons: {
        solve:  { label: 'Solve', note: "The decision may take some time (from several seconds to 5 minutes on slower machines)", },
        step:   { label: 'Step' },
        help:   { label: 'What is this?' },
        stats:  { label: 'Stats' },
        clear:  { label: 'Clear' },
        diag:   { label: 'Consider the diagonal' },
        _import: { label: 'Import', note: "Press once to get input textarea, press again to do import"  },
        _export: { label: 'Export' }
    },
    inputNumber: "Input the number for cell ",
    inputEN: "Input the number for this cell ", //!< For Empty Number
    errors: {
        empty:                                          "Empty!",
        linesNotEqual:      function( y, w ) { return   "Row number not equal " + w + "!" ; },
        columnsNotEqual:    function( y, w ) { return   "Columns number at row "+( y+1 )+" not equal " + w + "!"; },
        notFound:                                       "Cannot find target field",
        noField:                                        "There is no field"
    }
}
    