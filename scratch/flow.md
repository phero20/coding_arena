Okay, I will break it down into exactly what is "Static" vs "Dynamic" based on every single folder in your web/src/app directory.

🟢 1. The STATIC Pages (Included)
These pages don't change based on data. In the sitemap, we just type their URLs manually (1 line of code per page).

/ (Homepage)
/academy (Academy Hub)
/compilers (Compilers Hub)
/contests (Contests Hub)
/leaderboard (Leaderboard Hub)
/problems (Practice Hub)
/roadmap (Roadmap Hub)
/systemdesign (System Design Hub)
🔵 2. The DYNAMIC Pages (Included)
These are the templates. We have to write a script that fetches data (from the DB or JSON files) to generate thousands of URLs automatically for these.

Practice Problems: /problems/[problemId] (Loops 3,900+ times)
Academy Exercises: /academy/tracks/[slug]/exercises/[exerciseSlug] (Loops 7,000+ times)
Academy Tracks: /academy/tracks/[slug]
System Design Lessons: /systemdesign/learn/[slug]
User Profiles: /u/[username] (Loops for every user in the DB)
Company Tags: /companies/[slug]
🔴 3. The Pages We EXCLUDE completely
We do NOT put these in the sitemap because Google shouldn't index private or temporary pages.

Authentication: /auth/login, /auth/register, /auth/forgot-password (No SEO value)
Private Settings: /settings
Live Multiplayer: /arena, /arena/[roomId], /arena/match/[roomId]
Private Workspaces: /systemdesign/workspace/[workspaceId]
Does this give you a clearer picture of exactly what the sitemap.xml will look like? The script we are going to write for Step B will handle automating all the 🔵 Dynamic pages!