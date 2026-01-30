const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const file = 'THIỆP MỜI , LOGO/DANH SACH VA 10 NHAN VIEN VINH DANH NHAN CUP PHALE.xlsx';
const absPath = path.resolve(__dirname, '..', file);

if (fs.existsSync(absPath)) {
    const wb = xlsx.readFile(absPath);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    console.log("Total rows:", data.length);
    console.log("First 15 rows:", JSON.stringify(data.slice(0, 15), null, 2));
} else {
    console.log("File not found:", absPath);
}
