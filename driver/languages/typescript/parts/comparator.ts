import { ListNode, TreeNode } from "./data_structures";

export function serialize(obj: any): string {
    if (obj === null || obj === undefined) return "null";
    
    if (obj instanceof ListNode) {
        const res: number[] = [];
        let curr: ListNode | null = obj;
        while (curr) {
            res.push(curr.val);
            curr = curr.next;
        }
        return JSON.stringify(res);
    }
    
    if (obj instanceof TreeNode) {
        const res: (number | null)[] = [];
        const queue: (TreeNode | null)[] = [obj];
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
        while (res.length > 0 && res[res.length - 1] === null) res.pop();
        return JSON.stringify(res);
    }

    return JSON.stringify(obj);
}

export function compare(a: any, b: any): boolean {
    const s1 = serialize(a);
    const s2 = serialize(b);
    return s1 === s2;
}
