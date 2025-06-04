export const login = (req, res) => {
  // Handle regular login if needed
  res.status(200).json({ message: "Login successful" });
};

export const logout = (req, res) => {
  req.logout();
  res.status(200).json({ message: "Logout successful" });
};

export const googleCallback = (req, res) => {
  res.redirect("http://localhost:3001/dashboard");
};
