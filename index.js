const express = require("express");
const ExcelJS = require("exceljs");
const moment = require("moment");
const fs = require("fs");
const app = express();
const cors = require("cors");
import path from 'path';

const filename = path.join(process.cwd(), 'files', 'orderData/monthlyOrders_${moment().format("MM-YYYY")}.xlsx');
const workbook = new ExcelJS.Workbook();
app.use(cors());
// Define route to create or update Excel file


app.get("/getMenu", (req, res) => {
    // Load the Excel file
    const filename = `orderData/menu.xlsx`;
    const workbook = new ExcelJS.Workbook();
    workbook.xlsx
        .readFile(filename)
        .then(() => {
            // Get the worksheet
            const worksheet = workbook.getWorksheet('Sheet1');

            // Define an array to hold the row data
            const rowsWithAge10 = [];

            // Iterate over each row in the worksheet
            const rows = [];
            worksheet.eachRow((row, rowNumber) => {
                // Convert the row to a JSON object

                rows.push(
                    row.values.filter((v) => {
                        return v != null;
                    })
                );
            });
            // Return the filtered rows as JSON
            res.json(rows);
        })
        .catch((error) => {
            console.error(`Error reading Excel file: ${error}`);
            res.status(500).json("Error reading Excel file");
        });
});

app.get("/init", (req, res) => {
    // Generate filename with today's date
    if (fs.existsSync(filename)) {
        res.status(200).json(`Excel file ${filename} aleady exists!`);
    } else {
        workbook.addWorksheet(moment().format("DD-MM-YYYY"));
        workbook.xlsx
            .writeFile(filename)
            .then(() => {
                console.log(`Excel file ${filename} saved successfully!`);
                res.status(200).json(`Excel file ${filename} saved successfully!`);
            })
            .catch((error) => {
                console.error(`Error saving Excel file: ${error}`);
                res.status(500).json(`Error saving Excel file: ${error}`);
            });
    }
});
app.post("/create-order/:order/:status/:payment/:total", (req, res) => {
    console.log(req)
    if (fs.existsSync(filename)) {
        // read worksheet and add headers
        try {
            workbook.xlsx
                .readFile(filename)
                .then(function () {
                    // Access the first worksheet in the workbook
                    const worksheet = workbook.getWorksheet(
                        moment().format("DD-MM-YYYY")
                    );
                    const nextRowNumber = worksheet.rowCount + 1;

                    const newRowData = [
                        nextRowNumber,
                        req.params.order,
                        req.params.status,
                        req.params.payment,
                        req.params.total,
                    ];
                    const newRow = worksheet.addRow(newRowData);
                    return workbook.xlsx.writeFile(filename);
                })
                .then(function () {
                    console.log("Row added to worksheet");
                    res.status(200).json(`Excel file ${filename} saved successfully!`);
                })
                .catch(function (error) {
                    console.log("Error:", error);
                    res.status(500).json(`Error updating Excel file: ${error}`);
                });
        } catch (error) {
            console.error(`Error saving Excel file: ${error}`);
            res.status(500).json(`Error saving Excel file: ${error}`);
        }
    } else {
        console.log(`Excel file ${filename} not found `);
        res.status(200).json(`Excel file ${filename} not found`);
    }
});

app.get("/view-incomplete-orders", (req, res) => {
    // Load the Excel file
    workbook.xlsx
        .readFile(filename)
        .then(() => {
            // Get the worksheet
            const worksheet = workbook.getWorksheet(moment().format("DD-MM-YYYY"));

            // Define an array to hold the row data
            const rowsWithAge10 = [];

            // Iterate over each row in the worksheet
            const rows = [];
            worksheet.eachRow((row, rowNumber) => {
                const status = row.getCell(3).value; // Assuming status is in column C
                if (row.values && status === "Pending") {
                    // Convert the row to a JSON object

                    rows.push(
                        row.values.filter((v) => {
                            return v != null;
                        })
                    );
                }
            });

            // Return the filtered rows as JSON
            res.json(rows);
        })
        .catch((error) => {
            console.error(`Error reading Excel file: ${error}`);
            res.status(500).json("Error reading Excel file");
        });
});

app.get("/view-all-orders", (req, res) => {
    // Load the Excel file
    workbook.xlsx
        .readFile(filename)
        .then(() => {
            // Get the worksheet
            const worksheet = workbook.getWorksheet(moment().format("DD-MM-YYYY"));

            // Define an array to hold the row data
            const rowsWithAge10 = [];

            // Iterate over each row in the worksheet
            const rows = [];
            worksheet.eachRow((row, rowNumber) => {
                // Convert the row to a JSON object

                rows.push(
                    row.values.filter((v) => {
                        return v != null;
                    })
                );
            });
            // Return the filtered rows as JSON
            res.json(rows);
        })
        .catch((error) => {
            console.error(`Error reading Excel file: ${error}`);
            res.status(500).json("Error reading Excel file");
        });
});
app.post("/order-completed/:rowNumber", (req, res) => {
    workbook.xlsx
        .readFile(filename)
        .then(() => {
            // Get the worksheet
            const worksheet = workbook.getWorksheet(moment().format("DD-MM-YYYY"));
            const rowNumber = parseInt(req.params.rowNumber);
            // replace 'Sheet1' with the actual sheet name

            // Find the row with the given row number
            const row = worksheet.findRow(rowNumber, 1);

            if (!row) {
                return res.status(404).json(`Row ${rowNumber} not found.`);
            }
            row.getCell(3).value = "Complete";
            row.getCell(4).value = "Yes";
            // Save the changes
            workbook.xlsx.writeFile(filename);
            return res.json(
                `status Updated.`,
            );
        })
        .catch((error) => {
            console.error(`Error reading Excel file: ${error}`);
            res.status(500).json("Error reading Excel file");
        });
});


// Start server
app.listen(process.env.PORT || 3000, () => {
    console.log("Server listening on port 3000!");
});
