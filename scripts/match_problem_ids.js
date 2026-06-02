const fs = require('fs');
const path = require('path');

const massiveJsonPath = path.join(__dirname, '../massive.json');
const companiesDirPath = path.join(__dirname, '../data/static-data/company-wise-problems/problems');

console.log('Reading massive.json...');
const massiveData = JSON.parse(fs.readFileSync(massiveJsonPath, 'utf8'));

// Build a map of slug -> problem_id
console.log('Building slug map...');
const slugToId = new Map();
for (const question of massiveData.questions) {
  if (question.problem_slug) {
    slugToId.set(question.problem_slug, question.problem_id);
  }
}

console.log('Processing company files...');
const files = fs.readdirSync(companiesDirPath);

let totalUpdated = 0;
let totalMissing = 0;
const missingSlugs = new Set();

for (const file of files) {
  if (!file.endsWith('.json')) continue;
  
  const filePath = path.join(companiesDirPath, file);
  const companyProblems = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let isModified = false;
  
  for (const problem of companyProblems) {
    const problemId = slugToId.get(problem.slug);
    
    if (problemId) {
      if (problem.problem_id !== problemId) {
        problem.problem_id = problemId;
        isModified = true;
      }
    } else {
      console.log(`Warning: Could not find problem_id for slug '${problem.slug}' in ${file}`);
      totalMissing++;
      missingSlugs.add(problem.slug);
    }
  }
  
  if (isModified) {
    fs.writeFileSync(filePath, JSON.stringify(companyProblems, null, 2), 'utf8');
    totalUpdated++;
  }
}

console.log(`Finished processing. Updated ${totalUpdated} company files. Missing slugs: ${totalMissing}`);
console.log(`\n--- Unique Missing Slugs (${missingSlugs.size}) ---`);
console.log(Array.from(missingSlugs).join('\n'));
