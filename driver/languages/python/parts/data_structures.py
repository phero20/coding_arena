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

class Node:
    def __init__(self, val=0, *args, **kwargs):
        self.val = val
        self.next = kwargs.get('next', None)
        self.random = kwargs.get('random', None)
        self.neighbors = kwargs.get('neighbors', None)
        self.children = kwargs.get('children', None)

        if len(args) == 1:
            arg = args[0]
            if isinstance(arg, list):
                self.children = arg
                self.neighbors = arg
            else:
                self.next = arg
        elif len(args) == 2:
            self.next = args[0]
            self.random = args[1]
            
        if self.neighbors is None:
            self.neighbors = []
        if self.children is None:
            self.children = []

class DoublyLinkedListNode:
    def __init__(self, val=0, prev=None, next=None, child=None):
        self.val = val
        self.prev = prev
        self.next = next
        self.child = child

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
    if n == 0:
        sc.next_int()  # consume pos even if empty
        return None
    dummy = ListNode(0)
    curr = dummy
    nodes = [None] * n
    for i in range(n):
        nodes[i] = ListNode(sc.next_int())
        curr.next = nodes[i]
        curr = curr.next
    pos = sc.next_int()
    if 0 <= pos < n:
        curr.next = nodes[pos]
    return dummy.next

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

def build_random_list(n, sc):
    if n == 0: return None
    nodes = [None] * n
    randoms = [0] * n
    for i in range(n):
        nodes[i] = Node(sc.next_int())
        r = sc.next()
        randoms[i] = -1 if r == "null" else int(r)
    for i in range(n):
        if i < n - 1:
            nodes[i].next = nodes[i + 1]
        if randoms[i] != -1:
            nodes[i].random = nodes[randoms[i]]
    return nodes[0]

def build_graph(n, sc):
    if n == 0: return None
    nodes = [None] * (n + 1)
    for i in range(1, n + 1):
        nodes[i] = Node(i)
    for i in range(1, n + 1):
        neighbors_str = sc.next()
        if neighbors_str != "empty" and neighbors_str != "":
            parts = neighbors_str.split(",")
            for p in parts:
                nodes[i].neighbors.append(nodes[int(p)])
    return nodes[1]

def build_doubly_list(n, sc):
    if n == 0: return None
    nodes_val = [sc.next() for _ in range(n)]
    if not nodes_val or nodes_val[0] == "null": return None

    head = DoublyLinkedListNode(int(nodes_val[0]))
    curr = head
    parent_queue = [head]

    i = 1
    while i < n:
        while i < n and nodes_val[i] != "null":
            node = DoublyLinkedListNode(int(nodes_val[i]))
            curr.next = node
            node.prev = curr
            curr = node
            parent_queue.append(curr)
            i += 1
        if i >= n: break
        
        null_count = 0
        while i < n and nodes_val[i] == "null":
            null_count += 1
            i += 1
        if i >= n: break
        
        for _ in range(null_count - 1):
            if parent_queue:
                parent_queue.pop(0)
                
        parent = parent_queue.pop(0) if parent_queue else None
        child_node = DoublyLinkedListNode(int(nodes_val[i]))
        if parent:
            parent.child = child_node
        curr = child_node
        parent_queue.append(curr)
        i += 1
    return head

def build_nary_tree(n, sc):
    if n == 0: return None
    nodes_val = [sc.next() for _ in range(n)]
    if not nodes_val or nodes_val[0] == "null": return None

    root = Node(int(nodes_val[0]))
    q = [root]
    
    i = 1
    if i < n and nodes_val[i] == "null":
        i += 1
        
    while q and i < n:
        curr = q.pop(0)
        children = []
        while i < n and nodes_val[i] != "null":
            child = Node(int(nodes_val[i]))
            children.append(child)
            q.append(child)
            i += 1
        curr.children = children
        if i < n and nodes_val[i] == "null":
            i += 1
    return root
