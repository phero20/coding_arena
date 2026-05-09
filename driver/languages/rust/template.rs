#![allow(warnings)]

// {{PART_MODULES}}

use parts::scanner::Scanner;
use parts::comparator::Comparator;
use parts::data_structures::{ListNode, TreeNode};

pub struct Solution;

{{USER_CODE}}

fn main() {
    let mut scanner = Scanner::new();
    
    let num_test_cases = match scanner.next_raw() {
        Some(s) => s.parse::<usize>().unwrap_or(0),
        None => 0,
    };

    for _ in 0..num_test_cases {
        let mut _phase = "parse_inputs";
        {{MAIN_LOOP}}
    }
}
