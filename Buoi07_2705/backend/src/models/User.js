import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    avatarPublicId: { type: String, default: "" },
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    isVerified: { type: Boolean, default: false },
    refreshTokens: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false, id: false },
);

userSchema.statics.findByPublicId = function findByPublicId(id) {
  return this.findOne({ id });
};

userSchema.statics.findByEmail = function findByEmail(email) {
  return this.findOne({
    email: String(email || "")
      .toLowerCase()
      .trim(),
  });
};

userSchema.statics.existsByEmail = async function existsByEmail(email) {
  return Boolean(
    await this.exists({
      email: String(email || "")
        .toLowerCase()
        .trim(),
    }),
  );
};

userSchema.statics.findByRefreshToken = function findByRefreshToken(
  id,
  refreshToken,
) {
  return this.findOne({ id, refreshTokens: refreshToken });
};

userSchema.methods.addRefreshToken = async function addRefreshToken(
  refreshToken,
) {
  this.refreshTokens = [...(this.refreshTokens || []), refreshToken];
  await this.save();
  return this;
};

userSchema.methods.removeRefreshToken = async function removeRefreshToken(
  refreshToken,
) {
  this.refreshTokens = (this.refreshTokens || []).filter(
    (token) => token !== refreshToken,
  );
  await this.save();
  return this;
};

userSchema.methods.clearRefreshTokens = async function clearRefreshTokens() {
  this.refreshTokens = [];
  await this.save();
  return this;
};

userSchema.methods.markVerified = async function markVerified() {
  this.isVerified = true;
  await this.save();
  return this;
};

userSchema.methods.updatePassword = async function updatePassword(
  hashedPassword,
) {
  this.password = hashedPassword;
  await this.save();
  return this;
};

export const User = mongoose.model("User", userSchema);
