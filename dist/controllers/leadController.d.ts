import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
export declare const getLeads: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createLead: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getLeadById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateLead: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteLead: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getLeadStats: (req: Request, res: Response) => Promise<void>;
export declare const bulkInsertLeads: (import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>> | ((req: AuthRequest, res: Response) => Promise<void>))[];
//# sourceMappingURL=leadController.d.ts.map