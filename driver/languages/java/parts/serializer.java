    // --- DECODER HELPERS ---
    private static String decodeString(String s) {
        if (s.equals("-")) return "";
        return new String(Base64.getDecoder().decode(s));
    }

    private static String escapeString(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (c == '\\') sb.append("\\\\");
            else if (c == '\"') sb.append("\\\"");
            else if (c == '\n') sb.append("\\n");
            else if (c == '\r') sb.append("\\r");
            else if (c == '\t') sb.append("\\t");
            else sb.append(c);
        }
        return sb.toString();
    }

    // --- SERIALIZATION HELPERS ---
    private static String serialize(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof String) return "\"" + escapeString((String) obj) + "\"";
        if (obj instanceof Character) return "\"" + escapeString(String.valueOf(obj)) + "\"";
        if (obj instanceof int[]) return Arrays.toString((int[]) obj).replace(" ", "");
        if (obj instanceof long[]) return Arrays.toString((long[]) obj).replace(" ", "");
        if (obj instanceof double[]) return Arrays.toString((double[]) obj).replace(" ", "");
        if (obj instanceof float[]) return Arrays.toString((float[]) obj).replace(" ", "");
        if (obj instanceof char[]) {
            char[] arr = (char[]) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) {
                sb.append("\"").append(escapeString(String.valueOf(arr[i]))).append("\"");
                if (i < arr.length - 1) sb.append(",");
            }
            return sb.append("]").toString();
        }
        if (obj instanceof boolean[]) return Arrays.toString((boolean[]) obj).replace(" ", "");
        if (obj instanceof Object[]) {
            Object[] arr = (Object[]) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) {
                sb.append(serialize(arr[i]));
                if (i < arr.length - 1) sb.append(",");
            }
            return sb.append("]").toString();
        }

        if (obj instanceof List) {
            List<?> list = (List<?>) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) {
                sb.append(serialize(list.get(i)));
                if (i < list.size() - 1) sb.append(",");
            }
            return sb.append("]").toString();
        }
        if (obj instanceof Set) {
            Set<?> set = (Set<?>) obj;
            List<String> items = new ArrayList<>();
            for (Object item : set) items.add(serialize(item));
            Collections.sort(items);
            return "[" + String.join(",", items) + "]";
        }
        if (obj instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) obj;
            List<String> entries = new ArrayList<>();
            for (Map.Entry<?, ?> e : map.entrySet()) {
                entries.add(serialize(e.getKey()) + ":" + serialize(e.getValue()));
            }
            Collections.sort(entries);
            return "{" + String.join(",", entries) + "}";
        }

        /* [[LIST_NODE_START]] */
        if (obj instanceof ListNode) return serializeList((ListNode) obj);
        /* [[LIST_NODE_END]] */
        /* [[RANDOM_LIST_NODE_START]] */
        if (obj instanceof Node) return serializeRandomList((Node) obj);
        /* [[RANDOM_LIST_NODE_END]] */
        /* [[GRAPH_NODE_START]] */
        if (obj instanceof Node) return serializeGraph((Node) obj);
        /* [[GRAPH_NODE_END]] */
        /* [[TREE_NODE_START]] */
        if (obj instanceof TreeNode) return serializeTree((TreeNode) obj);
        /* [[TREE_NODE_END]] */
        /* [[NARY_TREE_NODE_START]] */
        if (obj instanceof Node) return serializeNaryTree((Node) obj);
        /* [[NARY_TREE_NODE_END]] */
        /* [[DOUBLY_LIST_NODE_START]] */
        if (obj instanceof DoublyLinkedListNode) return serializeDoublyList((DoublyLinkedListNode) obj);
        /* [[DOUBLY_LIST_NODE_END]] */

        return String.valueOf(obj);
    }

    /* [[LIST_NODE_START]] */
    private static String serializeList(ListNode head) {
        Set<ListNode> visited = new HashSet<>();
        StringBuilder sb = new StringBuilder("[");
        while (head != null) {
            if (visited.contains(head)) {
                sb.append("\"CYCLE\"");
                break;
            }
            visited.add(head);
            sb.append(head.val);
            if (head.next != null) sb.append(",");
            head = head.next;
        }
        return sb.append("]").toString();
    }
    /* [[LIST_NODE_END]] */

    /* [[TREE_NODE_START]] */
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
    /* [[TREE_NODE_END]] */

    /* [[RANDOM_LIST_NODE_START]] */
    private static String serializeRandomList(Node head) {
        if (head == null) return "[]";
        List<Node> list = new ArrayList<>();
        Node curr = head;
        while (curr != null) {
            list.add(curr);
            curr = curr.next;
        }
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            Node n = list.get(i);
            sb.append("[").append(n.val).append(",");
            if (n.random == null) {
                sb.append("null");
            } else {
                sb.append(list.indexOf(n.random));
            }
            sb.append("]");
            if (i < list.size() - 1) sb.append(",");
        }
        return sb.append("]").toString();
    }
    /* [[RANDOM_LIST_NODE_END]] */

    /* [[GRAPH_NODE_START]] */
    private static String serializeGraph(Node node) {
        if (node == null) return "[]";
        Map<Node, Node> visited = new HashMap<>();
        Queue<Node> q = new LinkedList<>();
        q.add(node);
        visited.put(node, node);
        
        List<Node> allNodes = new ArrayList<>();
        while (!q.isEmpty()) {
            Node curr = q.poll();
            allNodes.add(curr);
            for (Node neighbor : curr.neighbors) {
                if (!visited.containsKey(neighbor)) {
                    visited.put(neighbor, neighbor);
                    q.add(neighbor);
                }
            }
        }
        
        Collections.sort(allNodes, (a, b) -> Integer.compare(a.val, b.val));
        
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < allNodes.size(); i++) {
            Node curr = allNodes.get(i);
            sb.append("[");
            for (int j = 0; j < curr.neighbors.size(); j++) {
                sb.append(curr.neighbors.get(j).val);
                if (j < curr.neighbors.size() - 1) sb.append(",");
            }
            sb.append("]");
            if (i < allNodes.size() - 1) sb.append(",");
        }
        return sb.append("]").toString();
    }
    /* [[GRAPH_NODE_END]] */

    /* [[NARY_TREE_NODE_START]] */
    private static String serializeNaryTree(Node root) {
        if (root == null) return "[]";
        List<String> res = new ArrayList<>();
        res.add(String.valueOf(root.val));
        res.add("null");
        Queue<Node> q = new LinkedList<>();
        q.add(root);
        while (!q.isEmpty()) {
            Node curr = q.poll();
            if (curr.children != null) {
                for (Node child : curr.children) {
                    res.add(String.valueOf(child.val));
                    q.add(child);
                }
            }
            res.add("null");
        }
        while (res.size() > 0 && res.get(res.size() - 1).equals("null")) {
            res.remove(res.size() - 1);
        }
        return "[" + String.join(",", res) + "]";
    }
    /* [[NARY_TREE_NODE_END]] */

    /* [[DOUBLY_LIST_NODE_START]] */
    private static String serializeDoublyList(DoublyLinkedListNode head) {
        if (head == null) return "[]";
        List<String> res = new ArrayList<>();
        DoublyLinkedListNode curr = head;
        while (curr != null) {
            res.add(String.valueOf(curr.val));
            curr = curr.next;
        }
        return "[" + String.join(",", res) + "]";
    }
    /* [[DOUBLY_LIST_NODE_END]] */
