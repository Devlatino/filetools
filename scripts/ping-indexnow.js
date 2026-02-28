/**
 * Ping IndexNow API via our route (requires INDEXNOW_SECRET in .env.local).
 * Run after deploy: npm run indexnow
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fileflip.org";
const SECRET = process.env.INDEXNOW_SECRET;

if (!SECRET) {
  console.error("INDEXNOW_SECRET is not set in .env.local");
  process.exit(1);
}

const url = `${SITE_URL}/api/indexnow`;

fetch(url, {
  method: "GET",
  headers: { "x-indexnow-secret": SECRET },
})
  .then((res) => res.json().then((data) => ({ status: res.status, data })))
  .then(({ status, data }) => {
    if (status === 200 && data.success) {
      console.log(
        `IndexNow: ${data.urlCount} URL(s) submitted, response ${data.response}`
      );
    } else {
      console.error("IndexNow ping failed:", status, data);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("IndexNow ping error:", err.message);
    process.exit(1);
  });
