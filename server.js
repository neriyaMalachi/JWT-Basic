import express from "express";
import jwt from "jsonwebtoken";
// cookis
import cookieParser from "cookie-parser";

const PORT = 8000;
const SECRET = "my_super_secret_key";
const users = [
  { username: "dana", password: "1234" },
  { username: "admin", password: "admin" },
];
const app = express();
app.use(express.json());

// cookis
app.use(cookieParser());



app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ username: user.username }, SECRET, {
    expiresIn: "1h",
  });
// cookis
  res.cookie("token", token);

  res.json({ token });
});

function authMiddleware(req, res, next) {
    
// cookis
  const authHeader = req.cookies.token;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    const decoded = jwt.verify(authHeader, SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are inside protected route",
    user: req.user,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
