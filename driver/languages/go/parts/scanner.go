package main

import (
	"bufio"
	"encoding/base64"
	"fmt"
	"os"
	"strconv"
	"strings"
)

type Scanner struct {
	sc *bufio.Scanner
}

func NewScanner() *Scanner {
	sc := bufio.NewScanner(os.Stdin)
	sc.Split(bufio.ScanWords)
    // Increase max token size for large JSON arrays
    buf := make([]byte, 0, 64*1024)
	sc.Buffer(buf, 1024*1024*10)
	return &Scanner{sc: sc}
}

func (s *Scanner) NextRaw() string {
	if s.sc.Scan() {
		return s.sc.Text()
	}
	if err := s.sc.Err(); err != nil {
		panic(fmt.Sprintf("Scanner error: %v", err))
	}
	panic("Unexpected end of input")
}

func (s *Scanner) NextString() string {
	raw := s.NextRaw()
	if raw == "null" || raw == "-" {
		return ""
	}
	decoded, err := base64.StdEncoding.DecodeString(raw)
	if err != nil {
		return raw
	}
	return string(decoded)
}

func (s *Scanner) NextInt() int {
	raw := s.NextRaw()
	if raw == "null" {
		return 0
	}
	val, err := strconv.Atoi(raw)
	if err != nil {
		panic(fmt.Sprintf("Failed to parse int '%s': %v", raw, err))
	}
	return val
}

func (s *Scanner) NextInt64() int64 {
	raw := s.NextRaw()
	if raw == "null" {
		return 0
	}
	val, err := strconv.ParseInt(raw, 10, 64)
	if err != nil {
		panic(fmt.Sprintf("Failed to parse int64 '%s': %v", raw, err))
	}
	return val
}

func (s *Scanner) NextFloat64() float64 {
	raw := s.NextRaw()
	if raw == "null" {
		return 0
	}
	val, err := strconv.ParseFloat(raw, 64)
	if err != nil {
		panic(fmt.Sprintf("Failed to parse float64 '%s': %v", raw, err))
	}
	return val
}

func (s *Scanner) NextBool() bool {
	raw := strings.ToLower(s.NextRaw())
	return raw == "true" || raw == "1"
}

// JSON parsing for generic arrays
func (s *Scanner) parseJSONArray(raw string) []string {
	raw = strings.TrimSpace(raw)
	if raw == "null" || raw == "[]" || !strings.HasPrefix(raw, "[") {
		return []string{}
	}
	raw = raw[1 : len(raw)-1]
	if len(strings.TrimSpace(raw)) == 0 {
		return []string{}
	}

	var res []string
	var curr strings.Builder
	depth := 0
	inQuotes := false

	for _, c := range raw {
		if c == '"' {
			inQuotes = !inQuotes
		} else if c == '[' && !inQuotes {
			depth++
		} else if c == ']' && !inQuotes {
			depth--
		} else if c == ',' && depth == 0 && !inQuotes {
			res = append(res, strings.TrimSpace(curr.String()))
			curr.Reset()
			continue
		}
		curr.WriteRune(c)
	}
	res = append(res, strings.TrimSpace(curr.String()))
	return res
}

func (s *Scanner) NextIntArray() []int {
	raw := s.NextRaw()
	parts := s.parseJSONArray(raw)
	var res []int
	for _, p := range parts {
		if val, err := strconv.Atoi(p); err == nil {
			res = append(res, val)
		}
	}
	if res == nil {
	    return []int{}
	}
	return res
}

func (s *Scanner) NextStringArray() []string {
	raw := s.NextRaw()
	parts := s.parseJSONArray(raw)
	var res []string
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if strings.HasPrefix(p, "\"") && strings.HasSuffix(p, "\"") {
			p = p[1 : len(p)-1]
		}
		res = append(res, p)
	}
	if res == nil {
	    return []string{}
	}
	return res
}

func (s *Scanner) NextIntMatrix() [][]int {
	raw := s.NextRaw()
	rows := s.parseJSONArray(raw)
	var res [][]int
	for _, row := range rows {
		parts := s.parseJSONArray(row)
		var intRow []int
		for _, p := range parts {
			if val, err := strconv.Atoi(p); err == nil {
				intRow = append(intRow, val)
			}
		}
		if intRow == nil {
		    intRow = []int{}
		}
		res = append(res, intRow)
	}
	if res == nil {
	    return [][]int{}
	}
	return res
}

func (s *Scanner) NextListNode() *ListNode {
	return buildListNode(s.NextIntArray())
}

func (s *Scanner) NextTreeNode() *TreeNode {
	raw := s.NextRaw()
	parts := s.parseJSONArray(raw)
	var vals []*int
	for _, p := range parts {
		if p == "null" {
			vals = append(vals, nil)
		} else {
			if val, err := strconv.Atoi(p); err == nil {
				vals = append(vals, &val)
			} else {
				vals = append(vals, nil)
			}
		}
	}
	return buildTreeNode(vals)
}
