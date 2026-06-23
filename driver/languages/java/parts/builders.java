    // --- BUILDER HELPERS ---
    /* [[BUILD_LIST_START]] */
    private static ListNode buildList(int n, FastScanner sc) throws Exception {
        if (n == 0) {
            sc.nextInt(); // consume pos even if empty
            return null;
        }
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        ListNode[] nodes = new ListNode[n];
        for (int i = 0; i < n; i++) {
            nodes[i] = new ListNode(sc.nextInt());
            curr.next = nodes[i];
            curr = curr.next;
        }
        int pos = sc.nextInt();
        if (pos >= 0 && pos < n) {
            curr.next = nodes[pos];
        }
        return dummy.next;
    }
    /* [[BUILD_LIST_END]] */

    /* [[BUILD_TREE_START]] */
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
    /* [[BUILD_TREE_END]] */

    /* [[BUILD_RANDOM_LIST_START]] */
    private static Node buildRandomList(int n, FastScanner sc) throws Exception {
        if (n == 0) return null;
        Node[] nodes = new Node[n];
        int[] randoms = new int[n];
        for (int i = 0; i < n; i++) {
            nodes[i] = new Node(sc.nextInt());
            String r = sc.next();
            randoms[i] = r.equals("null") ? -1 : Integer.parseInt(r);
        }
        for (int i = 0; i < n; i++) {
            if (i < n - 1) nodes[i].next = nodes[i + 1];
            if (randoms[i] != -1) nodes[i].random = nodes[randoms[i]];
        }
        return nodes[0];
    }
    /* [[BUILD_RANDOM_LIST_END]] */

    /* [[BUILD_GRAPH_START]] */
    private static Node buildGraph(int n, FastScanner sc) throws Exception {
        if (n == 0) return null;
        Node[] nodes = new Node[n + 1];
        for (int i = 1; i <= n; i++) nodes[i] = new Node(i);
        for (int i = 1; i <= n; i++) {
            String neighborsStr = sc.next();
            if (!neighborsStr.equals("empty") && !neighborsStr.isEmpty()) {
                String[] parts = neighborsStr.split(",");
                for (String p : parts) {
                    nodes[i].neighbors.add(nodes[Integer.parseInt(p)]);
                }
            }
        }
        return nodes[1];
    }
    /* [[BUILD_GRAPH_END]] */

    /* [[BUILD_DOUBLY_LIST_START]] */
    private static DoublyLinkedListNode buildDoublyList(int n, FastScanner sc) throws Exception {
        if (n == 0) return null;
        String[] nodes = new String[n];
        for (int i = 0; i < n; i++) nodes[i] = sc.next();
        if (nodes[0].equals("null")) return null;

        DoublyLinkedListNode head = new DoublyLinkedListNode(Integer.parseInt(nodes[0]));
        DoublyLinkedListNode curr = head;
        Queue<DoublyLinkedListNode> parentQueue = new LinkedList<>();
        parentQueue.add(head);

        int i = 1;
        while (i < n) {
            while (i < n && !nodes[i].equals("null")) {
                DoublyLinkedListNode node = new DoublyLinkedListNode(Integer.parseInt(nodes[i]));
                curr.next = node;
                node.prev = curr;
                curr = node;
                parentQueue.add(curr);
                i++;
            }
            if (i >= n) break;
            
            int nullCount = 0;
            while (i < n && nodes[i].equals("null")) {
                nullCount++;
                i++;
            }
            if (i >= n) break;
            
            for (int k = 0; k < nullCount - 1; k++) {
                if (!parentQueue.isEmpty()) parentQueue.poll();
            }
            
            DoublyLinkedListNode parent = parentQueue.poll();
            DoublyLinkedListNode childNode = new DoublyLinkedListNode(Integer.parseInt(nodes[i]));
            if (parent != null) parent.child = childNode;
            curr = childNode;
            parentQueue.add(curr);
            i++;
        }
        return head;
    }
    /* [[BUILD_DOUBLY_LIST_END]] */

    /* [[BUILD_NARY_TREE_START]] */
    private static Node buildNaryTree(int n, FastScanner sc) throws Exception {
        if (n == 0) return null;
        String[] nodes = new String[n];
        for (int i = 0; i < n; i++) nodes[i] = sc.next();
        if (nodes[0].equals("null")) return null;

        Node root = new Node(Integer.parseInt(nodes[0]));
        Queue<Node> q = new LinkedList<>();
        q.add(root);
        
        int i = 1;
        if (i < n && nodes[i].equals("null")) i++;
        
        while (!q.isEmpty() && i < n) {
            Node curr = q.poll();
            List<Node> children = new ArrayList<>();
            while (i < n && !nodes[i].equals("null")) {
                Node child = new Node(Integer.parseInt(nodes[i]));
                children.add(child);
                q.add(child);
                i++;
            }
            curr.children = children;
            if (i < n && nodes[i].equals("null")) i++;
        }
        return root;
    }
    /* [[BUILD_NARY_TREE_END]] */
