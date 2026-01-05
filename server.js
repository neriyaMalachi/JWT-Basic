import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
app.use(express.json());

const PORT = 8000;
const SECRET = "my_super_secret_key";

const users = [
  { username: "dana", password: "1234" },
  { username: "admin", password: "admin" },
];

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // יצירת JWT
  const token = jwt.sign({ username: user.username }, SECRET, {
    expiresIn: "1h",
  });
    res.cookie("token", token, {
    httpOnly: true,
    secure: false,    // true בפרודקשן
    sameSite: "strict",
    maxAge: 60 * 60 * 1000
  });

  res.json({ token });
});

function authMiddleware(req, res, next) {
    console.log(req.cookies.token);
    
  const authHeader = req.cookies.token;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    const decoded = jwt.verify(authHeader, SECRET);
    console.log(decoded);
    
    req.user = decoded; // שומרים מידע על המשתמש
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
