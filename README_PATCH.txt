NafsFlow Patch 2025-09-15

Files:
- /firebase.js                 -> replace existing root firebase.js with this unified selector (nafs-gen vs NafsAppStudio)
- /assets/hotfix-nafsflow-20250915.js -> include at end of body on /nfs/premium and /guru/rpm pages
- /guru/rpm/llmClient.js       -> replace to use /api/generate.php (no hardcoded host)
Server:
- Ensure public_html/api/generate.php exists. If your repo has web_static/api/generate.php, copy to public_html/api/ and keep env.php(.env) private.
- Add authorized domain in Firebase for both projects: nafsflow.com
