using System;
using System.Collections.Generic;
using System.Text;

public class Scanner {
    private string[] _tokens;
    private int _index = 0;

    public Scanner() {
        string input = Console.In.ReadToEnd();
        _tokens = input.Split(new[] { ' ', '\n', '\r', '\t' }, StringSplitOptions.RemoveEmptyEntries);
    }

    public string NextRawToken() {
        if (_index >= _tokens.Length) return null;
        return _tokens[_index++];
    }

    public string NextString() {
        string token = NextRawToken();
        if (token == null || token == "null") return null;
        
        try {
            // Only attempt Base64 decoding if the token looks like it was encoded by BaseTypeMapper.
            // In the Flat-Line protocol, strings are always base64 encoded.
            // We check for length % 4 and use a try/catch.
            if (token.Length >= 4 && (token.Length % 4 == 0)) {
                byte[] data = Convert.FromBase64String(token);
                return Encoding.UTF8.GetString(data);
            }
        } catch {
            // Fallback for cases where it's not actually base64
        }
        return token;
    }

    public int NextInt() {
        string s = NextRawToken();
        if (s == null || s == "null") return 0;
        return int.Parse(s);
    }

    public long NextLong() {
        string s = NextRawToken();
        if (s == null || s == "null") return 0;
        return long.Parse(s);
    }

    public double NextDouble() {
        string s = NextRawToken();
        if (s == null || s == "null") return 0;
        return double.Parse(s);
    }

    public bool NextBool() {
        string s = NextRawToken();
        if (s == null || s == "null") return false;
        s = s.ToLower();
        return s == "true" || s == "1";
    }

    public string NextObject() => NextString();

    // Manual primitive JSON-like parser for simple flat arrays [1,2,3]
    private List<string> ParseSimpleArray(string s) {
        if (string.IsNullOrEmpty(s) || s == "null") return null;
        s = s.Trim();
        if (s.StartsWith("[") && s.EndsWith("]")) {
            s = s.Substring(1, s.Length - 2);
        }
        if (string.IsNullOrWhiteSpace(s)) return new List<string>();
        
        List<string> result = new List<string>();
        StringBuilder current = new StringBuilder();
        int depth = 0;
        bool inQuotes = false;
        
        for (int i = 0; i < s.Length; i++) {
            char c = s[i];
            if (c == '\"') inQuotes = !inQuotes;
            else if (!inQuotes) {
                if (c == '[') depth++;
                else if (c == ']') depth--;
            }
            
            if (c == ',' && depth == 0 && !inQuotes) {
                result.Add(current.ToString().Trim());
                current.Clear();
            } else {
                current.Append(c);
            }
        }
        result.Add(current.ToString().Trim());
        return result;
    }

    private string Unquote(string s) {
        s = s.Trim();
        if (s.StartsWith("\"") && s.EndsWith("\"")) return s.Substring(1, s.Length - 2);
        return s;
    }

    public List<int> NextIntList() {
        var raw = ParseSimpleArray(NextRawToken());
        if (raw == null) return null;
        var res = new List<int>();
        foreach (var x in raw) if (!string.IsNullOrEmpty(x)) res.Add(int.Parse(x));
        return res;
    }

    public List<long> NextLongList() {
        var raw = ParseSimpleArray(NextRawToken());
        if (raw == null) return null;
        var res = new List<long>();
        foreach (var x in raw) if (!string.IsNullOrEmpty(x)) res.Add(long.Parse(x));
        return res;
    }

    public List<string> NextStringList() {
        var raw = ParseSimpleArray(NextRawToken());
        if (raw == null) return null;
        var res = new List<string>();
        foreach (var x in raw) res.Add(Unquote(x));
        return res;
    }

    public List<double> NextDoubleList() {
        var raw = ParseSimpleArray(NextRawToken());
        if (raw == null) return null;
        var res = new List<double>();
        foreach (var x in raw) if (!string.IsNullOrEmpty(x)) res.Add(double.Parse(x));
        return res;
    }

    public List<bool> NextBoolList() {
        var raw = ParseSimpleArray(NextRawToken());
        if (raw == null) return null;
        var res = new List<bool>();
        foreach (var x in raw) if (!string.IsNullOrEmpty(x)) res.Add(x.ToLower() == "true" || x == "1");
        return res;
    }

    public List<List<int>> NextIntMatrix() {
        var raw = ParseSimpleArray(NextRawToken());
        if (raw == null) return null;
        var res = new List<List<int>>();
        foreach (var x in raw) {
            var sub = ParseSimpleArray(x);
            var subList = new List<int>();
            foreach (var s in sub) if (!string.IsNullOrEmpty(s)) subList.Add(int.Parse(s));
            res.Add(subList);
        }
        return res;
    }

    public List<List<long>> NextLongMatrix() {
        var raw = ParseSimpleArray(NextRawToken());
        if (raw == null) return null;
        var res = new List<List<long>>();
        foreach (var x in raw) {
            var sub = ParseSimpleArray(x);
            var subList = new List<long>();
            foreach (var s in sub) if (!string.IsNullOrEmpty(s)) subList.Add(long.Parse(s));
            res.Add(subList);
        }
        return res;
    }

    public List<List<string>> NextStringMatrix() {
        var raw = ParseSimpleArray(NextRawToken());
        if (raw == null) return null;
        var res = new List<List<string>>();
        foreach (var x in raw) {
            var sub = ParseSimpleArray(x);
            var subList = new List<string>();
            foreach (var s in sub) subList.Add(Unquote(s));
            res.Add(subList);
        }
        return res;
    }

    public ListNode NextListNode() {
        var raw = ParseSimpleArray(NextRawToken());
        if (raw == null) return null;
        var vals = new List<int>();
        foreach (var x in raw) if (!string.IsNullOrEmpty(x)) vals.Add(int.Parse(x));
        return ListNode.Build(vals);
    }

    public TreeNode NextTreeNode() {
        var raw = ParseSimpleArray(NextRawToken());
        if (raw == null) return null;
        var vals = new List<int?>();
        foreach (var x in raw) {
            if (string.IsNullOrEmpty(x) || x == "null") vals.Add(null);
            else vals.Add(int.Parse(x));
        }
        return TreeNode.Build(vals);
    }
}
