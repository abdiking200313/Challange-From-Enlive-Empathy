$(document).ready(function () {
    if (typeof XLSX === "undefined" || typeof echarts === "undefined") {
        console.error("Libraries are not loaded properly.");
        return;
    }

    console.log("Libraries loaded successfully!");

    var myChart = echarts.init(document.getElementById("main"));
    var sheetData = []; // Store Excel data

    function resizeChart() {
        myChart.resize(); // Resize the chart on window resize
    }
    window.addEventListener("resize", resizeChart);

    $("#fileInput").on("change", function (event) {
        console.log("File selected...");

        var file = event.target.files[0];
        if (!file) {
            console.error("No file selected.");
            return;
        }

        var reader = new FileReader();

        reader.onload = function (e) {
            console.log("File loaded, processing...");

            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: "array" });

            var sheetName = workbook.SheetNames[0]; // Read the first sheet
            sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            if (sheetData.length === 0) {
                console.error("Empty sheet.");
                return;
            }

            // Detect column names dynamically
            var columns = Object.keys(sheetData[0]); 
            console.log("Detected Columns:", columns);

            if (columns.length < 2) {
                console.error("Dataset must have at least two columns.");
                return;
            }

            // Populate dropdowns
            populateDropdown("#xAxisSelect", columns);
            populateDropdown("#yAxisSelect", columns);

            // Set default selections
            $("#xAxisSelect").val(columns[0]);
            $("#yAxisSelect").val(columns[1]);

            updateChart();
        };

        reader.readAsArrayBuffer(file);
    });

    function populateDropdown(selector, columns) {
        var dropdown = $(selector);
        dropdown.empty(); // Clear previous options
        columns.forEach(col => {
            dropdown.append(new Option(col, col));
        });
    }

function updateChart() {
    var xAxisColumn = $("#xAxisSelect").val();
    var yAxisColumn = $("#yAxisSelect").val();

    if (!xAxisColumn || !yAxisColumn) {
        console.error("Invalid column selection.");
        return;
    }

    var xAxisData = sheetData.map(row => row[xAxisColumn]);
    var yAxisData = sheetData.map(row => row[yAxisColumn]);



    var option = {
        title: { text: `Visualization of ${yAxisColumn} by ${xAxisColumn}` },
        tooltip: {},
        xAxis: { type: "category", data: xAxisData, axisLabel: { rotate: 45, interval: 0 } },
        yAxis: { type: "value" },
        dataZoom: [
            { type: "slider", show: true, start: 0, end: 20 }, // Add scroll functionality
            { type: "inside", start: 0, end: 20 }
        ],
        series: [{ name: yAxisColumn, type: "bar", data: yAxisData }]
    };
    
    myChart.setOption(option);
}


    $("#xAxisSelect, #yAxisSelect").on("change", updateChart);
});
