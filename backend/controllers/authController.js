
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

function safeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
}

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("\n----- REGISTRATION DEBUG -----");
    console.log("Name received:", name);
    console.log("Email received:", email);

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    console.log("Normalized email:", normalizedEmail);

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    console.log(
      "Existing user:",
      existingUser
        ? {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
          }
        : "NONE"
    );

    if (existingUser) {
      return res.status(409).json({
        message:
          "An account with this email already exists. Please log in.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    console.log("Registration successful:", user.email);

    return res.status(201).json({
      token: generateToken(user._id),
      user: safeUser(user),
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "This email is already registered. Please log in.",
      });
    }

    return res.status(500).json({
      message: "Could not create account. Check the backend terminal.",
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    console.log("Login attempt:", normalizedEmail);

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Incorrect email or password.",
      });
    }

    return res.json({
      token: generateToken(user._id),
      user: safeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Could not log in. Check the backend terminal.",
    });
  }
};

// GET CURRENT USER
exports.me = async (req, res) => {
  return res.json({
    user: safeUser(req.user),
  });
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const bio = req.body.bio?.trim();

    if (name) {
      req.user.name = name;
    }

    if (bio !== undefined) {
      req.user.bio = bio;
    }

    await req.user.save();

    return res.json({
      user: safeUser(req.user),
    });
  } catch (error) {
    console.error("Profile update error:", error);

    return res.status(400).json({
      message: "Could not update profile.",
    });
  }
};
