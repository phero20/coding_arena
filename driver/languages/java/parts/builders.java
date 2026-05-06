    // --- BUILDER HELPERS ---
    private static ListNode buildList(int n, FastScanner sc) throws Exception {
        if (n == 0) return null;
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        for (int i = 0; i < n; i++) {
            curr.next = new ListNode(sc.nextInt());
            curr = curr.next;
        }
        return dummy.next;
    }

    private static TreeNode buildTree(int n, FastScanner sc) throws Exception {
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
