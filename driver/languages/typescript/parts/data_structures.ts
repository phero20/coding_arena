import { Scanner } from "./scanner";

export class ListNode {
    val: number;
    next: ListNode | null;
    constructor(val: number = 0, next: ListNode | null = null) {
        this.val = val;
        this.next = next;
    }
}

export class TreeNode {
    val: number;
    left: TreeNode | null;
    right: TreeNode | null;
    constructor(val: number = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

export function buildList(size: number, sc: Scanner): ListNode | null {
    if (size === 0) return null;
    const head = new ListNode(sc.nextInt());
    let curr = head;
    for (let i = 1; i < size; i++) {
        curr.next = new ListNode(sc.nextInt());
        curr = curr.next;
    }
    return head;
}

export function buildTree(size: number, sc: Scanner): TreeNode | null {
    if (size === 0) return null;
    const vals: (number | null)[] = [];
    for(let i=0; i<size; i++) {
        const s = sc.nextString();
        vals.push(s === "null" ? null : parseInt(s!));
    }
    
    const root = new TreeNode(vals[0]!);
    const queue: TreeNode[] = [root];
    let i = 1;
    while (queue.length > 0 && i < size) {
        const node = queue.shift()!;
        if (vals[i] !== null) {
            node.left = new TreeNode(vals[i]!);
            queue.push(node.left);
        }
        i++;
        if (i < size && vals[i] !== null) {
            node.right = new TreeNode(vals[i]!);
            queue.push(node.right);
        }
        i++;
    }
    return root;
}
