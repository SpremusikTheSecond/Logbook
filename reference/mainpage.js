document.addEventListener("DOMContentLoaded", function () {
    const maxRowsPerPage = 18;
    const addRowButton = document.querySelector(".table-button");
    const newPageButton = document.querySelector(".new-page-button");
    let currentLogbookRows = document.querySelector(".logbook-rows");

    function updatePageButtons() {
    const currentRows = currentLogbookRows.querySelectorAll("tr").length;

    console.log("Current rows: " + currentRows); // Debugging log

    if (currentRows >= maxRowsPerPage) {
        addRowButton.style.display = "none";
        newPageButton.style.display = "inline-block";
    } else {
        addRowButton.style.display = "inline-block";
        newPageButton.style.display = "none";
    }
}
 // Creates a new row in the logbook
    function createRow(rowData = []) {
        const newRow = document.createElement("tr");

        newRow.innerHTML = `
            <td><input type="text" placeholder="dd/mm/yy"></td>

            <td><input type="text" maxlength="4"></td>
            <td><input type="text" class="time-input" inputmode="numeric" maxlength="4"></td>

            <td><input type="text" maxlength="4"></td>
            <td><input type="text" class="time-input" inputmode="numeric" maxlength="4"></td>

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
            <td><input type="text" placeholder="dd/mm/yy"></td>
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

        currentLogbookRows.appendChild(newRow);
    }

    function saveLogbook() {
        const rows = currentLogbookRows.querySelectorAll("tr");
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

        currentLogbookRows.innerHTML = "";

        if (savedData) {
            const logbookData = JSON.parse(savedData);

            logbookData.forEach(function (rowData) {
                createRow(rowData);
            });
        } else {
            createRow();
        }
    }
    function createNewPage() {
        const pagesContainer = document.getElementById("logbook-pages");

        const firstPage = document.querySelector(".logbook-container");

        const newPage = firstPage.cloneNode(true);

        const newPageRows = newPage.querySelector(".logbook-rows");

        newPageRows.innerHTML = "";

        for (let i = 0; i < maxRowsPerPage; i++) {
            const newRow = document.createElement("tr");

            newRow.innerHTML = `
                <td><input type="text" placeholder="dd/mm/yy"></td>

                <td><input type="text" maxlength="4"></td>
                <td><input type="text" class="time-input" inputmode="numeric" maxlength="4"></td>

                <td><input type="text" maxlength="4"></td>
                <td><input type="text" class="time-input" inputmode="numeric" maxlength="4"></td>

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
                <td><input type="text" placeholder="dd/mm/yy"></td>
                <td><input type="text"></td>
                <td><input type="text"></td>
                <td><input type="text"></td>
                <td><input type="text"></td>
                <td><input type="text"></td>
            `;

            newPageRows.appendChild(newRow);
        }

        pagesContainer.appendChild(newPage);

        currentLogbookRows = newPageRows;

        addRowButton.style.display = "inline-block";
        newPageButton.style.display = "none";
    }
    addRowButton.addEventListener("click", function () {
        const currentRows = currentLogbookRows.querySelectorAll("tr").length;

        if (currentRows < maxRowsPerPage) {
        createRow();
        saveLogbook();
        updatePageButtons();
        }
    });

    newPageButton.addEventListener("click", function () {
        createNewPage();
});

document.addEventListener("input", function (event) {
    if (event.target.classList.contains("time-input")) {
        event.target.value = event.target.value.replace(/\D/g, "");
    }
});

    currentLogbookRows.addEventListener("input", saveLogbook);
    currentLogbookRows.addEventListener("change", saveLogbook);

    loadLogbook();
    updatePageButtons();
});
