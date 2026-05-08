using System;
using System.Collections.Generic;
using System.Text;

public class Comparator {
    public static string Serialize(object obj) {
        if (obj == null) return "null";
        if (obj is ListNode head) return SerializeListNode(head);
        if (obj is TreeNode root) return SerializeTreeNode(root);
        if (obj is string s) return "\"" + s + "\"";
        if (obj is bool b) return b.ToString().ToLower();
        if (obj is System.Collections.IEnumerable enumerable) return SerializeEnumerable(enumerable);
        return obj.ToString();
    }

    private static string SerializeEnumerable(System.Collections.IEnumerable enumerable) {
        StringBuilder sb = new StringBuilder();
        sb.Append("[");
        bool first = true;
        foreach (var item in enumerable) {
            if (!first) sb.Append(",");
            sb.Append(Serialize(item));
            first = false;
        }
        sb.Append("]");
        return sb.ToString();
    }

    private static string SerializeListNode(ListNode head) {
        List<int> result = new List<int>();
        ListNode curr = head;
        while (curr != null) {
            result.Add(curr.val);
            curr = curr.next;
        }
        return SerializeEnumerable(result);
    }

    private static string SerializeTreeNode(TreeNode root) {
        if (root == null) return "[]";
        List<string> result = new List<string>();
        Queue<TreeNode> queue = new Queue<TreeNode>();
        queue.Enqueue(root);
        while (queue.Count > 0) {
            TreeNode node = queue.Dequeue();
            if (node == null) {
                result.Add("null");
            } else {
                result.Add(node.val.ToString());
                queue.Enqueue(node.left);
                queue.Enqueue(node.right);
            }
        }
        while (result.Count > 0 && result[result.Count - 1] == "null") {
            result.RemoveAt(result.Count - 1);
        }
        return "[" + string.Join(",", result.ToArray()) + "]";
    }
}
