import fs from 'fs';
import { parse } from '@babel/parser';

const code = fs.readFileSync('src/HR layout/Employee/EmployeeDetail.jsx', 'utf8');

try {
  parse(code, {
    sourceType: "module",
    plugins: ["jsx"]
  });
  console.log("JSX is valid.");
} catch (e) {
  console.error("Syntax Error:", e);
}
