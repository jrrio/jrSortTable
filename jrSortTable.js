/**
 * Sort HTML tables
 * @author Joao Rodrigues (JR)
 * @version 2.0 - 2024-02-14 - modern browsers.
 * @see <https://github.com/jrrio/jrSortTable>
 */
"use strict";

const jrSortTable = Object.create(null);

/**
 * Using jrSortTable.tableProp will speed up sorting of large tables.
 * @property {array} tableProp will be filled in setup() for each table in the document and updated in sort().
 * tableProp[tblNumber] = {
 *   headerCells : An Array containing an HTMLCollection of TH elements. Each of these THs will
 *      receive the following properties: sortfn, sortdir, isSorted and sortedTBody.
 *   tbody : tbody is stored here to speed up code execution.
 * };
 */
jrSortTable.tableProp = [];

/**
 * Sort a table by the specified TH column.
 * If the table is already sorted by this column, then just apply sorting;
 * otherwise store the sorted tbody in th.
 * @param {Number} tblNumber - Number of the table in jrSortTable.tableProp.
 * @param {HTMLElement} thElem - HTML <th> element
 */
jrSortTable.sort = function (tblNumber, thElem) {
  // Didn't use thElem's properties because of tFoot's THs.
  // Moreover, using stored properties will speed code execution up.
  const prop = jrSortTable.tableProp[tblNumber];
  const tbody = prop.tbody;
  const column = thElem.cellIndex;
  const th = prop.headerCells[column];
  let sortdir = th.sortdir;
  let sortedTBody = th.sortedTBody;

  if (th.isSorted) {
    // This column is already sorted
    sortdir = sortdir === "asc" ? "desc" : "asc";
    sortedTBody.reverse();
  } else {
    sortedTBody = Array.from(tbody.rows).map((row) => [row.cells[column].textContent.trim(), row]);
    sortedTBody.sort(jrSortTable.sortMethods[th.sortfn]);
    jrSortTable.tableProp[tblNumber].headerCells[column].isSorted = true;
  }
  // Update tbody
  const fragment = new DocumentFragment();
  sortedTBody.forEach(([_, row]) => fragment.appendChild(row));
  tbody.appendChild(fragment);

  // Remove arrows from all other TH elements
  Array.from(prop.headerCells).forEach((th) => {
    th.innerHTML = th.innerHTML.replace(/(&nbsp;🠅|&nbsp;🠇)$/g, "");
  });

  // Add arrow to the sorted TH element
  // th.innerHTML += sortdir === "asc" ? "&nbsp;▲" : "&nbsp;▼";
  th.innerHTML += sortdir === "asc" ? "&nbsp;🠅" : "&nbsp;🠇";

  // ******** Update tableProp object ************
  jrSortTable.tableProp[tblNumber].headerCells[column].sortedTBody = sortedTBody;
  jrSortTable.tableProp[tblNumber].headerCells[column].sortdir = sortdir;
};

jrSortTable.sortMethods = (function (obj) {
  // a and b are arrays containing [cell text, cell's row].

  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base"
  });

  obj.alphaNumeric = (a, b) => {
    let aa = a[0],
      bb = b[0];
    return collator.compare(aa, bb);
  };

  // Sort method for dates in American format such as MM/DD/YYYY
  obj.sortUSDate = (a, b) => {
    let aa = a[0],
      bb = b[0];
    let dateA = new Date(aa);
    let dateB = new Date(bb);
    return dateA - dateB;
  };

  // Sort method for dates in European formats such as DD/MM/YYYY or DD.MM.YYYY
  // EU date separators vary [/.-]
  obj.sortDate = (a, b) => {
    let aa = a[0],
      bb = b[0];
    let [dayA, monthA, yearA] = aa.split(/\D/).map((num) => parseInt(num, 10)); // convert to integers
    let [dayB, monthB, yearB] = bb.split(/\D/).map((num) => parseInt(num, 10));
    let dateA = new Date(yearA, monthA - 1, dayA);
    let dateB = new Date(yearB, monthB - 1, dayB);
    return dateA - dateB;
  };

  obj.sortNumberJS = (a, b) => {
    const re = /[^\d.-]+/g; // remove thousands separators, currency symbols, and percentage signs before comparing numbers.
    let aa = a[0].replace(re, "");
    let bb = b[0].replace(re, "");
    if (isNaN(aa)) aa = 0;
    if (isNaN(bb)) bb = 0;
    return aa - bb;
  };

  obj.sortNumber_nonJS = (a, b) => {
    // e.g. 23,478.96 in English/JS == 23.478,96 in other countries.
    const re = /[^\d,-]+/g; // remove thousands separators, currency symbols, and percentage signs before comparing numbers.
    let aa = a[0].replace(re, "");
    let bb = b[0].replace(re, "");
    // Then replace the decimal separator (comma) with a dot.
    aa = aa.replace(/,/, ".");
    bb = bb.replace(/,/, ".");
    if (isNaN(aa)) aa = 0;
    if (isNaN(bb)) bb = 0;
    return aa - bb;
  };

  return obj;
})(Object.create(null));

jrSortTable.setup = () => {

  // Prepare tables for sorting.
  const prepareTables = (tableElem, tblNumber) => {

    const addOnClickEvt = (e) => {
      jrSortTable.sort(tblNumber, e.currentTarget); // e.currentTarget is a th.
    };

    const addEvent = (row) => {
      const cells = row.cells;
      for (const cell of cells) {
        // ignore nosort className
        if (!cell.classList.contains("nosort")) {
          cell.addEventListener("click", addOnClickEvt);
        }
      }
    };

    /** Guess the sort method based on the column's first cell. Assume that
     *  the other cells of this column will have the same data type.
     */
    const guessSortMethod = (txtCell) => {
      if (txtCell.length > 0) {
        if (txtCell.match(/^-?\D*?[\d,.]+[\s%]*?$/)) {
          // currency, number or percentile
          return "sortNumberJS";
        }
        const testDate = txtCell.match(/^(\d\d?)[/.-](\d\d?)[/.-]((\d\d)?\d\d)$/);
        if (testDate) {
          // Expect dd/mm/yyyy or mm/dd/yyyy, using [/.-] as date separators
          if (parseInt(testDate[2], 10) > 12) {
            return "sortUSDate"; // mm/dd
          }
          // Assume dd/mm for my usage. You can change to 'sortUSDate' (mm/dd)
          return "sortDate";
        }
      }
      // alphaNumeric is the default sort function.
      return "alphaNumeric";
    };

    // Create a RegExp with the names of the sorting methods.
    const arr = Object.keys(jrSortTable.sortMethods);
    arr.push("nosort");
    const rxFn = new RegExp(arr.join("|"));

    const getSortMethodName = (className) => {
      const found = rxFn.exec(className);
      return found ? found[0] : "";
    };

    // If there isn't a thead element in the table, let's create one.
    if (tableElem.getElementsByTagName("thead").length === 0) {
      const elem = document.createElement("thead");
      elem.appendChild(tableElem.rows[0]);
      tableElem.insertBefore(elem, tableElem.firstChild);
    }

    const thead = tableElem.tHead;
    const tbody = tableElem.tBodies[0];

    jrSortTable.tableProp[tblNumber] = {
      headerCells: [], // TH elements
      tbody: tbody
    };

    const arrTh = thead.rows[0].cells;
    Array.from(arrTh).forEach((th) => {
      th.sortdir = "asc";
      th.isSorted = false;
      const fn = getSortMethodName(th.className);
      th.sortfn = fn || guessSortMethod(tbody.rows[0].cells[th.cellIndex].textContent.trim());
    });

    jrSortTable.tableProp[tblNumber].headerCells = arrTh;

    // Finally, add the onclick event to every th element.
    addEvent(thead.rows[0]);
    // tfoot's first row contains all th tags.
    if (tableElem.tFoot) {
      addEvent(tableElem.tFoot.rows[0]);
    }
  };

  const tables = document.querySelectorAll(".sortable");
  tables.forEach((tbl, idx) => prepareTables(tbl, idx));
};
window.addEventListener("load", jrSortTable.setup, false);
