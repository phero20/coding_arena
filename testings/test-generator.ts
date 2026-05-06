import { generateExecutionPackage } from "../driver/index";

/**
 * TEST SCRATCHPAD
 * Paste your signature and test cases here to verify the generated code.
 * Run with: bun driver/test-generator.ts
 */

const LRU_SIGNATURE = {
  class_name: "LRUCache",
  constructor_params: [{ name: "capacity", type: "int" }],
  methods: [
    {
      name: "get",
      return_type: "int",
      params: [{ name: "key", type: "int" }],
    },
    {
      name: "put",
      return_type: "void",
      params: [
        { name: "key", type: "int" },
        { name: "value", type: "int" },
      ],
    },
  ],
};

const LRU_TEST_CASES = [
  {
    input: {
      commands: [
        "LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get",
      ],
      arguments: [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]],
    },
    expected_output: [null, null, null, 1, null, -1, null, -1, 3, 4],
  },
];

const USER_CODE = `import java.util.HashMap;
import java.util.Map;

class LRUCache {
    class Node {
        int key;
        int value;
        Node prev;
        Node next;
        Node(int k, int v) { key = k; value = v; }
    }

    private Map<Integer, Node> map;
    private int capacity;
    private Node head, tail;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.map = new HashMap<>();
        head = new Node(0, 0);
        tail = new Node(0, 0);
        head.next = tail;
        tail.prev = head;
    }

    public int get(int key) {
        if (map.containsKey(key)) {
            Node node = map.get(key);
            remove(node);
            insertAtHead(node);
            return node.value;
        }
        return -1;
    }

    public void put(int key, int value) {
        if (map.containsKey(key)) {
            remove(map.get(key));
        }
        if (map.size() == capacity) {
            map.remove(tail.prev.key);
            remove(tail.prev);
        }
        Node newNode = new Node(key, value);
        insertAtHead(newNode);
        map.put(key, newNode);
    }

    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void insertAtHead(Node node) {
        node.next = head.next;
        node.next.prev = node;
        head.next = node;
        node.prev = head;
    }
}`;

async function runTest() {
  console.log("🚀 Generating Execution Package for LRUCache...");

  try {
    const pkg = await generateExecutionPackage({
      language: "java",
      userCode: USER_CODE,
      signature: LRU_SIGNATURE as any,
      testCases: LRU_TEST_CASES as any,
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
