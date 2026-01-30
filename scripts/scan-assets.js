const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_DIR_NAME = 'THIỆP MỜI , LOGO';
const ASSETS_DIR = path.join(ROOT_DIR, ASSETS_DIR_NAME);
const EXCEL_FILE = 'DANH SACH VA 10 NHAN VIEN VINH DANH NHAN CUP PHALE.xlsx';

const OUTPUT_FILE = path.join(ROOT_DIR, 'src', 'assets.json');

// Helper to get relative path for Vite (URL encoded)
const getRelPath = (absPath) => {
    let rel = path.relative(ROOT_DIR, absPath);
    // Fix for windows paths in web
    return rel.split(path.sep).join('/');
};

const assets = {
    backdrop: null,
    company: null,
    welcome: null,
    menu: [],
    invitations: [],
    activities: [],
    honorees: []
};

// 1. Scan Special Assets Folder
if (fs.existsSync(ASSETS_DIR)) {
    const files = fs.readdirSync(ASSETS_DIR);
    files.forEach(file => {
        const lower = file.toLowerCase();
        const absPath = path.join(ASSETS_DIR, file);
        const relPath = getRelPath(absPath);

        if (lower.includes('backdrop')) {
            assets.backdrop = relPath;
        } else if (lower.includes('tên cty')) {
            assets.company = relPath;
        } else if (lower.includes('welcome')) {
            assets.welcome = relPath;
        } else if (lower.includes('thuc don') || lower.includes('goi thuc uong')) {
            assets.menu.push(relPath);
        } else if (lower.includes('thiệp mời') || lower.includes('thiep moi')) {
            assets.invitations.push(relPath);
        }
    });

    // Sort valid paths just in case
    assets.menu.sort();
    assets.invitations.sort();

    // Process Excel in this folder
    const excelPath = path.join(ASSETS_DIR, EXCEL_FILE);
    if (fs.existsSync(excelPath)) {
        console.log(`Processing Excel: ${excelPath}`);
        const workbook = xlsx.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // Array of arrays

        // Simple heuristic: look for rows that surely contain names (ignoring headers)
        // We'll filter for non-empty rows.
        assets.honorees = data.filter(row => row.length > 0 && row[0]);
    }
}

// 2. Scan Activity Photos in Root
const rootFiles = fs.readdirSync(ROOT_DIR);
rootFiles.forEach(file => {
    // Basic image extensions check
    if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
        assets.activities.push(getRelPath(path.join(ROOT_DIR, file)));
    }
});

// Ensure output dir exists
if (!fs.existsSync(path.join(ROOT_DIR, 'src'))) {
    fs.mkdirSync(path.join(ROOT_DIR, 'src'));
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(assets, null, 2));
console.log('Assets manifest generated at:', OUTPUT_FILE);
console.log('Summary:');
console.log('- Invitations:', assets.invitations.length);
console.log('- Activity Photos:', assets.activities.length);
console.log('- Honorees Entries:', assets.honorees.length);
