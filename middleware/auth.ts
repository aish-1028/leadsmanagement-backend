import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import User from "../models/User"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret"

export interface AuthRequest extends Request {
  user?: any
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, error: "Not authorized, token missing" })
      return
    }

    const token = authHeader.split(" ")[1]

    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string }
    if (!decoded || !decoded.id) {
      res.status(401).json({ success: false, error: "Not authorized, invalid token" })
      return
    }

    const user = await User.findById(decoded.id).select("-password")
    if (!user) {
      res.status(401).json({ success: false, error: "Not authorized, user not found" })
      return
    }

    req.user = user
    next()
  } catch (err) {
    console.error("Auth error:", err)
    res.status(401).json({ success: false, error: "Not authorized" })
  }
}

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authorized" })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: "Forbidden: insufficient permissions" })
      return
    }

    next()
  }
}
