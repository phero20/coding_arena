import http from 'k6/http';
import { check, sleep, group } from 'k6';

/**
 * Load test for competitive coding arena submissions
 * Tests 50 concurrent submissions to evaluate system capacity
 * 
 * Usage:
 * k6 run load-test.js
 * 
 * Monitor during test:
 * - docker exec coding-arena-redis redis-cli MONITOR
 * - docker-compose logs -f api
 */

// Configuration with proper ramp-up stages
export const options = {
  stages: [
    { duration: '10s', target: 50 },   // Ramp up to 50 users over 10s
    { duration: '4m', target: 50 },    // Stay at 50 for 4 minutes
    { duration: '10s', target: 0 },    // Ramp down to 0 over 10s
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000', 'p(99)<2000'],  // 95% requests < 1s, 99% < 2s
    'http_req_failed': ['rate<0.05'],                    // Less than 5% failures allowed
  },
  ext: {
    loadimpact: {
      projectID: 3404544,
      // name: 'Coding Arena Load Test'
    },
  },
};

// Test data - variety of problems and code samples
const testProblems = [
  {
    id: '1',
    code: 'function add(a, b) { return a + b; }',
    lang: 'javascript',
    desc: 'Simple add function'
  },
  {
    id: '2',
    code: 'def fibonacci(n):\n  if n <= 1:\n    return n\n  return fibonacci(n-1) + fibonacci(n-2)',
    lang: 'python',
    desc: 'Fibonacci recursion'
  },
  {
    id: '1',
    code: 'const multiply = (x, y) => x * y;\nmodule.exports = multiply;',
    lang: 'javascript',
    desc: 'Multiply function'
  },
  {
    id: '2',
    code: 'def is_palindrome(s):\n  return s == s[::-1]',
    lang: 'python',
    desc: 'Palindrome check'
  },
  {
    id: '1',
    code: 'function sum_array(arr) {\n  return arr.reduce((a, b) => a + b, 0);\n}',
    lang: 'javascript',
    desc: 'Array sum'
  },
];

// Simulated auth token (get real one from your system)
const AUTH_TOKEN = 'eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18zQWtDNGJPUW1Zd3JJcmduTXYxZWJibk8yRHgiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwOi8vbG9jYWxob3N0OjMwMDEiLCJleHAiOjE3NzM4MjY1OTEsImZ2YSI6WzU4MjYsLTFdLCJpYXQiOjE3NzM4MjY1MzEsImlzcyI6Imh0dHBzOi8vY2xlYW4tY29kLTc3LmNsZXJrLmFjY291bnRzLmRldiIsIm5iZiI6MTc3MzgyNjUyMSwic2lkIjoic2Vzc18zQXZkTFF5eWpsTldXTUVHd3ZQWVhyNFhjWGkiLCJzdHMiOiJhY3RpdmUiLCJzdWIiOiJ1c2VyXzNBdmRMVmE2TjdhbTNmTTdGNHRoMGVCMm5vSyIsInYiOjJ9.AOAgWtJy7V8cCSLP7CL_8NYgd8mRkiSPhENFDtt8CEuwgcVLErE6xWUjfj0Qj5DaGIjijfRGvGFcTznWVmtC2_cWiaGggksL1ybO2cQTWq3ZvSicloLJY3lS_rkhmpaJMM0UZgwMv7tmG8Gi625lBfSuQW_0oBAeg5XUhIC1t3XdhVGxwnagBpPxl_6tvztLqlofftyWy-a6RjHGLw1mFjsMoAELVPzxqAiRs0F1FloHxbXw_tFgEDXJCokGdM6EZIENiBpm7_ViaIH-SitRfadCk4HW8L7ZyQ4wWAAPqgAMv7gGMq81H_EwYaN9UiO6VmYpB-zx7Ruz9qwyNklhDw';

// Counter for tracking submissions
let submissionCount = 0;
let successCount = 0;
let failureCount = 0;

export default function () {
  group('Submit Code Execution', () => {
    // Select random problem
    const problem = testProblems[Math.floor(Math.random() * testProblems.length)];
    
    // Create POST request payload
    const payload = {
      problem_id: problem.id,
      language_id: problem.lang,
      source_code: problem.code,
    };

    // Make HTTP request to your API
    const response = http.post(
      'http://localhost:3000/api/v1/submissions/submit',
      JSON.stringify(payload),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'User-Agent': 'k6-load-test/1.0',
        },
        timeout: '30s',
      }
    );

    // Track submission
    submissionCount++;

    // Validate response
    const isSuccess = check(response, {
      'POST status is 201': (r) => r.status === 201,
      'response has submissionId': (r) => r.json('data.submissionId') !== null && r.json('data.submissionId') !== undefined,
      'response has PENDING status': (r) => r.json('data.status') === 'PENDING',
      'response time < 1s': (r) => r.timings.duration < 1000,
    });

    if (isSuccess) {
      successCount++;
      const submissionId = response.json('data.submissionId');
      console.log(`✅ Submission #${submissionCount} success: ${submissionId} (${problem.desc})`);
    } else {
      failureCount++;
      console.log(`❌ Submission #${submissionCount} FAILED: ${response.status} - ${response.body}`);
    }

    // Realistic delay between submissions (1-2 seconds between user actions)
    sleep(1);
  });
}

// Teardown - runs after all VUs finish
export function teardown() {
  console.log(`\n\n========== LOAD TEST SUMMARY ==========`);
  console.log(`Total Submissions: ${submissionCount}`);
  console.log(`Successful: ${successCount} (${((successCount/submissionCount)*100).toFixed(2)}%)`);
  console.log(`Failed: ${failureCount} (${((failureCount/submissionCount)*100).toFixed(2)}%)`);
  console.log(`========================================\n`);
}