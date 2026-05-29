using System;
using System.Collections.Generic;

public class ListNode {
    public int val;
    public ListNode next;
    public ListNode(int val = 0, ListNode next = null) {
        this.val = val;
        this.next = next;
    }

    public static ListNode Build(List<int> vals) {
        if (vals == null || vals.Count == 0) return null;
        ListNode head = new ListNode(vals[0]);
        ListNode curr = head;
        for (int i = 1; i < vals.Count; i++) {
            curr.next = new ListNode(vals[i]);
            curr = curr.next;
        }
        return head;
    }
}

public class TreeNode {
    public int val;
    public TreeNode left;
    public TreeNode right;
    public TreeNode(int val = 0, TreeNode left = null, TreeNode right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }

    public static TreeNode Build(List<int?> vals) {
        if (vals == null || vals.Count == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0].Value);
        Queue<TreeNode> queue = new Queue<TreeNode>();
        queue.Enqueue(root);
        int i = 1;
        while (i < vals.Count) {
            TreeNode curr = queue.Dequeue();
            if (i < vals.Count && vals[i] != null) {
                curr.left = new TreeNode(vals[i].Value);
                queue.Enqueue(curr.left);
            }
            i++;
            if (i < vals.Count && vals[i] != null) {
                curr.right = new TreeNode(vals[i].Value);
                queue.Enqueue(curr.right);
            }
            i++;
        }
        return root;
    }
}
