# jrSortTable

You can use JavaScript to sort the columns of a data table directly on the client side (web browser). You just need to follow these steps:

1. Set the *class* attribute of the data tables with "sortable".
2. Download [jrSortTable.js](https://github.com/jrodgs/jrSortTable/blob/master/jrSortTable.js) and place a script tag referring to it just before the closing *body* tag. _E.g._

    &lt;script type="text/javascript" src="path/jrSortTable.js">&lt;/script>
    
3. Click on any column header or footer cell (TH) to sort the table.

The code tries to guess the value type (Number, Date, String) of each column based on its first cell, in order to set a sorting method for that column. However, you may specify a sorting method for a column by setting its class attribute with one of the names below:

*   **nosort** - sorting disabled.
*   **alphaNumeric** - mixed numbers and strings.
*   **sortDate** - dd/mm/yyyy format (default).
*   **sortUSDate** - mm/dd/yyyy format.
*   **sortNumberJS** - 5,625.78 (default).
*   **sortNumber_nonJS** -  5.625,78 (see the **note** below).

**Note:** By default, the code expects numbers formatted as "9,999.99" (UK, USA, etc.). So, if you need to sort numbers formatted as "9.999,99" (comma as the decimal separator and period as the thousands separator), you will need to set the *class* attribute of the *TH* element (column) with *sortNumber_nonJS*.

# Example

There is an example on [Codepen](https://codepen.io/jrio/pen/bvPmLo).

# License

This repository has been released under the [MIT License](https://github.com/jrrio/jrSortTable/blob/master/LICENSE).

# Changelog

* @version 0.1 - 2009-01-15 - first version.
* @version 0.6 - 2009-10-23 - optimized for IE 7, FF3 and Safari 3. Removed the GetElementsByClass() function and changed line 173 thru 177 due to Stephane Moriaux's advice.
* @version 0.8 - 2011-04-21 - code optimizations.
* @version 0.9 - 2011-12-15 - code optimizations.
* @version 1.1 - 2012-02-18 - more optimizations, allow sorting non JS numbers such as 1.453.932,67, and use of specific class names in TH cells to define the sort method.
* @version 1.2 - 2018-04-23 - fixed issues with negative numbers.
* @version 1.3 - 2018-04-29 - Removed support for ancient browsers (IE7, Safari 2). Now the code runs only in IE11, Edge and other modern browsers.
* @version 1.4 - 2018-05-11 - Removed unnecessary replace() in sortNumberJS() and sortNumber_nonJS() of jrSortTable.sortMethods.
* @version 1.5 - 2024-02-03 - 'nosort' className included in order to disable table sorting.
* @version 2.0 - 2024-02-14 - modern browsers.
