import java.util.*;
import java.io.*;

class ListNode {
    int val;
    ListNode next;
    ListNode(int x) { val = x; }
}

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

public class Main {
    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        Solution solution = new Solution();

        if (!sc.hasNextInt()) return;
        int numCases = sc.nextInt();

        for (int i = 0; i < numCases; i++) {
            try {
                // {{DRIVER_LOGIC_PLACEHOLDER}}
            } catch (Exception e) {
                System.out.println("@@RUNTIME_ERROR@@:" + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    // --- DECODER HELPERS ---
    private static String decodeString(String s) {
        return new String(Base64.getDecoder().decode(s));
    }

    // --- SERIALIZATION HELPERS ---
    private static String serialize(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof String) return "\"" + obj + "\"";
        if (obj instanceof Character) return "\"" + obj + "\"";
        if (obj instanceof int[]) return Arrays.toString((int[]) obj).replace(" ", "");
        if (obj instanceof char[]) return Arrays.toString((char[]) obj).replace(" ", "");
        if (obj instanceof boolean[]) return Arrays.toString((boolean[]) obj).replace(" ", "");
        if (obj instanceof String[]) return Arrays.toString((Object[]) obj).replace(" ", "");
        
        if (obj instanceof List) {
            List<?> list = (List<?>) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) {
                sb.append(serialize(list.get(i)));
                if (i < list.size() - 1) sb.append(",");
            }
            return sb.append("]").toString();
        }

        if (obj instanceof int[][]) {
            StringBuilder sb = new StringBuilder("[");
            int[][] matrix = (int[][]) obj;
            for (int i = 0; i < matrix.length; i++) {
                sb.append(Arrays.toString(matrix[i]).replace(" ", ""));
                if (i < matrix.length - 1) sb.append(",");
            }
            return sb.append("]").toString();
        }

        if (obj instanceof ListNode) return serializeList((ListNode) obj);
        if (obj instanceof TreeNode) return serializeTree((TreeNode) obj);

        return String.valueOf(obj);
    }

    private static String serializeList(ListNode head) {
        StringBuilder sb = new StringBuilder("[");
        while (head != null) {
            sb.append(head.val);
            if (head.next != null) sb.append(",");
            head = head.next;
        }
        return sb.append("]").toString();
    }

    private static String serializeTree(TreeNode root) {
        if (root == null) return "[]";
        List<String> vals = new ArrayList<>();
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        while (!q.isEmpty()) {
            TreeNode curr = q.poll();
            if (curr == null) {
                vals.add("null");
            } else {
                vals.add(String.valueOf(curr.val));
                q.add(curr.left);
                q.add(curr.right);
            }
        }
        while (!vals.isEmpty() && vals.get(vals.size() - 1).equals("null")) {
            vals.remove(vals.size() - 1);
        }
        return "[" + String.join(",", vals) + "]";
    }

    // --- BUILDER HELPERS ---
    private static ListNode buildList(int n, Scanner sc) {
        if (n == 0) return null;
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        for (int i = 0; i < n; i++) {
            curr.next = new ListNode(sc.nextInt());
            curr = curr.next;
        }
        return dummy.next;
    }

    private static TreeNode buildTree(int n, Scanner sc) {
        if (n == 0) return null;
        String[] nodes = new String[n];
        for (int i = 0; i < n; i++) nodes[i] = sc.next();
        if (nodes[0].equals("null")) return null;
        
        TreeNode root = new TreeNode(Integer.parseInt(nodes[0]));
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < n) {
            TreeNode curr = q.poll();
            if (i < n && !nodes[i].equals("null")) {
                curr.left = new TreeNode(Integer.parseInt(nodes[i]));
                q.add(curr.left);
            }
            i++;
            if (i < n && !nodes[i].equals("null")) {
                curr.right = new TreeNode(Integer.parseInt(nodes[i]));
                q.add(curr.right);
            }
            i++;
        }
        return root;
    }
}

// --- USER CODE START ---
{{USER_CODE}}
// --- USER CODE END ---
