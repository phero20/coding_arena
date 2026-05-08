function serialize(obj) {
    if (obj === null || obj === undefined) return "null";
    
    if (obj instanceof ListNode) {
        const res = [];
        let curr = obj;
        while (curr) {
            res.push(curr.val);
            curr = curr.next;
        }
        return JSON.stringify(res);
    }
    
    if (obj instanceof TreeNode) {
        // BFS serialization
        const res = [];
        const queue = [obj];
        while (queue.length > 0) {
            const node = queue.shift();
            if (node) {
                res.push(node.val);
                queue.push(node.left);
                queue.push(node.right);
            } else {
                res.push(null);
            }
        }
        // Trim trailing nulls
        while (res.length > 0 && res[res.length - 1] === null) res.pop();
        return JSON.stringify(res);
    }

    return JSON.stringify(obj);
}

function compare(a, b) {
    const s1 = serialize(a);
    const s2 = serialize(b);
    return s1 === s2;
}
