import xlsx from 'xlsx';

const workbook = xlsx.readFile('BFCD.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);