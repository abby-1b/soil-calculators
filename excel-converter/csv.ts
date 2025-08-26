// Opens CSV files for reading

function parseLine(line: string) {
  const parts: string[] = [];

  let str = '';
  let inString = false;
  let charsSinceString = 999;
  for (const c of line) {
    if (c == '"') {
      inString = !inString;
      if (inString) {
        if (charsSinceString == 0) str += '"';
      }
      charsSinceString = 0;
      continue;
    }
    charsSinceString++;
    if (c == ',' && !inString) {
      parts.push(str);
      str = '';
      continue;
    }
    str += c;
  }
  parts.push(str.trim());
  return parts;
}

const lines: string[] = [];
for (const filename of [
  "Conjuntos Tecnologicos.csv",
  "Crop List.csv",
  "CT Data.csv",
  "Lookup.csv",
  "Nutrient Data.csv",
  "Report.csv",
  "Site Assessment.csv",
]) {
  const txt: string = Deno.readTextFileSync("../csv-sheets/" + filename);
  lines.push(...txt.split('\n'));
}

const cells: string[] = [];
for (const line of lines) {
  cells.push(...parseLine(line));
}

const formulas = cells.filter(c => c[0] == '=');
// console.log(formulas);
formulas.sort((a, b) => a.length - b.length);

console.log(formulas.join('\n'))
