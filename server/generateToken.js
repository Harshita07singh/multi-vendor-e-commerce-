import jwt from "jsonwebtoken";

const token = jwt.sign(
  { id: "000000000000000000000000", role: "vendor" },
  process.env.JWT_ACCESS_SECRET ||
    "8e7987a3568e0d22df261b2e09fb459b2c8f3ac029b1d6fbfbbca63b4ef63921e0a4d31576c858721323f1121a851f068f2bd8a9746ede3d2e6613a5dea559b1",
  { expiresIn: "1d" },
);

console.log(token);
