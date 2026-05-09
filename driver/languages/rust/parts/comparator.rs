use super::data_structures::{ListNode, TreeNode};
use std::rc::Rc;
use std::cell::RefCell;

pub struct Comparator;

impl Comparator {
    pub fn serialize_list_node(head: Option<Box<ListNode>>) -> String {
        let mut vals = Vec::new();
        let mut curr = head;
        while let Some(node) = curr {
            vals.push(node.val);
            curr = node.next;
        }
        format!("{:?}", vals).replace(" ", "")
    }

    pub fn serialize_tree_node(root: Option<Rc<RefCell<TreeNode>>>) -> String {
        if root.is_none() {
            return "[]".to_string();
        }
        let mut res = Vec::new();
        let mut queue = std::collections::VecDeque::new();
        queue.push_back(root);

        while !queue.is_empty() {
            let node_opt = queue.pop_front().unwrap();
            match node_opt {
                Some(node) => {
                    let n = node.borrow();
                    res.push(n.val.to_string());
                    queue.push_back(n.left.clone());
                    queue.push_back(n.right.clone());
                }
                None => {
                    res.push("null".to_string());
                }
            }
        }

        // Trim trailing nulls
        while res.last().map(|s| s.as_str()) == Some("null") {
            res.pop();
        }

        format!("[{}]", res.join(",")).replace(" ", "")
    }

    pub fn serialize<T: std::fmt::Display>(val: T) -> String {
        val.to_string()
    }

    pub fn serialize_vec<T: std::fmt::Display>(vec: Vec<T>) -> String {
        let items: Vec<String> = vec.into_iter().map(|v| v.to_string()).collect();
        format!("[{}]", items.join(",")).replace(" ", "")
    }

    pub fn serialize_string(s: String) -> String {
        format!("\"{}\"", s)
    }

    pub fn serialize_bool(b: bool) -> String {
        b.to_string().to_lowercase()
    }
}
