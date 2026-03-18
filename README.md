git ls-files --modified --others --exclude-standard | ForEach-Object { git add $_; git commit -m "updated $_" }


Issue	Severity	Impact at 50	Solution
Groq Blocking Calls	🔴 CRITICAL	API hangs 😱	Implement BullMQ queue
No Async Workers	🔴 CRITICAL	Queued jobs never process	Create submission.worker.ts
Redis Pool Size	🟠 HIGH	Occasional timeouts	Increase pool to 100
Hub Buffer Size	🟡 MEDIUM	200-500ms lag	Increase buffer
API Scaling	🟡 MEDIUM	Single instance bottleneck	Run 2-3 instances
Groq Rate Limit	🟡 MEDIUM	429 errors possible	Add backoff + throttle