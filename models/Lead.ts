import mongoose, { Schema, type Document } from "mongoose"

export interface LeadDocument extends Document {
  name: string
  email?: string
  phone: string
  city?: string
  workExp?: "Freshers" | "1-3 Yr Exp" | "3-5 Yr Exp" | "5-10 Yr Exp" | "10+ Yr Exp" | "Working" |""
  financeDomain?: "Financial Analyst" | "Investment Banking" | "FP&A Analyst" | "Financial Modelling Valuation" | "Business Analyst" | "Credit Research Analyst" | "Financial Modelling Equity Research"| ""
  status?:
    | "Just Casual Enquiry"
    | "Not receiving"
    | "Lead Forward"
    | "Not Interested"
    | "Interested but Fees Budget Issue"
    | "Planning to visit FINXL office"
    | "Want Offline Class Other than Pune City"
    | "Visit Done"
    | "Payment Details Shared for Admission"
    | "Admission Done"
    | "Joined Another Institute"
    | "Online Live"
    | "Interested Details Shared Follow up call back"
    | "Not Eligible"
    | "Follow Up"
    | ""
  details?: string
  followUpDetails?: string
  counsellor?: string
  visitingDate?: Date
  visitDoneDate?: Date
  counsellorWhoTookVisit?: string
  calledOn?: Date
  createdBy: mongoose.Types.ObjectId | string
  createdAt: Date
  updatedAt: Date
}

const leadSchema = new Schema<LeadDocument>(
  {
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
      enum: ["Freshers", "1-3 Yr Exp", "3-5 Yr Exp", "5-10 Yr Exp", "10+ Yr Exp", "Working",""],
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
      type: (Schema.Types.ObjectId as any),
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        // expose createdBy as string id
        if (ret.createdBy && typeof ret.createdBy === "object" && ret.createdBy._id) {
          ret.createdBy = ret.createdBy._id
        }
        return ret
      },
    },
  },
)

// Create indexes for better query performance
leadSchema.index({ phone: 1 }, { unique: true })
leadSchema.index({ status: 1 })
leadSchema.index({ createdAt: -1 })
leadSchema.index({ name: "text", phone: "text" })

export default mongoose.model<LeadDocument>("Lead", leadSchema)
