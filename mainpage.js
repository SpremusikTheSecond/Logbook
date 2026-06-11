document.addEventListener("DOMContentLoaded", function () {
    const addRowButton = document.querySelector(".table-button");
    const logbookRows = document.getElementById("logbook-rows");


    function createRow(rowData = []) {
        const newRow = document.createElement("tr");

        newRow.innerHTML = `
            <td><input type="text" placeholder="dd/mm/yy"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="checkbox" class="checkbox"></td>
            <td><input type="checkbox" class="checkbox"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
        `;

        const inputs = newRow.querySelectorAll("input");

        inputs.forEach(function (input, index) {
            if (rowData[index] !== undefined) {
                if (input.type === "checkbox") {
                    input.checked = rowData[index];
                } else {
                    input.value = rowData[index];
                }
            }
        });

        logbookRows.appendChild(newRow);
    }

    function saveLogbook() {
        const rows = logbookRows.querySelectorAll("tr");
        const logbookData = [];

        rows.forEach(function (row) {
            const inputs = row.querySelectorAll("input");
            const rowData = [];

            inputs.forEach(function (input) {
                if (input.type === "checkbox") {
                    rowData.push(input.checked);
                } else {
                    rowData.push(input.value);
                }
            });

            logbookData.push(rowData);
        });

        localStorage.setItem("logbookData", JSON.stringify(logbookData));
    }

    function loadLogbook() {
    const savedData = localStorage.getItem("logbookData");

    if (savedData) {
        const logbookData = JSON.parse(savedData);

        logbookRows.innerHTML = "";

        logbookData.forEach(function (rowData) {
            createRow(rowData);
        });
    }
}
    addRowButton.addEventListener("click", function () {
        createRow();
        saveLogbook();
    });

    // Save whenever user types or changes a checkbox
    logbookRows.addEventListener("input", saveLogbook);
    logbookRows.addEventListener("change", saveLogbook);

    loadLogbook();
});