const jwt = require("jsonwebtoken");

// Project passwords
const PROJECT_PASSWORDS = {
  "case-study": process.env.PASSWORD_CASE1,
  "dev-project": process.env.PASSWORD_CASE2,
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { projectId, password } = req.body;

    // Validate input
    if (!projectId || !password) {
      return res.status(400).json({
        error: "Missing projectId or password",
      });
    }

    // Check if project exists
    const correctPassword = PROJECT_PASSWORDS[projectId];
    if (!correctPassword) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    // Validate password
    if (password !== correctPassword) {
      return res.status(401).json({
        error: "Invalid password",
        authenticated: false,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        projectId,
        timestamp: Date.now(),
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Success
    return res.status(200).json({
      authenticated: true,
      token,
      projectId,
      message: "Authentication successful",
    });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
