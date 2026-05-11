import { z } from "zod";

// TODO: Add schemas
export const putProfileSchema = z.object({
  phone: z
    .string()
    .regex(/^\d+$/, "Số điện thoại chỉ được chứa chữ số")
    .max(11, "Tối đa 11 số")
    .optional() // Cho phép không gửi field này
    .or(z.literal("")), // Cho phép gửi chuỗi rỗng "",
  fullname: z
    .string()
    .trim()
    .max(50, "Họ tên không được quá 50 ký tự")
    .optional() // Cho phép không gửi field này
    .or(z.literal("")), // Cho phép gửi chuỗi rỗng "",
});
