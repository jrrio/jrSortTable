# jrSortTable

You can use JavaScript to sort the columns of a data table directly on the client side, *i.e.* web browser. You just need to follow these steps:

1. Set the *class* attribute of the data tables with "sortable".
2. Place a script tag referring to  [jrSortTable_1.2.js](https://github.com/jrodgs/jrSortTable/blob/master/jrSortTable_1.2.js) just before the closing *body* tag.

    &lt;script type="text/javascript" src="path/jrSortTable_1.0.js">&lt;/script>
    
3. To see the code in action, click on any column header or footer cell.

The code tries to guess the value type (Number, Date, String) of each column based on its first cell, in order to set a sorting method for that column. However, you may specify a sorting method for a column by setting its class attribute with one of the names below:

*   **alphaNumeric** - mixed numbers and strings.
*   **sortDate** - dd/mm/yyyy format (default).
*   **sortDate_American** - mm/dd/yyyy format.
*   **sortNumberJS** - 5,625.78 (default).
*   **sortNumber_nonJS** -  5.625,78 (see the **note** below).

**Note:** By default, the code expects numbers formatted as "9,999.99" (UK, USA, etc.). So, if you need to sort numbers formatted as "9.999,99" (comma as the decimal separator and period as the thousands separator), you will need to set the *class* attribute of the *TH* element (column) with *sortNumber_nonJS*.

If you want to understand how the code works, you may use your [browser developer tools](http://devtoolsecrets.com/) to debug it.

There is an example on [Codepen](https://codepen.io/jrio/pen/bvPmLo).

Cheers.

    João Rodrigues (JR)
