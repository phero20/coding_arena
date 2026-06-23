    // --- DEEP COMPARATOR ---
    private static final class DeepComparator {
        private static String deepNormalizeString(Object obj) {
            if (obj == null) return "null";
            boolean isCol = obj instanceof List || obj.getClass().isArray();
            if (isCol) {
                List<String> strItems = new ArrayList<>();
                if (obj instanceof List) {
                    for (Object item : (List<?>) obj) strItems.add(deepNormalizeString(item));
                } else {
                    int len = java.lang.reflect.Array.getLength(obj);
                    for (int i = 0; i < len; i++) strItems.add(deepNormalizeString(java.lang.reflect.Array.get(obj, i)));
                }
                Collections.sort(strItems);
                return "[" + String.join(",", strItems) + "]";
            }
            return serialize(obj);
        }

        static boolean equals(Object a, Object b, double eps, boolean unordered) {
            if (a == b) return true;
            if (a == null || b == null) return false;

            if (a instanceof Number && b instanceof Number) {
                double da = ((Number) a).doubleValue();
                double db = ((Number) b).doubleValue();
                if (a instanceof Float || a instanceof Double || b instanceof Float || b instanceof Double) {
                    return Math.abs(da - db) <= eps;
                }
                return da == db;
            }

            if (a instanceof Boolean && b instanceof Boolean) return a.equals(b);
            if (a instanceof Character && b instanceof Character) return a.equals(b);
            if (a instanceof String && b instanceof String) return a.equals(b);

            boolean isColA = a instanceof List || a.getClass().isArray();
            boolean isColB = b instanceof List || b.getClass().isArray();

            if (isColA && isColB) {
                List<Object> la = new ArrayList<>();
                if (a instanceof List) {
                    la.addAll((List<?>) a);
                } else {
                    int len = java.lang.reflect.Array.getLength(a);
                    for (int i = 0; i < len; i++) la.add(java.lang.reflect.Array.get(a, i));
                }

                List<Object> lb = new ArrayList<>();
                if (b instanceof List) {
                    lb.addAll((List<?>) b);
                } else {
                    int len = java.lang.reflect.Array.getLength(b);
                    for (int i = 0; i < len; i++) lb.add(java.lang.reflect.Array.get(b, i));
                }

                if (la.size() != lb.size()) return false;

                if (unordered) {
                    List<String> sa = new ArrayList<>(), sb = new ArrayList<>();
                    for (Object x : la) sa.add(deepNormalizeString(x));
                    for (Object x : lb) sb.add(deepNormalizeString(x));
                    Collections.sort(sa); Collections.sort(sb);
                    return sa.equals(sb);
                }
                
                for (int i = 0; i < la.size(); i++) {
                    if (!equals(la.get(i), lb.get(i), eps, unordered)) return false;
                }
                return true;
            }

            if (a instanceof Set && b instanceof Set) return serialize(a).equals(serialize(b));
            if (a instanceof Map && b instanceof Map) return serialize(a).equals(serialize(b));
            /* [[LIST_NODE_START]] */
            if (a instanceof ListNode && b instanceof ListNode) return serialize(a).equals(serialize(b));
            /* [[LIST_NODE_END]] */
            /* [[TREE_NODE_START]] */
            if (a instanceof TreeNode && b instanceof TreeNode) return serialize(a).equals(serialize(b));
            /* [[TREE_NODE_END]] */

            return serialize(a).equals(serialize(b));
        }
    }
