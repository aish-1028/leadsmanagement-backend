import mongoose, { Schema, type Document } from "mongoose"
import bcrypt from "bcrypt"

export type UserRole = "admin" | "user"

export interface UserDocument extends Document {
  name: string
  email: string
  password: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
  comparePassword(candidate: string): Promise<boolean>
}

const userSchema = new Schema<UserDocument>(
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
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["admin", "counseller", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        delete ret.password
        return ret
      },
    },
  },
)

// Hash password before save
userSchema.pre<UserDocument>("save", async function (next) {
  if (!this.isModified("password")) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (err) {
    next(err as any)
  }
})

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password)
}

userSchema.index({ email: 1 })

export default mongoose.model<UserDocument>("User", userSchema)
