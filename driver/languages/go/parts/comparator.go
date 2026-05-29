package main

import (
	"fmt"
	"strconv"
	"strings"
)

type Comparator struct{}

func (c *Comparator) SerializeListNode(head *ListNode) string {
	var vals []string
	curr := head
	for curr != nil {
		vals = append(vals, strconv.Itoa(curr.Val))
		curr = curr.Next
	}
	return "[" + strings.Join(vals, ",") + "]"
}

func (c *Comparator) SerializeTreeNode(root *TreeNode) string {
	if root == nil {
		return "[]"
	}
	var res []string
	queue := []*TreeNode{root}

	for len(queue) > 0 {
		node := queue[0]
		queue = queue[1:]

		if node != nil {
			res = append(res, strconv.Itoa(node.Val))
			queue = append(queue, node.Left)
			queue = append(queue, node.Right)
		} else {
			res = append(res, "null")
		}
	}

	// Trim trailing nulls
	for len(res) > 0 && res[len(res)-1] == "null" {
		res = res[:len(res)-1]
	}

	return "[" + strings.Join(res, ",") + "]"
}

func (c *Comparator) Serialize(val interface{}) string {
	if val == nil {
		return "null"
	}
	switch v := val.(type) {
	case *ListNode:
		return c.SerializeListNode(v)
	case *TreeNode:
		return c.SerializeTreeNode(v)
	case string:
		return "\"" + v + "\""
	case bool:
		if v {
			return "true"
		}
		return "false"
	case []int:
		var strs []string
		for _, x := range v {
			strs = append(strs, strconv.Itoa(x))
		}
		return "[" + strings.Join(strs, ",") + "]"
	case []string:
		var strs []string
		for _, x := range v {
			strs = append(strs, "\""+x+"\"")
		}
		return "[" + strings.Join(strs, ",") + "]"
	case [][]int:
		var rows []string
		for _, row := range v {
			var strs []string
			for _, x := range row {
				strs = append(strs, strconv.Itoa(x))
			}
			rows = append(rows, "["+strings.Join(strs, ",")+"]")
		}
		return "[" + strings.Join(rows, ",") + "]"
	case []interface{}:
	    var strs []string
	    for _, x := range v {
	        strs = append(strs, c.Serialize(x))
	    }
	    return "[" + strings.Join(strs, ",") + "]"
	default:
		return fmt.Sprintf("%v", v)
	}
}
