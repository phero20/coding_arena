use std::rc::Rc;
use std::cell::RefCell;

// Definition for singly-linked list.
#[derive(PartialEq, Eq, Clone, Debug)]
pub struct ListNode {
  pub val: i32,
  pub next: Option<Box<ListNode>>
}

impl ListNode {
  #[inline]
  pub fn new(val: i32) -> Self {
    ListNode {
      next: None,
      val
    }
  }

  pub fn build(vals: Vec<i32>) -> Option<Box<ListNode>> {
    let mut head = None;
    for &val in vals.iter().rev() {
        let mut node = ListNode::new(val);
        node.next = head;
        head = Some(Box::new(node));
    }
    head
  }
}

// Definition for a binary tree node.
#[derive(Debug, PartialEq, Eq)]
pub struct TreeNode {
  pub val: i32,
  pub left: Option<Rc<RefCell<TreeNode>>>,
  pub right: Option<Rc<RefCell<TreeNode>>>,
}

impl TreeNode {
  #[inline]
  pub fn new(val: i32) -> Self {
    TreeNode {
      val,
      left: None,
      right: None
    }
  }

  pub fn build(vals: Vec<Option<i32>>) -> Option<Rc<RefCell<TreeNode>>> {
    if vals.is_empty() || vals[0].is_none() {
        return None;
    }

    let root = Rc::new(RefCell::new(TreeNode::new(vals[0].unwrap())));
    let mut queue = std::collections::VecDeque::new();
    queue.push_back(Rc::clone(&root));

    let mut i = 1;
    while i < vals.len() {
        let curr = queue.pop_front().unwrap();

        if i < vals.len() {
            if let Some(val) = vals[i] {
                let left = Rc::new(RefCell::new(TreeNode::new(val)));
                curr.borrow_mut().left = Some(Rc::clone(&left));
                queue.push_back(left);
            }
            i += 1;
        }

        if i < vals.len() {
            if let Some(val) = vals[i] {
                let right = Rc::new(RefCell::new(TreeNode::new(val)));
                curr.borrow_mut().right = Some(Rc::clone(&right));
                queue.push_back(right);
            }
            i += 1;
        }
    }

    Some(root)
  }
}
