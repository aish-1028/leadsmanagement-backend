import mongoose, { type Document } from "mongoose";
export interface LeadDocument extends Document {
    name: string;
    email?: string;
    phone: string;
    city?: string;
    workExp?: "Freshers" | "1-3 Yr Exp" | "3-5 Yr Exp" | "5-10 Yr Exp" | "10+ Yr Exp" | "Working" | "";
    financeDomain?: "Financial Analyst" | "Investment Banking" | "FP&A Analyst" | "Financial Modelling Valuation" | "Business Analyst" | "Credit Research Analyst" | "Financial Modelling Equity Research" | "";
    status?: "Just Casual Enquiry" | "Not receiving" | "Lead Forward" | "Not Interested" | "Interested but Fees Budget Issue" | "Planning to visit FINXL office" | "Want Offline Class Other than Pune City" | "Visit Done" | "Payment Details Shared for Admission" | "Admission Done" | "Joined Another Institute" | "Online Live" | "Interested Details Shared Follow up call back" | "Not Eligible" | "Follow Up" | "";
    details?: string;
    followUpDetails?: string;
    counsellor?: string;
    visitingDate?: Date;
    visitDoneDate?: Date;
    counsellorWhoTookVisit?: string;
    calledOn?: Date;
    createdBy: mongoose.Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<LeadDocument, {}, {}, {}, mongoose.Document<unknown, {}, LeadDocument, {}> & LeadDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Lead.d.ts.map