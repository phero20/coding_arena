class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}

class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

function buildList(size, sc) {
    if (size === 0) return null;
    const head = new ListNode(sc.nextInt());
    let curr = head;
    for (let i = 1; i < size; i++) {
        curr.next = new ListNode(sc.nextInt());
        curr = curr.next;
    }
    return head;
}

function buildTree(size, sc) {
    // Simplified BFS tree builder (LeetCode style)
    if (size === 0) return null;
    const vals = [];
    for(let i=0; i<size; i++) {
        const s = sc.nextString();
        vals.push(s === "null" ? null : parseInt(s));
    }
    
    const root = new TreeNode(vals[0]);
    const queue = [root];
    let i = 1;
    while (queue.length > 0 && i < size) {
        const node = queue.shift();
        if (vals[i] !== null) {
            node.left = new TreeNode(vals[i]);
            queue.push(node.left);
        }
        i++;
        if (i < size && vals[i] !== null) {
            node.right = new TreeNode(vals[i]);
            queue.push(node.right);
        }
        i++;
    }
    return root;
}
