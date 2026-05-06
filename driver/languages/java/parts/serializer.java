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
        if (obj instanceof long[]) return Arrays.toString((long[]) obj).replace(" ", "");
        if (obj instanceof double[]) return Arrays.toString((double[]) obj).replace(" ", "");
        if (obj instanceof float[]) return Arrays.toString((float[]) obj).replace(" ", "");
        if (obj instanceof char[]) return Arrays.toString((char[]) obj).replace(" ", "");
        if (obj instanceof boolean[]) return Arrays.toString((boolean[]) obj).replace(" ", "");
        if (obj instanceof String[]) return Arrays.toString((Object[]) obj).replace(" ", "");
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
