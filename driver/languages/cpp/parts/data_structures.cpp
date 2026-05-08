struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

string serialize(int val) { return to_string(val); }
string serialize(long long val) { return to_string(val); }
string serialize(double val) { 
    stringstream ss;
    ss << fixed << setprecision(6) << val;
    string s = ss.str();
    s.erase(s.find_last_not_of('0') + 1, string::npos);
    if (s.back() == '.') s.pop_back();
    return s;
}
string serialize(bool val) { return val ? "true" : "false"; }
string serialize(string val) { return val; }

template<typename T>
string serialize(vector<T> vec) {
    string res = "[";
    for (size_t i = 0; i < vec.size(); ++i) {
        res += serialize(vec[i]);
        if (i < vec.size() - 1) res += ",";
    }
    res += "]";
    return res;
}

string serialize(ListNode* head) {
    if (!head) return "[]";
    string res = "[";
    ListNode* curr = head;
    while (curr) {
        res += to_string(curr->val);
        if (curr->next) res += ",";
        curr = curr->next;
    }
    res += "]";
    return res;
}

string serialize(TreeNode* root) {
    if (!root) return "null";
    string res = "[";
    vector<string> nodes;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* curr = q.front();
        q.pop();
        if (curr) {
            nodes.push_back(to_string(curr->val));
            q.push(curr->left);
            q.push(curr->right);
        } else {
            nodes.push_back("null");
        }
    }
    while (!nodes.empty() && nodes.back() == "null") nodes.pop_back();
    for (size_t i = 0; i < nodes.size(); ++i) {
        res += nodes[i];
        if (i < nodes.size() - 1) res += ",";
    }
    res += "]";
    return res;
}

ListNode* build_list(int n, Scanner& sc) {
    if (n == 0) return nullptr;
    ListNode* head = new ListNode(sc.next_int());
    ListNode* curr = head;
    for (int i = 0; i < n - 1; ++i) {
        curr->next = new ListNode(sc.next_int());
        curr = curr->next;
    }
    return head;
}

TreeNode* build_tree(int n, Scanner& sc) {
    if (n == 0) return nullptr;
    vector<string> tokens;
    for (int i = 0; i < n; ++i) tokens.push_back(sc.next());
    if (tokens.empty() || tokens[0] == "null") return nullptr;

    TreeNode* root = new TreeNode(stoi(tokens[0]));
    queue<TreeNode*> q;
    q.push(root);
    int i = 1;
    while (!q.empty() && i < n) {
        TreeNode* curr = q.front();
        q.pop();

        if (i < n && tokens[i] != "null") {
            curr->left = new TreeNode(stoi(tokens[i]));
            q.push(curr->left);
        }
        i++;

        if (i < n && tokens[i] != "null") {
            curr->right = new TreeNode(stoi(tokens[i]));
            q.push(curr->right);
        }
        i++;
    }
    return root;
}
