/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "^(logout|signIn|client/spRegistration|Start mediaFile|Media WebSocket Open Connection|WebSocket Single Write Sampler|Stop mediaFile|Download)(-success|-failure)?$";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.53753326434062, "KoPercent": 0.46246673565937313};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5173598277646363, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "logout"], "isController": false}, {"data": [0.7433962264150943, 500, 1500, "Start mediaFile"], "isController": false}, {"data": [0.5166183261015848, 500, 1500, "WebSocket Single Write Sampler"], "isController": false}, {"data": [1.0, 500, 1500, "client/spRegistration"], "isController": false}, {"data": [0.7547169811320755, 500, 1500, "Media WebSocket Open Connection"], "isController": false}, {"data": [0.5, 500, 1500, "signIn"], "isController": false}, {"data": [1.0, 500, 1500, "JSR223 Sampler"], "isController": false}, {"data": [0.7303030303030303, 500, 1500, "Stop mediaFile"], "isController": false}, {"data": [0.23030303030303031, 500, 1500, "Download"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 216448, 1001, 0.46246673565937313, 1560.2665443894118, 0, 201218, 1438.0, 5065.0, 7705.750000000004, 21261.660000000054, 32.1997440955805, 8.839094533843962, 11295.836243254886], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["logout", 1, 0, 0.0, 81.0, 81, 81, 81.0, 81.0, 81.0, 81.0, 12.345679012345679, 4.72608024691358, 3.9183063271604937], "isController": false}, {"data": ["Start mediaFile", 265, 0, 0.0, 1590.3471698113203, 43, 11915, 301.0, 6407.200000000001, 9371.2, 10941.499999999993, 0.03986199626470532, 0.028339387969438936, 0.026821206471076137], "isController": false}, {"data": ["WebSocket Single Write Sampler", 215485, 1000, 0.464069424785948, 1557.4219922500452, 0, 201218, 1439.0, 5034.9000000000015, 7680.850000000002, 21261.660000000054, 32.10902749662832, 0.0, 11314.28379175591], "isController": false}, {"data": ["client/spRegistration", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 86.26302083333333, 16.810825892857142], "isController": false}, {"data": ["Media WebSocket Open Connection", 265, 1, 0.37735849056603776, 1331.1245283018864, 14, 10555, 263.0, 4817.600000000001, 8278.099999999999, 10018.919999999996, 0.03985236877968437, 0.016206473318011977, 0.01574121571079632], "isController": false}, {"data": ["signIn", 1, 0, 0.0, 687.0, 687, 687, 687.0, 687.0, 687.0, 687.0, 1.455604075691412, 1.199736171761281, 1.2352733806404657], "isController": false}, {"data": ["JSR223 Sampler", 100, 0, 0.0, 0.7100000000000001, 0, 12, 1.0, 1.0, 1.0, 11.889999999999944, 0.015686272049212226, 0.0, 0.0], "isController": false}, {"data": ["Stop mediaFile", 165, 0, 0.0, 1640.4848484848487, 57, 14021, 290.0, 6251.200000000001, 8418.6, 13269.920000000004, 0.02497301400970951, 0.009559981925591921, 0.013266913692658177], "isController": false}, {"data": ["Download", 165, 0, 0.0, 6483.296969696968, 108, 42083, 1971.0, 26246.80000000001, 32328.09999999999, 39105.74000000001, 0.024958244101308084, 8.932419073460734, 0.012016029630805551], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Sampler error/Sampler configured for using existing connection, but there is no connection", 1000, 99.9000999000999, 0.4620047309284447], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Read timed out", 1, 0.0999000999000999, 4.620047309284447E-4], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 216448, 1001, "Sampler error/Sampler configured for using existing connection, but there is no connection", 1000, "Websocket I/O error/WebSocket I/O error: Read timed out", 1, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["WebSocket Single Write Sampler", 215485, 1000, "Sampler error/Sampler configured for using existing connection, but there is no connection", 1000, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Media WebSocket Open Connection", 265, 1, "Websocket I/O error/WebSocket I/O error: Read timed out", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
