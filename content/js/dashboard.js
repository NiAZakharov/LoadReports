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

    var data = {"OkPercent": 68.47802484500232, "KoPercent": 31.521975154997683};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.32667969522253876, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "logout"], "isController": false}, {"data": [0.8639896373056994, 500, 1500, "Start mediaFile"], "isController": false}, {"data": [0.32411610323471374, 500, 1500, "WebSocket Single Write Sampler"], "isController": false}, {"data": [1.0, 500, 1500, "client/spRegistration"], "isController": false}, {"data": [0.875, 500, 1500, "Media WebSocket Open Connection"], "isController": false}, {"data": [0.5, 500, 1500, "signIn"], "isController": false}, {"data": [1.0, 500, 1500, "JSR223 Sampler"], "isController": false}, {"data": [0.772887323943662, 500, 1500, "Stop mediaFile"], "isController": false}, {"data": [0.9257950530035336, 500, 1500, "Download"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 308553, 97262, 31.521975154997683, 1096.8804873068898, 0, 205595, 1214.0, 4265.9000000000015, 6060.700000000004, 14786.300000000112, 5.836994890375945, 0.01569152643976909, 1405.8377593347193], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["logout", 2, 0, 0.0, 47.0, 45, 49, 47.0, 49.0, 49.0, 49.0, 0.0011337553548682606, 4.34015721785506E-4, 3.598344632150241E-4], "isController": false}, {"data": ["Start mediaFile", 386, 19, 4.922279792746114, 523.411917098446, 19, 15187, 224.0, 1293.3, 2053.95, 4296.1199999999935, 0.04743158577430896, 0.037903604702215044, 0.030343499720817194], "isController": false}, {"data": ["WebSocket Single Write Sampler", 307106, 97187, 31.64607659895932, 1099.6960039856092, 0, 205595, 1211.5, 4265.9000000000015, 6060.700000000004, 14786.300000000112, 5.809621532779766, 0.0, 1405.825197792904], "isController": false}, {"data": ["client/spRegistration", 2, 0, 0.0, 182.0, 140, 224, 182.0, 224.0, 224.0, 224.0, 0.0011343398709121226, 0.004110874278276257, 8.009059830756491E-4], "isController": false}, {"data": ["Media WebSocket Open Connection", 384, 17, 4.427083333333333, 447.2369791666667, 13, 5235, 219.0, 1200.0, 2052.5, 3183.0, 0.047185878446228006, 0.018408703788559095, 0.017880224253959312], "isController": false}, {"data": ["signIn", 2, 0, 0.0, 1037.5, 1029, 1046, 1037.5, 1046.0, 1046.0, 1046.0, 0.0011331258579887354, 9.339435782641532E-4, 9.616077837814563E-4], "isController": false}, {"data": ["JSR223 Sampler", 104, 0, 0.0, 0.7115384615384617, 0, 11, 1.0, 1.0, 1.0, 10.900000000000006, 0.012779551145299687, 0.0, 0.0], "isController": false}, {"data": ["Stop mediaFile", 284, 20, 7.042253521126761, 965.4225352112672, 30, 21034, 247.0, 2116.0, 3350.5, 8886.549999999821, 0.03597523738273054, 0.019193613510234384, 0.017765940291999852], "isController": false}, {"data": ["Download", 283, 19, 6.713780918727915, 254.27915194346284, 10, 2152, 114.0, 400.99999999999994, 2044.8, 2085.200000000001, 0.035841109144282755, 0.026599091690675775, 0.016158008862062513], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Sampler error/Sampler configured for using existing connection, but there is no connection", 17000, 17.478563056486603, 5.509588304116311], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 192.168.2.147:8080 [/192.168.2.147] failed: Connection timed out: connect", 1, 0.0010281507680286238, 3.2409342965390064E-4], "isController": false}, {"data": ["400", 1, 0.0010281507680286238, 3.2409342965390064E-4], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 192.168.2.147:8080 [/192.168.2.147] failed: Connection refused: connect", 52, 0.05346383993748843, 0.016852858342002834], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 4, 0.004112603072114495, 0.0012963737186156025], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Программа на вашем хост-компьютере разорвала установленное подключение", 936, 0.9623491188747918, 0.303351450156051], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Connection refused: no further information", 17, 0.017478563056486603, 0.00550958830411631], "isController": false}, {"data": ["Websocket I/O error/WebSocket I/O error: Connection reset by peer", 79251, 81.48197651703646, 25.684728393501278], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 308553, 97262, "Websocket I/O error/WebSocket I/O error: Connection reset by peer", 79251, "Sampler error/Sampler configured for using existing connection, but there is no connection", 17000, "Websocket I/O error/WebSocket I/O error: Программа на вашем хост-компьютере разорвала установленное подключение", 936, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 192.168.2.147:8080 [/192.168.2.147] failed: Connection refused: connect", 52, "Websocket I/O error/WebSocket I/O error: Connection refused: no further information", 17], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["Start mediaFile", 386, 19, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 192.168.2.147:8080 [/192.168.2.147] failed: Connection refused: connect", 17, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 2, null, null, null, null, null, null], "isController": false}, {"data": ["WebSocket Single Write Sampler", 307106, 97187, "Websocket I/O error/WebSocket I/O error: Connection reset by peer", 79251, "Sampler error/Sampler configured for using existing connection, but there is no connection", 17000, "Websocket I/O error/WebSocket I/O error: Программа на вашем хост-компьютере разорвала установленное подключение", 936, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Media WebSocket Open Connection", 384, 17, "Websocket I/O error/WebSocket I/O error: Connection refused: no further information", 17, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Stop mediaFile", 284, 20, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 192.168.2.147:8080 [/192.168.2.147] failed: Connection refused: connect", 18, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 192.168.2.147:8080 [/192.168.2.147] failed: Connection timed out: connect", 1, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1, null, null, null, null], "isController": false}, {"data": ["Download", 283, 19, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 192.168.2.147:8080 [/192.168.2.147] failed: Connection refused: connect", 17, "400", 1, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 1, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
