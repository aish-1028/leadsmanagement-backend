import mongoose, { type Document } from "mongoose";
export type UserRole = "admin" | "user";
export interface UserDocument extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}
declare const _default: mongoose.Model<UserDocument, {}, {}, {}, mongoose.Document<unknown, {}, UserDocument, {}> & UserDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map