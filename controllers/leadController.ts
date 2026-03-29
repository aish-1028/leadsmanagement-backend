import type { Request, Response } from "express"
import type { AuthRequest } from "../middleware/auth"
import Lead from "../models/Lead"
import type { LeadQuery, LeadResponse, ApiResponse, LeadWithId } from "../types"
import multer from "multer"
import * as XLSX from "xlsx"

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.match(/\.(xlsx|xls)$/)
    ) {
      cb(null, true)
    } else {
      cb(new Error("Only Excel files are allowed"))
    }
  },
})

export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      counsellor = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
      allUsers = false,
    } = req.query as LeadQuery

    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.max(1, Math.min(50, Number(limit))) // Max 50 items per page
    const skip = (pageNum - 1) * limitNum

    // Build query
    const query: any = {}

    // Search functionality
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { phone: { $regex: search.trim(), $options: "i" } },
      ]
    }

    // Status filter
    if (status && status !== "all") {
      query.status = status
    }

    // Counsellor filter
    if (counsellor && counsellor !== "all") {
      query.counsellor = counsellor
    }

    // Sort configuration
    const sortConfig: any = {}
    sortConfig[sortBy as string] = sortOrder === "asc" ? 1 : -1

    // If the user is not an admin and allUsers is not true, only return leads they created
    if (req.user && req.user.role !== "admin" && !allUsers) {
      query.createdBy = req.user._id
    }

    // Execute queries
    const [leads, total] = await Promise.all([
      Lead.find(query).sort(sortConfig).skip(skip).limit(limitNum).lean(),
      Lead.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limitNum)

    // Transform leads to include id instead of _id
    const transformedLeads: LeadWithId[] = leads.map((lead: any) => ({
      _id: lead._id.toString(),
      name: lead.name,
      email: lead.email,
      status: lead.status,
      phone: lead.phone,
      city: lead.city,
      workExp: lead.workExp,
      financeDomain: lead.financeDomain,
      leadStage: lead.leadStage,
      details: lead.details,
      followUpDetails: lead.followUpDetails,
      counsellor: lead.counsellor,
      calledOn: lead.calledOn,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      visitingDate: lead.visitingDate,
      visitDoneDate: lead.visitDoneDate,
      counsellorWhoTookVisit: lead.counsellorWhoTookVisit,
    }))

    const response: ApiResponse<LeadResponse> = {
      success: true,
      data: {
        leads: transformedLeads,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    }

    res.status(200).json(response)
  } catch (error) {
    console.error("Error fetching leads:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
}

export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      status,
      phone,
      city,
      workExp,
      financeDomain,
      details,
      followUpDetails,
      counsellor,
      calledOn,
      visitingDate,
      visitDoneDate,
      counsellorWhoTookVisit,
    } = req.body

    // Validation
    if (!name || !phone) {
      res.status(400).json({
        success: false,
        error: "Name and phone are required",
      })
      return
    }

    // Check if phone already exists
    const existingLead = await Lead.findOne({ phone: phone.trim() })
    if (existingLead) {
      res.status(400).json({
        success: false,
        error: "A lead with this phone number already exists",
      })
      return
    }

    const lead = new Lead({
      name: name.trim(),
      email: email.toLowerCase().trim() || undefined,
      status: status || "Just Casual Enquiry",
      phone: phone.trim() || undefined,
      city: city || undefined,
      workExp: workExp || undefined,
      financeDomain: financeDomain || "",
      details: details || undefined,
      followUpDetails: followUpDetails || undefined,
      counsellor: counsellor || undefined,
      calledOn: calledOn ? new Date(calledOn) : undefined,
      visitingDate: visitingDate ? new Date(visitingDate) : undefined,
      visitDoneDate: visitDoneDate ? new Date(visitDoneDate) : undefined,
      counsellorWhoTookVisit: counsellorWhoTookVisit ? counsellorWhoTookVisit.trim() : undefined,
      createdBy: req.user ? req.user._id : undefined,
    })

    const savedLead = await lead.save()

    const response: ApiResponse = {
      success: true,
      data: savedLead,
      message: "Lead created successfully",
    }

    res.status(201).json(response)
  } catch (error: any) {
    console.error("Error creating lead:", error)

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      res.status(400).json({
        success: false,
        error: validationErrors.join(", "),
      })
    } else if (error.code === 11000) {
      res.status(400).json({
        success: false,
        error: "A lead with this email already exists",
      })
    } else {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      })
    }
  }
}

export const getLeadById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const lead = await Lead.findById(id)

    if (!lead) {
      res.status(404).json({
        success: false,
        error: "Lead not found",
      })
      return
    }

    // Only owners or admins can access
    if (req.user && req.user.role !== "admin" && lead.createdBy.toString() !== (req.user._id as any).toString()) {
      res.status(403).json({ success: false, error: "Forbidden: not allowed to access this lead" })
      return
    }

    const response: ApiResponse = {
      success: true,
      data: lead,
    }

    res.status(200).json(response)
  } catch (error) {
    console.error("Error fetching lead:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
}

export const updateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const {
      name,
      email,
      status,
      phone,
      city,
      workExp,
      financeDomain,
      details,
      followUpDetails,
      visitDoneDate,
      visitingDate,
      counsellorWhoTookVisit,
      counsellor,
      calledOn,
    } = req.body

    const lead = await Lead.findById(id)

    if (!lead) {
      res.status(404).json({
        success: false,
        error: "Lead not found",
      })
      return
    }

    // Only owners or admins can update
    if (req.user && req.user.role !== "admin" && lead.createdBy.toString() !== (req.user._id as any).toString()) {
      res.status(403).json({ success: false, error: "Forbidden: not allowed to modify this lead" })
      return
    }

    // Check if phone is being changed and if it already exists
    if (phone && phone.trim() !== lead.phone) {
      const existingLead = await Lead.findOne({
        phone: phone.trim(),
        _id: { $ne: id },
      })

      if (existingLead) {
        res.status(400).json({
          success: false,
          error: "A lead with this phone number already exists",
        })
        return
      }
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.toLowerCase().trim() }),
        ...(status && { status }),
        ...(phone !== undefined && { phone }),
        ...(city !== undefined && { city }),
        ...(workExp !== undefined && { workExp }),
        ...(financeDomain !== undefined && { financeDomain }),
        ...(details !== undefined && { details }),
        ...(followUpDetails !== undefined && { followUpDetails }),
        ...(counsellor !== undefined && { counsellor }),
        ...(calledOn !== undefined && { calledOn: calledOn ? new Date(calledOn) : undefined }),
        ...(visitingDate !== undefined && { visitingDate: visitingDate ? new Date(visitingDate) : undefined }),
        ...(visitDoneDate !== undefined && { visitDoneDate: visitDoneDate ? new Date(visitDoneDate) : undefined }),
        ...(counsellorWhoTookVisit !== undefined && { counsellorWhoTookVisit: counsellorWhoTookVisit.trim() }),
      },
      { new: true, runValidators: true },
    )

    const response: ApiResponse = {
      success: true,
      data: updatedLead,
      message: "Lead updated successfully",
    }

    res.status(200).json(response)
  } catch (error: any) {
    console.error("Error updating lead:", error)

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      res.status(400).json({
        success: false,
        error: validationErrors.join(", "),
      })
    } else {
      res.status(500).json({
        success: false,
        error: "Internal server error",
      })
    }
  }
}

export const deleteLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // Only admins or owners can delete; note that the route already enforces admin only in router
    const lead = await Lead.findByIdAndDelete(id)

    if (!lead) {
      res.status(404).json({
        success: false,
        error: "Lead not found",
      })
      return
    }

    const response: ApiResponse = {
      success: true,
      message: "Lead deleted successfully",
    }

    res.status(200).json(response)
  } catch (error) {
    console.error("Error deleting lead:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
}

export const getLeadStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await Lead.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const total = await Lead.countDocuments()

    const statusCounts = {
      New: 0,
      Engaged: 0,
      "Proposal Sent": 0,
      "Closed-Won": 0,
      "Closed-Lost": 0,
    }

    stats.forEach((stat) => {
      statusCounts[stat._id as keyof typeof statusCounts] = stat.count
    })

    const conversionRate = total > 0 ? Math.round((statusCounts["Closed-Won"] / total) * 100) : 0

    const response: ApiResponse = {
      success: true,
      data: {
        total,
        statusCounts,
        conversionRate,
      },
    }

    res.status(200).json(response)
  } catch (error) {
    console.error("Error fetching lead stats:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
}

export const bulkInsertLeads = [
  upload.single("file"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: "No file uploaded",
        })
        return
      }

      // Parse Excel file
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) {
        res.status(400).json({
          success: false,
          error: "Excel file is empty or has no valid data",
        })
        return
      }
      console.log(`${JSON.stringify(jsonData)}`)

      // Validate and transform data
      const leadsToInsert: any[] = []
      const errors: string[] = []
      const existingEmails: string[] = []

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any
        const rowNumber = i + 2 // +2 because Excel rows start at 1 and header is row 1

        // Required fields
        if (!row.name || !row.phone) {
          errors.push(`Row ${rowNumber}: Name and phone are required`)
          continue
        }

        // Check for duplicate phones in the file
        if (existingEmails.includes(row.phone)) {
          errors.push(`Row ${rowNumber}: Duplicate phone in file: ${row.phone}`)
          continue
        }
        existingEmails.push(row.phone)

        // // Validate email format
        // const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
        // if (!emailRegex.test(row.email)) {
        //   errors.push(`Row ${rowNumber}: Invalid email format: ${row.email}`)
        //   continue
        // }

        // Validate enums
        const validWorkExp = ["Freshers", "1-3 Yr Exp", "3-5 Yr Exp", "5-10 Yr Exp", "10+ Yr Exp", "Working"]
        const validFinanceDomain = [
          "Financial Analyst",
          "Investment Banking",
          "FP&A Analyst",
          "Financial Modelling Valuation",
          "Business Analyst",
          "Credit Research Analyst",
          "Financial Modelling Equity Research",
        ]
        const validStatus = [
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
        ]

        if (row.workExp && !validWorkExp.includes(row.workExp)) {
          errors.push(`Row ${rowNumber}: Invalid work experience: ${row.workExp}`)
          continue
        }

        if (row.financeDomain && !validFinanceDomain.includes(row.financeDomain)) {
          errors.push(`Row ${rowNumber}: Invalid finance domain: ${row.financeDomain}`)
          continue
        }

        if (row.status && !validStatus.includes(row.status)) {
          errors.push(`Row ${rowNumber}: Invalid status: ${row.status}`)
          continue
        }

        // Transform data
        const leadData = {
          name: row.name.trim(),
          email: row?.email?.toLowerCase()?.trim() || undefined,
          status: row.status || "Just Casual Enquiry",
          phone: row.phone ? row.phone.toString().trim() : undefined,
          city: row.city ? row.city.trim() : undefined,
          workExp: row.workExp || undefined,
          financeDomain: row.financeDomain || "",
          details: row.details ? row.details.trim() : undefined,
          followUpDetails: row.followUpDetails ? row.followUpDetails.trim() : undefined,
          counsellor: req.body.counsellor ? req.body.counsellor.trim() : (row.counsellor ? row.counsellor.trim() : undefined),
          calledOn: row.calledOn ? new Date(row.calledOn) : undefined,
          visitingDate: row.visitingDate ? new Date(row.visitingDate) : undefined,
          visitDoneDate: row.visitDoneDate ? new Date(row.visitDoneDate) : undefined,
          counsellorWhoTookVisit: row.counsellorWhoTookVisit ? row.counsellorWhoTookVisit.trim() : undefined,
          createdBy: req.user ? req.user._id : undefined,
        }
        leadsToInsert.push(leadData)
      }

      if (leadsToInsert.length === 0) {
        res.status(400).json({
          success: false,
          error: "No valid leads to insert",
          details: errors,
        })
        return
      }

      // Check for existing phones in database
      const phones = leadsToInsert.map(lead => lead.phone)
      const existingLeads = await Lead.find({ phone: { $in: phones } }).select('phone')
      const existingPhoneSet = new Set(existingLeads.map(lead => lead.phone))

      const finalLeads = leadsToInsert.filter(lead => !existingPhoneSet.has(lead.phone))
      const skippedPhones = leadsToInsert.filter(lead => existingPhoneSet.has(lead.phone)).map(lead => lead.phone)

      const leadsData = finalLeads.map(item => ({
        name: item.name.trim(),
        email: item?.email?.toLowerCase()?.trim() || undefined,
        status: item.status || "Just Casual Enquiry",
        phone: item.phone || "",
        city: item.city || "",
        workExp: item.workExp || "",
        financeDomain: item.financeDomain || "",
        details: item.details || "",
        followUpDetails: item.followUpDetails || "",
        counsellor: req.body.counsellor || item.counsellor || "",
        calledOn: item.calledOn ? new Date(item.calledOn) : "",
        visitingDate: item.visitingDate ? new Date(item.visitingDate) : undefined,
        visitDoneDate: item.visitDoneDate ? new Date(item.visitDoneDate) : undefined,
        counsellorWhoTookVisit: item.counsellorWhoTookVisit || "",
        createdBy: req.user ? req.user._id : "",
      }));

      console.log('Final leads to insert:', leadsData)


      // Insert leads
      let insertedCount = 0;
      //console.log(`Inserting ${finalLeads.length} leads, skipping ${skippedPhones.length} duplicate phones, ${errors.length} errors`)
      if (leadsData.length > 0) {
        try {
          const savedLeads = await Lead.insertMany(leadsData, { ordered: false });

          insertedCount = savedLeads.length
        }
        catch (insertError: any) {
          console.log("Error during bulk insert:", insertError)
          if (insertError.writeErrors) {
            insertError.writeErrors.forEach((we: any) => {
              errors.push(`Insert error for lead with phone ${we.getOperation().phone}: ${we.errmsg}`)
            })
          } else {
            errors.push(`Bulk insert error: ${insertError.message}`)
          }
        }

      }

      const response: ApiResponse = {
        success: true,
        data: {
          inserted: insertedCount,
          skipped: skippedPhones.length,
          errors: errors.length,
          skippedPhones: skippedPhones,
          errorDetails: errors,
        },
        message: `Bulk insert completed. ${insertedCount} leads inserted, ${skippedPhones.length} skipped (duplicates), ${errors.length} errors.`,
      }

      res.status(200).json(response)
    } catch (error: any) {
      console.error("Error in bulk insert:", error)

      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map((err: any) => err.message)
        res.status(400).json({
          success: false,
          error: validationErrors.join(", "),
        })
      } else if (error.code === 11000) {
        res.status(400).json({
          success: false,
          error: "Duplicate Phones found",
        })
      } else {
        res.status(500).json({
          success: false,
          error: "Internal server error",
        })
      }
    }
  },
]
