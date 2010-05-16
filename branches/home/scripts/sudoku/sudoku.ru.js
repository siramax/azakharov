/**
 * Codepage dependent resources
 */
m = {
    buttons: {
        solve:  { label: 'Решить', note: "Решение может занимать некоторое время (от нескольких секунд до 5 минут на слабых машинах )", },
        step:   { label: 'Шаг' },
        help:   { label: 'Что это?' },
        stats:  { label: 'Статистика' },
        clear:  { label: 'Очистить' },
        diag:   { label: 'Учитывать диагонали' },
        import: { label: 'Импорт' },
        export: { label: 'Экспорт' }
    },
    inputNumber: "Введите число для ячейки ",
    inputEN: "Введите число для этой ячейки ", //!< For Empty Number
    errors: {
        empty:                                          "Пусто!",
        linesNotEqual:      function( y, w ) { return   "Число строк не равно " + w + "!" ; },
        columnsNotEqual:    function( y, w ) { return   "Число столбцов в строке "+( y+1 )+" не равно " + w + "!"; },
        notFound:                                       "Cannot find target field",
        noField:                                        "There is no field"
    }
}
    