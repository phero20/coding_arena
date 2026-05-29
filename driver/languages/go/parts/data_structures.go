package main

type ListNode struct {
	Val  int
	Next *ListNode
}

func buildListNode(vals []int) *ListNode {
	var head *ListNode
	for i := len(vals) - 1; i >= 0; i-- {
		node := &ListNode{Val: vals[i], Next: head}
		head = node
	}
	return head
}

type TreeNode struct {
	Val   int
	Left  *TreeNode
	Right *TreeNode
}

func buildTreeNode(vals []*int) *TreeNode {
	if len(vals) == 0 || vals[0] == nil {
		return nil
	}

	root := &TreeNode{Val: *vals[0]}
	queue := []*TreeNode{root}
	i := 1

	for len(queue) > 0 && i < len(vals) {
		curr := queue[0]
		queue = queue[1:]

		if i < len(vals) {
			if vals[i] != nil {
				curr.Left = &TreeNode{Val: *vals[i]}
				queue = append(queue, curr.Left)
			}
			i++
		}

		if i < len(vals) {
			if vals[i] != nil {
				curr.Right = &TreeNode{Val: *vals[i]}
				queue = append(queue, curr.Right)
			}
			i++
		}
	}

	return root
}
