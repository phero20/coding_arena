import json
import base64

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def serialize(obj):
    if obj is None:
        return "null"
    
    if isinstance(obj, (int, float, bool, str)):
        return json.dumps(obj)
    
    if isinstance(obj, (list, tuple)):
        return "[" + ",".join(serialize(x) for x in obj) + "]"
    
    if isinstance(obj, dict):
        # Sort keys for deterministic serialization
        items = sorted(obj.items())
        return "{" + ",".join(f"{json.dumps(k)}:{serialize(v)}" for k, v in items) + "}"
    
    if isinstance(obj, ListNode):
        res = []
        curr = obj
        while curr:
            res.append(curr.val)
            curr = curr.next
        return serialize(res)
    
    if isinstance(obj, TreeNode):
        # Level-order traversal for tree serialization
        if not obj: return "null"
        res = []
        queue = [obj]
        while queue:
            node = queue.pop(0)
            if node:
                res.append(node.val)
                queue.append(node.left)
                queue.append(node.right)
            else:
                res.append(None)
        # Trim trailing nulls
        while res and res[-1] is None:
            res.pop()
        return serialize(res)
        
    return json.dumps(obj)

def build_list(n, sc):
    if n == 0: return None
    head = ListNode(sc.next_int())
    curr = head
    for _ in range(n - 1):
        curr.next = ListNode(sc.next_int())
        curr = curr.next
    return head

def build_tree(n, sc):
    if n == 0: return None
    nodes = [sc.next() for _ in range(n)]
    if not nodes or nodes[0] == "null": return None
    
    root = TreeNode(int(nodes[0]))
    queue = [root]
    i = 1
    while queue and i < n:
        curr = queue.pop(0)
        
        # Left child
        if i < n and nodes[i] != "null":
            curr.left = TreeNode(int(nodes[i]))
            queue.append(curr.left)
        i += 1
        
        # Right child
        if i < n and nodes[i] != "null":
            curr.right = TreeNode(int(nodes[i]))
            queue.append(curr.right)
        i += 1
    return root
