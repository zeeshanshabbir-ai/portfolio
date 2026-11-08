// Decap CMS (formerly Netlify CMS) GitHub OAuth — step 1 of 2: begin.
// This Vercel serverless function redirects the browser to GitHub so
// the user can authorize the "Portfolio Admin" OAuth App. GitHub then
// redirects back to /api/callback, which finishes the login.
// The client id is read ONLY from the Vercel environment variable
// OAUTH_GITHUB_CLIENT_ID. No secret is used (or stored) here.

const SITE_URL = "https://zeeshanshabbir.vercel.app";

module.exports = async (req, res) => {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  if (!clientId) {
    res
      .status(500)
      .send("OAuth is not configured: OAUTH_GITHUB_CLIENT_ID is missing.");
    return;
  }
  const redirectUri = `${SITE_URL}/api/callback`;
  const authorizeUrl =
    "https://github.com/login/oauth/authorize" +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    "&scope=repo";
  res.redirect(authorizeUrl);
};
