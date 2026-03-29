"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const leadSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters long"],
        maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    phone: {
        type: String,
        required: [true, "Phone is required"],
        unique: true,
        trim: true,
    },
    city: {
        type: String,
        trim: true,
        index: true,
    },
    workExp: {
        type: String,
        enum: ["Freshers", "1-3 Yr Exp", "3-5 Yr Exp", "5-10 Yr Exp", "10+ Yr Exp", "Working", ""],
    },
    financeDomain: {
        type: String,
        enum: [
            "Financial Analyst",
            "Investment Banking",
            "FP&A Analyst",
            "Financial Modelling Valuation",
            "Business Analyst",
            "Credit Research Analyst",
            "Financial Modelling Equity Research",
            ""
        ],
    },
    status: {
        type: String,
        enum: [
            "Just Casual Enquiry",
            "Not receiving",
            "Lead Forward",
            "Not Interested",
            "Interested but Fees Budget Issue",
            "Planning to visit FINXL office",
            "Want Offline Class Other than Pune City",
            "Visit Done",
            "Payment Details Shared for Admission",
            "Admission Done",
            "Joined Another Institute",
            "Online Live",
            "Interested Details Shared Follow up call back",
            "Not Eligible",
            "Follow Up",
            ""
        ],
    },
    details: {
        type: String,
    },
    followUpDetails: {
        type: String,
    },
    counsellor: {
        type: String,
        trim: true,
    },
    visitingDate: {
        type: Date,
    },
    visitDoneDate: {
        type: Date,
    },
    counsellorWhoTookVisit: {
        type: String,
        trim: true,
    },
    calledOn: {
        type: Date,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            // expose createdBy as string id
            if (ret.createdBy && typeof ret.createdBy === "object" && ret.createdBy._id) {
                ret.createdBy = ret.createdBy._id;
            }
            return ret;
        },
    },
});
// Create indexes for better query performance
leadSchema.index({ phone: 1 }, { unique: true });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ name: "text", phone: "text" });
exports.default = mongoose_1.default.model("Lead", leadSchema);
//# sourceMappingURL=Lead.js.map