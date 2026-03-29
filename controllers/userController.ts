import type { Request, Response } from "express"
import User from "../models/User"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

const signToken = (userId: string) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: "Name, email and password are required" })
      return
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      res.status(400).json({ success: false, error: "A user with this email already exists" })
      return
    }

    const user = new User({ name: name.trim(), email: email.toLowerCase().trim(), password, role })
    const saved = await user.save()

  const token = signToken((saved._id as any).toString())

    res.status(201).json({ success: true, data: { user: saved, token }, message: "User created" })
  } catch (error: any) {
    console.error("Signup error:", error)
    if (error.name === "ValidationError" || error.code === 11000) {
      res.status(400).json({ success: false, error: error.message || "Invalid input" })
    } else {
      res.status(500).json({ success: false, error: "Internal server error" })
    }
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ success: false, error: "Email and password are required" })
      return
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      res.status(401).json({ success: false, error: "Invalid credentials" })
      return
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      res.status(401).json({ success: false, error: "Invalid credentials" })
      return
    }

  const token = signToken((user._id as any).toString())

    res.status(200).json({ success: true, data: { user, token } })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: "Name, email and password are required" })
      return
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      res.status(400).json({ success: false, error: "A user with this email already exists" })
      return
    }

    const user = new User({ name: name.trim(), email: email.toLowerCase().trim(), password, role })
    const saved = await user.save()

    res.status(201).json({ success: true, data: saved, message: "User created" })
  } catch (error: any) {
    console.error("Create user error:", error)
    if (error.name === "ValidationError" || error.code === 11000) {
      res.status(400).json({ success: false, error: error.message || "Invalid input" })
    } else {
      res.status(500).json({ success: false, error: "Internal server error" })
    }
  }
}

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password')
    res.status(200).json({ success: true, data: users })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" })
      return
    }
    res.status(200).json({ success: true, data: user })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, role } = req.body
    const user = await User.findByIdAndUpdate(req.params.id, { name, email, role }, { new: true }).select('-password')
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" })
      return
    }
    res.status(200).json({ success: true, data: user })
  } catch (error: any) {
    console.error("Update user error:", error)
    if (error.name === "ValidationError" || error.code === 11000) {
      res.status(400).json({ success: false, error: error.message || "Invalid input" })
    } else {
      res.status(500).json({ success: false, error: "Internal server error" })
    }
  }
}

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" })
      return
    }
    res.status(200).json({ success: true, message: "User deleted" })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({ success: false, error: "Internal server error" })
  }
}
