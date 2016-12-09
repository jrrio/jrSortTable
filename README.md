# jrSortTable
This code is intended to sort more than one table at the same time, either by their
thead or tfoot sections. After numerous attempts, I discovered that the code runs much faster
for large tables whenever sorted 'tbody' and other frequently used properties are stored in jrSortTables.tableProp.
