import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const RESULTS_PATH = resolve('test-results/results.json');

if (!existsSync(RESULTS_PATH)) {
  console.error('No test results found at test-results/results.json');
  console.error('Run "npm run test:e2e" first to generate results.');
  process.exit(1);
}

const raw = readFileSync(RESULTS_PATH, 'utf-8');
const report = JSON.parse(raw);

const suites = report.suites || [];
let passed = 0;
let failed = 0;
let skipped = 0;
let flaky = 0;
let totalDuration = 0;
const failedTests = [];

function processSpecs(specs) {
  for (const spec of specs) {
    if (!spec.tests) continue;
    for (const t of spec.tests) {
      const results = t.results || [];
      const lastResult = results[results.length - 1];
      const status = t.status || lastResult?.status || 'unknown';
      const duration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
      totalDuration += duration;

      if (status === 'expected' || status === 'passed') {
        passed++;
      } else if (status === 'unexpected' || status === 'failed') {
        failed++;
        failedTests.push({
          title: spec.title + ' > ' + t.title,
          error: lastResult?.error?.message || 'Unknown error',
          duration,
        });
      } else if (status === 'skipped') {
        skipped++;
      } else if (status === 'flaky') {
        flaky++;
      }
    }
  }
}

function processSuites(suiteList) {
  for (const suite of suiteList) {
    if (suite.specs) processSpecs(suite.specs);
    if (suite.suites) processSuites(suite.suites);
  }
}

processSuites(suites);

const total = passed + failed + skipped + flaky;
const durationSec = (totalDuration / 1000).toFixed(1);

console.log('\n' + '='.repeat(60));
console.log('  PLAYWRIGHT TEST SUMMARY');
console.log('='.repeat(60));
console.log();
console.log(`  Total Tests:  ${total}`);
console.log(`  Passed:       ${passed}`);
console.log(`  Failed:       ${failed}`);
console.log(`  Skipped:      ${skipped}`);
console.log(`  Flaky:        ${flaky}`);
console.log(`  Duration:     ${durationSec}s`);
console.log();

if (total > 0) {
  const passRate = ((passed / total) * 100).toFixed(1);
  const bar =
    '█'.repeat(Math.round((passed / total) * 30)) +
    '░'.repeat(30 - Math.round((passed / total) * 30));
  console.log(`  Pass Rate:    ${passRate}% [${bar}]`);
}

if (failedTests.length > 0) {
  console.log();
  console.log('-'.repeat(60));
  console.log('  FAILED TESTS');
  console.log('-'.repeat(60));
  for (const ft of failedTests) {
    console.log();
    console.log(`  Test:     ${ft.title}`);
    console.log(`  Duration: ${(ft.duration / 1000).toFixed(1)}s`);
    console.log(`  Error:    ${ft.error.slice(0, 200)}`);
  }
}

console.log();
console.log('='.repeat(60));
console.log('  Run "npm run test:report" to view the full HTML report');
console.log('='.repeat(60));
console.log();

process.exit(failed > 0 ? 1 : 0);
