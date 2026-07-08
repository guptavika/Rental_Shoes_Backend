import jwt from "jsonwebtoken";

export const auth = (roles = []) => {
  return (req, res, next) => {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    try {
      const token = header.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }
  };
};
