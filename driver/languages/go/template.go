package main

import (
	"bufio"
	"encoding/base64"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
// {{USER_IMPORTS}}
)

// {{PART_DATA_STRUCTURES}}

// {{PART_SCANNER}}

// {{PART_COMPARATOR}}

{{USER_CODE}}

func main() {
	scanner := NewScanner()
	comp := &Comparator{}
	_ = comp

	numTestCasesStr := scanner.NextRaw()
	numTestCases, err := strconv.Atoi(numTestCasesStr)
	if err != nil {
		return
	}

	for i := 0; i < numTestCases; i++ {
		_phase := "parse_inputs"
		func() {
			defer func() {
				if r := recover(); r != nil {
					fmt.Printf("@@ERROR@@:case=%d phase=%s msg=%v\n", i, _phase, r)
					os.Exit(1)
				}
			}()

			{{MAIN_LOOP}}
			_phase = "verify_sync"
			sentinel := scanner.NextRaw()
			if sentinel != "@@CASE_END@@" {
				panic(fmt.Sprintf("Input desync detected! Expected @@CASE_END@@ but got: %s", sentinel))
			}
		}()
	}
}
