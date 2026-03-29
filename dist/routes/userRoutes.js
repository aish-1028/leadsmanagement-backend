"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// POST /api/users/signup
router.post("/signup", userController_1.signup);
// POST /api/users/login
router.post("/login", userController_1.login);
// POST /api/users
router.post("/", auth_1.protect, (0, auth_1.authorize)("admin"), userController_1.createUser);
// GET /api/users
router.get("/", auth_1.protect, (0, auth_1.authorize)("admin", "counseller", "user"), userController_1.getUsers);
// GET /api/users/:id
router.get("/:id", auth_1.protect, (0, auth_1.authorize)("admin", "counseller"), userController_1.getUser);
// PUT /api/users/:id
router.put("/:id", auth_1.protect, (0, auth_1.authorize)("admin", "counseller"), userController_1.updateUser);
// DELETE /api/users/:id
router.delete("/:id", auth_1.protect, (0, auth_1.authorize)("admin"), userController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map