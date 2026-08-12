import jwt from "jsonwebtoken";

export const signToken = (payload, expiresIn = "7d") =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

export const randomToken = () =>
  [...Array(40)]
    .map(() => Math.floor(Math.random() * 36).toString(36))
    .join("");
