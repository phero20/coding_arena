import math

class DeepComparator:
    @staticmethod
    def equals(actual, expected, eps=1e-6, unordered=False):
        if actual is None or expected is None:
            return actual == expected
            
        # Handle Numbers
        if isinstance(expected, (int, float)) and isinstance(actual, (int, float)):
            return math.isclose(actual, expected, rel_tol=eps, abs_tol=eps)
            
        # Handle Lists / Iterables
        if isinstance(expected, (list, tuple)) and isinstance(actual, (list, tuple)):
            if len(actual) != len(expected):
                return False
            if unordered:
                # Naive unordered check (works for primitives, might need sort/freq for objects)
                try:
                    return sorted(actual) == sorted(expected)
                except:
                    # Fallback if not sortable
                    pass
            
            for a, e in zip(actual, expected):
                if not DeepComparator.equals(a, e, eps, unordered):
                    return False
            return True
            
        # Handle Dicts
        if isinstance(expected, dict) and isinstance(actual, dict):
            if len(actual) != len(expected):
                return False
            for k in expected:
                if k not in actual:
                    return False
                if not DeepComparator.equals(actual[k], expected[k], eps, unordered):
                    return False
            return True
            
        # Handle Custom Nodes (ListNode, TreeNode)
        if hasattr(expected, "val") and hasattr(actual, "val"):
            if not DeepComparator.equals(actual.val, expected.val, eps, unordered):
                return False
            
            # ListNode
            if hasattr(expected, "next") and hasattr(actual, "next"):
                return DeepComparator.equals(actual.next, expected.next, eps, unordered)
            
            # TreeNode
            if hasattr(expected, "left") and hasattr(actual, "left"):
                if not DeepComparator.equals(actual.left, expected.left, eps, unordered):
                    return False
                return DeepComparator.equals(actual.right, expected.right, eps, unordered)

        return actual == expected
