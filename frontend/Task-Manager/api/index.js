let app;
let initError = null;

try {
  app = require("../backend/server.js");
} catch (err) {
  initError = err;
  console.error("Vercel Init Error:", err);
}

module.exports = (req, res) => {
  if (initError) {
    return res.status(500).json({
      error: "Serverless initialization failed",
      message: initError.message,
      stack: initError.stack
    });
  }

  return app(req, res);
};
