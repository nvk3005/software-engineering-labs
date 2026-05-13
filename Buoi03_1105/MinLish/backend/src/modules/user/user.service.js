import { User, UserProfile } from "../../models/mysql/index.js";
import AppError from "../../utils/AppError.js";

/**
 * @param {number} userId
 */
export const getUserProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["passwordHash"] },
    include: [{ model: UserProfile, as: "profile" }],
  });

  if (!user) {
    throw new AppError("Không tìm thấy người dùng", 404);
  }

  return user;
};

export const isEditSelfProfile = (userId, editProfileUserId) => {
  return String(userId) === String(editProfileUserId);
};

export const updateProfile = async (data) => {
  try {
    let profile = await UserProfile.findOne({
      where: { userId: data.userId },
      // KHÔNG dùng raw: true ở đây vì chúng ta cần dùng hàm .save() phía dưới
    });
    profile.fullname = data.fullname || profile.fullname;
    profile.phone = data.phone || profile.phone;
    profile.bio = data.bio || profile.bio;
    profile.gender = data.gender || profile.gender;
    profile.birthday = data.birthday || profile.birthday;
    profile.avatarName = data.avatarName || profile.avatarName;
    await profile.save();
    return await getUserProfile(data.userId);
  } catch (e) {
    throw new AppError("Lỗi khi lưu profile", 500);//Lỗi server
  }
};
