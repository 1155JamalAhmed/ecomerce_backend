// ** create token and save it in cookies
const sendToken = (
  savedDoc,
  statusCode,
  res,
  rememberMe,
  cookieName = "token"
) => {
  const expiresIn = rememberMe ? "90d" : "1d";
  const token = savedDoc.getJwtToken(expiresIn);

  const options = {
    // 90 days to 24 hours to 60 min then 60 sec then 1000ms
    expires: rememberMe
      ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(statusCode).cookie(cookieName, token, options).json({
    success: true,
    body: savedDoc,
    token,
  });
};

module.exports = sendToken;
