    // --- DEEP COMPARATOR ---
    private static final class DeepComparator {
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

            if (a.getClass().isArray() && b.getClass().isArray()) {
                int la = java.lang.reflect.Array.getLength(a);
                int lb = java.lang.reflect.Array.getLength(b);
                if (la != lb) return false;
                List<String> sa = new ArrayList<>(), sb = new ArrayList<>();
                for (int i = 0; i < la; i++) sa.add(serialize(java.lang.reflect.Array.get(a, i)));
                for (int i = 0; i < lb; i++) sb.add(serialize(java.lang.reflect.Array.get(b, i)));
                if (unordered) { Collections.sort(sa); Collections.sort(sb); }
                for (int i = 0; i < sa.size(); i++) if (!sa.get(i).equals(sb.get(i))) return false;
                return true;
            }

            if (a instanceof List && b instanceof List) {
                List<?> la = (List<?>) a;
                List<?> lb = (List<?>) b;
                if (la.size() != lb.size()) return false;
                if (unordered) {
                    List<String> sa = new ArrayList<>(), sb = new ArrayList<>();
                    for (Object x : la) sa.add(serialize(x));
                    for (Object x : lb) sb.add(serialize(x));
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
            if (a instanceof ListNode && b instanceof ListNode) return serialize(a).equals(serialize(b));
            if (a instanceof TreeNode && b instanceof TreeNode) return serialize(a).equals(serialize(b));

            return serialize(a).equals(serialize(b));
        }
    }
