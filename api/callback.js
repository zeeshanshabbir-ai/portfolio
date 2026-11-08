// Decap CMS (formerly Netlify CMS) GitHub OAuth — step 2 of 2: callback.
// GitHub redirects here with ?code=... after the user authorizes the
// "Portfolio Admin" OAuth App. This exchanges the code for an access
// token (the client secret never leaves the server) and hands the
// token to Decap CMS in the /admin window, exactly as the standard
// Decap/Netlify CMS OAuth provider flow does: the page posts
// "authorization:github:success:{token}" to its opener.

const SITE_URL = "https://zeeshanshabbir.vercel.app";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPage({ ok, token, error }) {
  const message = ok
    ? "authorization:github:success:" + JSON.stringify({ token })
    : "authorization:github:error:" +
      JSON.stringify({ message: error || "OAuth failed." });
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Signing you in…</title></head>
<body>
<p>${ok ? "Signed in. This window will close." : "Sign-in failed: " + escapeHtml(error || "OAuth failed.")}</p>
<script>
(function () {
  var message = ${JSON.stringify(message)};
  if (window.opener) {
    window.opener.postMessage(message, ${JSON.stringify(SITE_URL)});
  }
})();
</script>
</body>
</html>`;
}

module.exports = async (req, res) => {
  const code = req.query && req.query.code;
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  if (!code) {
    res.status(400).send(renderPage({ ok: false, error: "Missing authorization code." }));
    return;
  }
  if (!clientId || !clientSecret) {
    res.status(500).send(renderPage({ ok: false, error: "OAuth is not configured on the server." }));
    return;
  }

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${SITE_URL}/api/callback`,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.access_token) {
      throw new Error(
        (data && (data.error_description || data.error)) ||
          "GitHub did not return an access token."
      );
    }
    res.status(200).send(renderPage({ ok: true, token: data.access_token }));
  } catch (err) {
    res.status(500).send(renderPage({ ok: false, error: err.message }));
  }
};
