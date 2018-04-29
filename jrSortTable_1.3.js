/**
 * Sortable HTML table
 * @author Joao Rodrigues (JR)
 * @version 1.3 - 2018-04-25 - IE11, Edge and modern browsers.
 * @see <https://github.com/jrrio/jrSortTable>
 */
var jrSortTables = Object.create(null);

(function () {
  'use strict';

  jrSortTables.arrows = {
    up: '&nbsp;&#x25B4;',
    down: '&nbsp;&#x25BE;'
  };

  /**
   * Using jrSortTables.tableProp will speed up sorting of large tables, mainly in older IE versions.
   * @property {array} tableProp will be filled in setup() and updated in sort().
   * tableProp[tblNumber] = {
   *   'headerCells' : [] containing an HTMLCollection of TH elements. Each of these THs will
   *      receive the following properties: sortfn, sortdir, isSorted and currentSortedTBody.
   *   'spanArrowId' : "jrSortSpan" + tblNumber,
   *   'tbody' : tbody }
   */
  jrSortTables.tableProp = [];

  /**
   * Sorts a table by the specified TH column.
   * If table is already sorted by this column, then just apply sorting;
   * otherwise create currentSortedTBody for this th before applying sorting.
   * @param {number} tblNumber - Number of the table in jrSortTables.tableProp.
   * @param {HTMLElement} th - HTML <th> element
   */
  jrSortTables.sort = function (tblNumber, th) {
    var column = th.cellIndex, prop = jrSortTables.tableProp[tblNumber],
      // tbody = th.offsetParent.tBodies[0],
      // each header cell contains [sortfn, sortdir, isSorted, currentSortedTBody]
      tbody = prop.tbody, header = prop.headerCells[column],
      sortfn = header.sortfn, sort_direction = header.sortdir,
      isSorted = header.isSorted, i, tbr, len, row,
      currentSortedTBody = header.currentSortedTBody,
      fragment = document.createDocumentFragment();

    if (isSorted) { // tbody is already sorted
      sort_direction = (sort_direction === 'up') ? 'down' : 'up';
      if (sort_direction === 'up') {
        for (i = 0, len = currentSortedTBody.length; i < len; i++) {
          row = currentSortedTBody[i][1];
          fragment.appendChild(row);
        }
      } else { // reverse tbody
        i = currentSortedTBody.length;
        while (i) {
          row = currentSortedTBody[--i][1];
          fragment.appendChild(row);
        }
      }
      // I didn't use array.reverse because it would require one more step
      // currentSortedTBody.reverse();
    } else {
      /* This code will run only once for every column's th
       whenever that th is clicked on.
       currentSortedTBody is an array containing array elements: ['the key for sorting', row]
       */
      currentSortedTBody = [];
      // set sort_direction = 'up' at the first time.
      for (i = 0, tbr = tbody.rows, len = tbr.length; i < len; i++) {
        row = tbr[i];
        currentSortedTBody[currentSortedTBody.length] = [this.getElementText(row.cells[column]), row];
      }
      currentSortedTBody.sort(sortfn);
      jrSortTables.tableProp[tblNumber].headerCells[column].isSorted = true;
      for (i = 0; i < len; i++) {
        row = currentSortedTBody[i][1];
        fragment.appendChild(row);
      }
    }
    tbody.appendChild(fragment);

    // Finally, change the arrow direction in the th node
    var oldSpanElem = document.getElementById(prop.spanArrowId);
    if (oldSpanElem) {
      var paren = oldSpanElem.parentNode; // th node that contains span node.
      paren.removeChild(oldSpanElem);
    }
    var newSpanElem = document.createElement('span');
    newSpanElem.id = prop.spanArrowId;
    newSpanElem.innerHTML = jrSortTables.arrows[sort_direction];
    th.appendChild(newSpanElem);

    // ******** Update tableProp object ************
    jrSortTables.tableProp[tblNumber].headerCells[column].currentSortedTBody = currentSortedTBody;
    jrSortTables.tableProp[tblNumber].headerCells[column].sortdir = sort_direction;
  };

  jrSortTables.sort_functions = (function () {
    return {
      alphaNumeric: function (a, b) {
        // a and b are arrays containing [cell text, cell's row].
        // sort in the following sequence: empty string, number then non-empty string
        var aa = a[0], bb = b[0], tmpa, tmpb;
        if (aa.search(/^0+.*$/) === 0) {
          // parseFloat('0123') returns 123 which is bad because we'd need '0123'.
          tmpa = aa;
        } else {
          // parseFloat('123abc') and parseFloat('123') return a number (123);
          // parseFloat('a123') and parseFloat('abc') return NaN.
          tmpa = (aa.length) ? (isNaN(tmpa = parseFloat(aa)) ? aa : tmpa) : 0;
        }
        if (bb.search(/^0+.*$/) === 0) {
          tmpb = bb;
        } else {
          tmpb = (bb.length) ? (isNaN(tmpb = parseFloat(bb)) ? bb : tmpb) : 0;
        }
        if (typeof tmpa == 'string' && typeof tmpb == 'string') {
          return tmpa.localeCompare(tmpb); // Take accented and case-sensitive chars into account
        }
        if (typeof tmpa == 'number' && typeof tmpb == 'number') {
          return tmpa - tmpb;
        }
        // In case of different types, number < object < string
        return (typeof tmpa < typeof tmpb ? -1 : 1);
      },

      sortDate: function (a, b) { // dd/mm/yyyy
        var aa = a[0], bb = b[0];
        var date1 = aa.substr(6, 4) + aa.substr(3, 2) + aa.substr(0, 2); // turns dd-mm-yyyy into yyyymmdd
        var date2 = bb.substr(6, 4) + bb.substr(3, 2) + bb.substr(0, 2);
        if (date1 === date2) { return 0; }
        if (date1 < date2) { return -1; }
        return 1;
      },

      sortDate_American: function (a, b) { // mm/dd/yyyy
        var aa = a[0], bb = b[0];
        var date1 = aa.substr(6, 4) + aa.substr(0, 2) + aa.substr(3, 2); // turns mm-dd-yyyy into yyyymmdd
        var date2 = bb.substr(6, 4) + bb.substr(0, 2) + bb.substr(3, 2);
        if (date1 === date2) { return 0; }
        if (date1 < date2) { return -1; }
        return 1;
      },

      sortNumberJS: function (a, b) {
        var re = /[^\d.-]+/g; // remove the thousands separator, currency and % symbols
        var aa = a[0].replace(re, '').replace(/,/g, '');
        var bb = b[0].replace(re, '').replace(/,/g, '');
        if (isNaN(aa)) { aa = 0; }
        if (isNaN(bb)) { bb = 0; }
        return aa - bb;
      },

      sortNumber_nonJS: function (a, b) {
        // e.g. 23,478.96 in English/JS or 23.478,96 in Portuguese
        var re = /[^\d,-]+/g; // remove the thousands separator, currency and % symbols
        var aa = a[0].replace(re, '').replace(/\./g, '');
        var bb = b[0].replace(re, '').replace(/\./g, '');
        // Then exchange the decimal separator (comma) to a dot.
        aa = aa.replace(/,/, '.');
        bb = bb.replace(/,/, '.');
        if (isNaN(aa)) { aa = 0; }
        if (isNaN(bb)) { bb = 0; }
        return aa - bb;
      }
    };
  }());

  jrSortTables.getElementText = function (el) {
    return (el.textContent).replace(/^\s+|\s+$/g, '');
  };

  jrSortTables.setup = function () {

    function prepareTables(tableElem, tblNumber) {

      function addOnClickEvt() {
        jrSortTables.sort(tblNumber, this); // this refers to a th cell.
        // return false;
      }

      function addEvent(row) {
        var cells = row.cells, len = cells.length;
        while (len--) {
          cells[len].onclick = addOnClickEvt;
        }
      }

      /** Guess the data type of the column's first cell. Assume that
       *  the other cells of this column will have the same data type.
       */
      var sortFunctions = jrSortTables.sort_functions;
      function guessDataType(txtCell) {
        var sortfn, testDate;
        if (txtCell.length > 0) {
          // if (txtCell.match(/^\-?[R$£€¤\s]*?[\d,.]+%?$/)) {
          if (txtCell.match(/^-?\D*?[\d,.]+[\s%]*?$/)) { // currency, number or percentile
            return sortFunctions.sortNumberJS;
          }
          testDate = (txtCell.match(/^(\d\d?)[/.-](\d\d?)[/.-]((\d\d)?\d\d)$/));
          if (testDate) {
            // Expect for dd/mm/yyyy or mm/dd/yyyy, using / - . as separators
            if (parseInt(testDate[1], 10) > 12) { // dd/mm
              sortfn = sortFunctions.sortDate;
            } else if (parseInt(testDate[2], 10) > 12) { // mm/dd
              sortfn = sortFunctions.sortDate_American;
            } else { // Assume dd/mm
              sortfn = sortFunctions.sortDate;
            }
          }
        }
        // alphaNumeric is the default sort function.
        return sortfn || sortFunctions.alphaNumeric;
      }

      // Create a RegExp with the names of the sort methods.
      var arr = [];
      for (var key in sortFunctions) {
        if (sortFunctions.hasOwnProperty(key)) arr.push(key);
      }
      var rxFn = new RegExp(arr.join('|'));
      // rxFn = /alphaNumeric|sortDate|sortDate_American|sortNumberJS|sortNumber_nonJS/;

      function getSortFn(className) {
        var found = rxFn.exec(className);
        return (found) ? sortFunctions[found[0]] : '';
      }

      // If there isn't a thead element in the table, let's create one.
      if (tableElem.getElementsByTagName('thead').length === 0) {
        var the = document.createElement('thead');
        the.appendChild(tableElem.rows[0]);
        tableElem.insertBefore(the, tableElem.firstChild);
      }
      // Old Safari versions don't support table.tHead
      if (tableElem.tHead === null) {
        tableElem.tHead = tableElem.getElementsByTagName('thead')[0];
      }
      var thead = tableElem.tHead;
      var tbody = tableElem.tBodies[0];

      jrSortTables.tableProp[tblNumber] = {
        "headerCells": [], // [sortfn, sortdir, isSorted, currentSortedTBody] for each header cell.
        "spanArrowId": "jrSortSpan" + tblNumber,
        "tbody": tbody
      };

      var arrTh = thead.rows[0].cells, fn;
      for (var i = 0, len = arrTh.length; i < len; i++) {
        arrTh[i].sortdir = 'up';
        arrTh[i].isSorted = false;
        fn = getSortFn(arrTh[i].className);
        arrTh[i].sortfn = fn || guessDataType(
          jrSortTables.getElementText(tbody.rows[0].cells[i])
        );
      }
      jrSortTables.tableProp[tblNumber].headerCells = arrTh;

      // Finally, add the onclick event.
      // thead's first row contains all th tags.
      addEvent(thead.rows[0]);
      // tfoot's first row contains all th tags.
      if (tableElem.tFoot) {
        addEvent(tableElem.tFoot.rows[0]);
      }
    }

    // Prepare tables for sorting.
    var tables = document.querySelectorAll('.sortable');
    [].forEach.call(tables, function (tbl, idx) {
      prepareTables(tbl, idx);
    });
    tables = null;
  };

}());

window.addEventListener('load', jrSortTables.setup, false);
