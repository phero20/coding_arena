/* [[LIST_NODE_START]] */
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
/* [[LIST_NODE_END]] */

/* [[TREE_NODE_START]] */
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}
/* [[TREE_NODE_END]] */

/* [[RANDOM_LIST_NODE_START]] */
class Node {
    int val;
    Node next;
    Node random;

    public Node(int val) {
        this.val = val;
        this.next = null;
        this.random = null;
    }
}
/* [[RANDOM_LIST_NODE_END]] */

/* [[GRAPH_NODE_START]] */
class Node {
    public int val;
    public List<Node> neighbors;
    public Node() {
        val = 0;
        neighbors = new ArrayList<Node>();
    }
    public Node(int _val) {
        val = _val;
        neighbors = new ArrayList<Node>();
    }
    public Node(int _val, ArrayList<Node> _neighbors) {
        val = _val;
        neighbors = _neighbors;
    }
}
/* [[GRAPH_NODE_END]] */

/* [[DOUBLY_LIST_NODE_START]] */
class DoublyLinkedListNode {
    int val;
    DoublyLinkedListNode prev;
    DoublyLinkedListNode next;
    DoublyLinkedListNode child;

    public DoublyLinkedListNode() {}

    public DoublyLinkedListNode(int _val) {
        val = _val;
    }

    public DoublyLinkedListNode(int _val, DoublyLinkedListNode _prev, DoublyLinkedListNode _next, DoublyLinkedListNode _child) {
        val = _val;
        prev = _prev;
        next = _next;
        child = _child;
    }
}
/* [[DOUBLY_LIST_NODE_END]] */

/* [[NARY_TREE_NODE_START]] */
class Node {
    public int val;
    public List<Node> children;

    public Node() {}

    public Node(int _val) {
        val = _val;
    }

    public Node(int _val, List<Node> _children) {
        val = _val;
        children = _children;
    }
}
/* [[NARY_TREE_NODE_END]] */
