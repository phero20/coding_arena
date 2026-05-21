Global & Arena Leaderboards:

User Stats & Metrics:

The Opportunity: When you view a profile, the system calculates "Easy/Medium/Hard" counts and "Activity Timelines." This requires heavy database joins.
The Fix: Cache the user's "Stats Card" and only invalidate it when they get a new ACCEPTED submission.
User Search Results:

The Opportunity: Since we just implemented Global User Search, popular queries (like searching for "admin" or high-ranking players) will happen often.
The Fix: Cache the results of the most frequent search queries for a few minutes.
Social Registry (Followers/Following):

The Opportunity: Checking if a user "follows" another happens on almost every profile view.
The Fix: Store the "Following Set" in Redis for active users to provide instant "Follow" status checks.
Submission Feed:

The Opportunity: The "Recent Activity" feed on the home page is currently a live query.
The Fix: Maintain a "Latest 50 Submissions" list directly in a Redis LIST structure for zero-latency dashboard loads.