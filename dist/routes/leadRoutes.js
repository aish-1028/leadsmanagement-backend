"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leadController_1 = require("../controllers/leadController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All lead routes require authentication
router.use(auth_1.protect);
// GET /api/leads - Get all leads with pagination, search, filter, sort
router.get("/", leadController_1.getLeads);
// GET /api/leads/stats - Get lead statistics
router.get("/stats", leadController_1.getLeadStats);
// GET /api/leads/:id - Get single lead by ID
router.get("/:id", leadController_1.getLeadById);
// POST /api/leads - Create new lead
router.post("/", leadController_1.createLead);
// PUT /api/leads/:id - Update lead
router.put("/:id", leadController_1.updateLead);
// POST /api/leads/bulk - Bulk insert leads from Excel
router.post("/bulk", leadController_1.bulkInsertLeads);
// DELETE /api/leads/:id - Delete lead (admin only)
router.delete("/:id", leadController_1.deleteLead); //authorize("admin")
exports.default = router;
//# sourceMappingURL=leadRoutes.js.map