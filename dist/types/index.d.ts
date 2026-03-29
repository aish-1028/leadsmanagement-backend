export type LeadStatus = "New" | "Engaged" | "Proposal Sent" | "Closed-Won" | "Closed-Lost";
export type WorkExp = "Freshers" | "1-3 Yr Exp" | "3-5 Yr Exp" | "5-10 Yr Exp" | "10+ Yr Exp" | "Working";
export type LeadStage = "Just Casual Enquiry" | "Not receiving" | "Lead Forward" | "Not Interested" | "Interested but Fees Budget Issue" | "Planning to visit FINXL office" | "Want Offline Class Other than Pune City" | "Visit Done" | "Payment Details Shared for Admission" | "Admission Done" | "Joined Another Institute" | "Online Live" | "Interested Details Shared Follow up call back" | "Not Eligible" | "Follow Up";
export interface Lead {
    name: string;
    email: string;
    status: LeadStatus;
    phone?: string;
    city?: string;
    workExp?: WorkExp;
    financeDomain?: string[];
    leadStage?: LeadStage;
    details?: string;
    followUpDetails?: string;
    counsellor?: string;
    calledOn?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface LeadQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: LeadStatus | "all";
    sortBy?: "name" | "email" | "createdAt";
    sortOrder?: "asc" | "desc";
    counsellor?: string | "all";
    allUsers?: boolean;
}
export interface LeadResponse {
    leads: LeadWithId[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface LeadWithId extends Lead {
    _id: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map