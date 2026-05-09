import { Prisma } from "@prisma/client";
import { z } from "zod";

const uuidSchema = z.string().uuid();
const decimalStringSchema = z
  .string()
  .trim()
  .regex(/^-?\d+(\.\d+)?$/); // Matches valid decimal numbers, including negative and with optional decimal part

const decimalDbSchema = z.union([
  z.instanceof(Prisma.Decimal),
  z.number().finite(),
  decimalStringSchema,
]);

const decimalInputSchema = z.union([z.number().finite(), decimalStringSchema]);

const jsonLiteralSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

type Json =
  | z.infer<typeof jsonLiteralSchema>
  | { [key: string]: Json }
  | Json[];

const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([
    jsonLiteralSchema,
    z.array(jsonSchema),
    z.record(z.string(), jsonSchema),
  ]),
);

export const notificationChannelSchema = z.enum(["email", "whatsapp"]);

export const brandSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(120),
  country: z.string().min(1).max(100),
  logoUrl: z.string().nullable(),
  logoPublicId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const carImageSchema = z.object({
  id: uuidSchema,
  carId: uuidSchema,
  imageUrl: z.string().url(),
  publicId: z.string().min(1),
  isPrimary: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const carSpecificationSchema = z.object({
  id: uuidSchema,
  carId: uuidSchema,
  specs: jsonSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const reviewSchema = z.object({
  id: uuidSchema,
  email: z.string().email().max(150),
  username: z.string().max(100).nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  isVerified: z.boolean(),
  verificationToken: z.string().max(255).nullable(),
  editTokenHash: z.string().max(255).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const carInterestSchema = z.object({
  id: uuidSchema,
  carId: uuidSchema,
  email: z.string().email().max(150),
  phoneNumber: z.string().max(20).nullable(),
  notified: z.boolean(),
  createdAt: z.date(),
});

export const notificationLogSchema = z.object({
  id: uuidSchema,
  interestId: uuidSchema,
  channel: notificationChannelSchema,
  status: z.string().max(50).nullable(),
  sentAt: z.date().nullable(),
});

export const adminSchema = z.object({
  id: uuidSchema,
  email: z.string().email().max(100),
  passwordHash: z.string().min(1),
  fullName: z.string().min(1).max(50),
  role: z.string().min(1).max(50),
  isPrimary: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export const visitorEventSchema = z.object({
  id: uuidSchema,
  eventType: z.string().min(1).max(100),
  page: z.string().min(1).max(255),
  carId: uuidSchema.nullable(),
  ipAddress: z.string(),
  userAgent: z.string().nullable(),
  createdAt: z.date(),
});

export const carSchema = z.object({
  id: uuidSchema,
  brandId: uuidSchema,
  name: z.string().min(1).max(150),
  model: z.string().min(1).max(150),
  year: z.number().int().min(1886),
  registrationYear: z.number().int().min(1886),
  engine: z.string().max(100).nullable(),
  engineCapacityCc: z.number().int().min(1),
  transmission: z.string().max(50).nullable(),
  mileageKm: z.number().int().min(0),
  originCountry: z.string().max(100),
  color: z.string().max(100),
  description: z.string(),
  price: decimalDbSchema,
  salePrice: decimalDbSchema.nullable(),
  isOnSale: z.boolean(),
  isNewArrival: z.boolean(),
  newArrivalExpiresAt: z.coerce.date().optional().nullable(),
  stockQuantity: z.number().int().min(0),
  isFeatured: z.boolean(),
  featuredOrder: z.number().int().min(0).nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const brandCreateInputSchema = brandSchema.pick({
  name: true,
  slug: true,
  country: true,
  logoUrl: true,
});

export const carImageCreateInputSchema = carImageSchema.pick({
  imageUrl: true,
  isPrimary: true,
});

export const carSpecificationCreateInputSchema = carSpecificationSchema.pick({
  specs: true,
});

export const carCreateInputSchema = carSchema
  .pick({
    brandId: true,
    name: true,
    model: true,
    year: true,
    registrationYear: true,
    engine: true,
    engineCapacityCc: true,
    transmission: true,
    mileageKm: true,
    originCountry: true,
    color: true,
    description: true,
    price: true,
    salePrice: true,
    isOnSale: true,
    isNewArrival: true,
    stockQuantity: true,
    isFeatured: true,
    featuredOrder: true,
    isActive: true,
  })
  .extend({
    images: z.array(z.string().url().max(255).min(1)),
    specifications: jsonSchema.optional(),
  });

export const reviewCreateInputSchema = z.object({
  email: z.string().email().max(150),
  username: z.string().trim().min(2).max(100).optional().nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(1000).optional().nullable(),
});

export const reviewUpdateInputSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().trim().min(1).max(1000).optional().nullable(),
    editToken: z.string().min(20),
  })
  .refine((data) => data.rating !== undefined || data.comment !== undefined, {
    message: "At least one field must be provided for update",
  });

export const adminReviewUpdateInputSchema = z.object({
  isVerified: z.boolean(),
});

export const carInterestCreateInputSchema = z.object({
  carId: uuidSchema,
  email: z.string().email().max(150),
  phoneNumber: z.string().trim().min(6).max(20).optional().nullable(),
});

export const carInterestUpdateInputSchema = z.object({
  notified: z.boolean(),
});

export const notificationLogCreateInputSchema = notificationLogSchema.pick({
  interestId: true,
  channel: true,
  status: true,
  sentAt: true,
});

export const adminLoginInputSchema = z.object({
  email: z.string().email().max(150),
  password: z.string().min(6).max(100),
});

export const adminForgotPasswordInputSchema = z.object({
  email: z.string().email().max(150),
});

export const adminResetPasswordInputSchema = z.object({
  email: z.string().email().max(150),
  otp: z.string().length(6),
  newPassword: z.string().min(8).max(100),
});

export const adminCreateInputSchema = adminSchema.pick({
  email: true,
  passwordHash: true,
  fullName: true,
  role: true,
  isPrimary: true,
  isActive: true,
});

export const adminUpdateInputSchema = adminSchema.pick({
  fullName: true,
});

export const adminUpdateStatusInputSchema = adminSchema.pick({
  isActive: true,
});

export const adminChangePasswordInputSchema = z.object({
  oldPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmNewPassword: z.string().min(8).max(100),
});

export const visitorEventCreateInputSchema = visitorEventSchema.pick({
  eventType: true,
  page: true,
  carId: true,
});

export const carQuerySchema = z.object({
  name: z.string().min(1).max(150).optional(),
  brand: z.string().min(1).max(120).optional(),
  minPrice: decimalInputSchema.optional(),
  maxPrice: decimalInputSchema.optional(),
  year: z.coerce.number().int().min(1886).optional(),
});
