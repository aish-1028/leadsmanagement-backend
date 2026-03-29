import express from "express"
import { signup, login, createUser, getUsers, getUser, updateUser, deleteUser } from "../controllers/userController"
import { protect, authorize } from "../middleware/auth"

const router = express.Router()

// POST /api/users/signup
router.post("/signup", signup)

// POST /api/users/login
router.post("/login", login)

// POST /api/users
router.post("/", protect, authorize("admin"), createUser)

// GET /api/users
router.get("/", protect, authorize("admin", "counseller","user"), getUsers)

// GET /api/users/:id
router.get("/:id", protect, authorize("admin", "counseller"), getUser)

// PUT /api/users/:id
router.put("/:id", protect, authorize("admin", "counseller"), updateUser)

// DELETE /api/users/:id
router.delete("/:id", protect, authorize("admin"), deleteUser)

export default router
