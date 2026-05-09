use std::io::{self, Read};
use std::str::FromStr;
use super::data_structures::{ListNode, TreeNode};

pub struct Scanner {
    tokens: Vec<String>,
    index: usize,
}

impl Scanner {
    pub fn new() -> Self {
        let mut input = String::new();
        io::stdin().read_to_string(&mut input).expect("Failed to read stdin");
        let tokens = input
            .split_whitespace()
            .map(|s| s.to_string())
            .collect();
        Scanner { tokens, index: 0 }
    }

    pub fn next_raw(&mut self) -> Option<String> {
        if self.index < self.tokens.len() {
            let res = Some(self.tokens[self.index].clone());
            self.index += 1;
            res
        } else {
            None
        }
    }

    pub fn next<T: FromStr>(&mut self) -> T {
        let s = self.next_raw().expect("Unexpected end of input");
        if s == "null" {
             // For primitives, null usually means default or we should handle it better
             // But for Rust, we'll try to parse it and let it fail or handle if T is Option
        }
        s.parse::<T>().ok().expect("Failed to parse token")
    }

    pub fn next_string(&mut self) -> String {
        let s = self.next_raw().expect("Unexpected end of input");
        if s == "null" || s == "-" {
            return String::new();
        }
        // Decode Base64
        match self.decode_base64(&s) {
            Ok(decoded) => String::from_utf8(decoded).unwrap_or(s),
            Err(_) => s,
        }
    }

    pub fn next_int(&mut self) -> i32 { self.next::<i32>() }
    pub fn next_long(&mut self) -> i64 { self.next::<i64>() }
    pub fn next_float(&mut self) -> f64 { self.next::<f64>() }
    pub fn next_bool(&mut self) -> bool {
        let s = self.next_raw().expect("Unexpected end of input").to_lowercase();
        s == "true" || s == "1"
    }

    pub fn next_vec<T: FromStr>(&mut self) -> Vec<T> {
        let s = self.next_raw().expect("Unexpected end of input");
        self.parse_vec::<T>(&s)
    }

    pub fn next_string_vec(&mut self) -> Vec<String> {
        let s = self.next_raw().expect("Unexpected end of input");
        self.parse_string_vec(&s)
    }

    pub fn next_matrix<T: FromStr>(&mut self) -> Vec<Vec<T>> {
        let s = self.next_raw().expect("Unexpected end of input");
        let raw_rows = self.parse_json_array(&s);
        raw_rows.into_iter().map(|row| self.parse_vec::<T>(&row)).collect()
    }

    pub fn next_list_node(&mut self) -> Option<Box<ListNode>> {
        let s = self.next_raw().expect("Unexpected end of input");
        let vals = self.parse_vec::<i32>(&s);
        ListNode::build(vals)
    }

    pub fn next_tree_node(&mut self) -> Option<std::rc::Rc<std::cell::RefCell<TreeNode>>> {
        let s = self.next_raw().expect("Unexpected end of input");
        let vals = self.parse_optional_vec::<i32>(&s);
        TreeNode::build(vals)
    }

    // Helper to parse JSON-like array string "[1,2,3]"
    fn parse_json_array(&self, s: &str) -> Vec<String> {
        let s = s.trim();
        if s == "null" || s == "[]" || !s.starts_with('[') {
            return vec![];
        }
        let s = &s[1..s.len() - 1]; // strip []
        if s.trim().is_empty() { return vec![]; }

        let mut res = vec![];
        let mut curr = String::new();
        let mut depth = 0;
        let mut in_quotes = false;

        for c in s.chars() {
            match c {
                '\"' => in_quotes = !in_quotes,
                '[' if !in_quotes => depth += 1,
                ']' if !in_quotes => depth -= 1,
                ',' if depth == 0 && !in_quotes => {
                    res.push(curr.trim().to_string());
                    curr.clear();
                    continue;
                }
                _ => {}
            }
            curr.push(c);
        }
        res.push(curr.trim().to_string());
        res
    }

    fn parse_vec<T: FromStr>(&self, s: &str) -> Vec<T> {
        self.parse_json_array(s)
            .into_iter()
            .filter_map(|x| x.parse::<T>().ok())
            .collect()
    }

    fn parse_optional_vec<T: FromStr>(&self, s: &str) -> Vec<Option<T>> {
        self.parse_json_array(s)
            .into_iter()
            .map(|x| {
                if x == "null" { None }
                else { x.parse::<T>().ok() }
            })
            .collect()
    }

    fn parse_string_vec(&self, s: &str) -> Vec<String> {
        self.parse_json_array(s)
            .into_iter()
            .map(|x| {
                let x = x.trim();
                if x.starts_with('\"') && x.ends_with('\"') {
                    x[1..x.len() - 1].to_string()
                } else {
                    x.to_string()
                }
            })
            .collect()
    }

    fn decode_base64(&self, s: &str) -> Result<Vec<u8>, ()> {
        let b64_table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let mut buffer = 0u32;
        let mut bits = 0;
        let mut res = Vec::new();

        for c in s.chars() {
            if c == '=' { break; }
            let val = b64_table.find(c).ok_or(())? as u32;
            buffer = (buffer << 6) | val;
            bits += 6;
            if bits >= 8 {
                bits -= 8;
                res.push(((buffer >> bits) & 0xFF) as u8);
            }
        }
        Ok(res)
    }
}
