import { generateExecutionPackage } from "../driver/index";

/**
 * TEST SCRATCHPAD
 * Paste your signature and test cases here to verify the generated code.
 * Run with: bun driver/test-generator.ts
 */

const SAMPLE_SIGNATURE = {
  name: "addTwoNumbers",
  return_type: "ListNode",
  params: [
    { name: "l1", type: "ListNode" },
    { name: "l2", type: "ListNode" },
  ],
  param_order: ["l1", "l2"],
};

const SAMPLE_TEST_CASES = [
  {
    input: {
      l1: [2, 4, 3],
      l2: [5, 6, 4],
    },
    expected_output: [7, 0, 8],
  },
  {
    input: {
      l1: [0],
      l2: [0],
    },
    expected_output: [0],
  },
  {
    input: {
      l1: [9, 9, 9, 9, 9, 9, 9],
      l2: [9, 9, 9, 9],
    },
    expected_output: [8, 9, 9, 9, 0, 0, 0, 1],
  },
];

const USER_CODE = `class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0); 
        ListNode current = dummy;
        int carry = 0;

        while (l1 != null || l2 != null || carry != 0) {
            int sum = carry;
            if (l1 != null) {
                sum += l1.val;
                l1 = l1.next;
            }
            if (l2 != null) {
                sum += l2.val;
                l2 = l2.next;
            }

            carry = sum / 10;
            current.next = new ListNode(sum % 10);
            current = current.next;
        }

        return dummy.next;
    }
}`;

async function runTest() {
  console.log("🚀 Generating Execution Package for Java...");

  try {
    const pkg = await generateExecutionPackage({
      language: "java",
      userCode: USER_CODE,
      signature: SAMPLE_SIGNATURE,
      testCases: SAMPLE_TEST_CASES,
    });

    console.log("\n--- GENERATED SOURCE CODE ---");
    console.log(pkg.sourceCode);

    console.log("\n--- GENERATED STDIN ---");
    console.log(pkg.stdin);

    console.log("\n--- JUDGE0 CONFIG ---");
    console.log(`Language ID: ${pkg.languageId}`);

    console.log("\n✅ Generation Successful!");
  } catch (error) {
    console.error("\n❌ Generation Failed:", error);
  }
}

runTest();
