// Decap CMS (formerly Netlify CMS) GitHub OAuth — step 1 of 2: begin.
//
// Decap's login is a two-message handshake (see Decap's own
// NetlifyAuthenticator): this page must FIRST post
// "authorizing:github" to the /admin window that opened it, and only
// then send the browser to GitHub. The /admin window only starts
// listening for the finished login ("authorization:github:success:…")
// after it hears that first message, so a plain redirect straight to
// GitHub would silently never log the user in.
// The client id is read ONLY from the Vercel environment variable
// OAUTH_GITHUB_CLIENT_ID. No secret is used (or stored) here.

const SITE_URL = "https://zeeshanshabbir.vercel.app";

module.exports = async (req, res) => {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send("OAuth is not configured: OAUTH_GITHUB_CLIENT_ID is missing.");
    return;
  }
  const provider = (req.query && req.query.provider) || "github";
  const scope = (req.query && req.query.scope) || "repo";
  const redirectUri = `${SITE_URL}/api/callback`;
  const authorizeUrl =
    "https://github.com/login/oauth/authorize" +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Connecting to GitHub…</title></head>
<body>
<p>Connecting to GitHub…</p>
<script>
(function () {
  var authorizeUrl = ${JSON.stringify(authorizeUrl)};
  var provider = ${JSON.stringify(provider)};
  if (window.opener) {
    window.opener.postMessage("authorizing:" + provider, ${JSON.stringify(SITE_URL)});
  }
  // Give the admin window a moment to register its login listener
  // before leaving for GitHub.
  setTimeout(function () {
    window.location.href = authorizeUrl;
  }, 300);
})();
</script>
</body>
</html>`);
};
