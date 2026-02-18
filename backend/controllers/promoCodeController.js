import promoCodeModel from "../models/promoCodeModel.js";
import { sendSuccess, sendError, sendPaginatedResponse, sendValidationError } from "../utils/response.js";
import { validateRequired, validatePagination } from "../utils/validation.js";

// ============== PROMO CODE OPERATIONS ==============

// Create Promo Code (Admin)
export const createPromoCode = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount = 0,
      maxDiscount = null,
      usageLimit = null,
      validFrom,
      validUntil,
      applicableFoods = [],
      applicableCategories = [],
    } = req.body;

    // Validate required fields
    const validation = validateRequired({
      code,
      discountType,
      discountValue,
      validFrom,
      validUntil,
    });

    if (!validation.valid) {
      return sendValidationError(res, validation.missing);
    }

    // Validate discount type
    if (!["percentage", "fixed"].includes(discountType)) {
      return sendError(res, "Invalid discount type", 400);
    }

    // Validate dates
    const fromDate = new Date(validFrom);
    const toDate = new Date(validUntil);

    if (toDate <= fromDate) {
      return sendError(res, "Valid until date must be after valid from date", 400);
    }

    // Check if code already exists
    const existingCode = await promoCodeModel.findOne({
      code: code.toUpperCase(),
    });

    if (existingCode) {
      return sendError(res, "Promo code already exists", 409);
    }

    // Create new promo code
    const newPromoCode = new promoCodeModel({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue: parseInt(discountValue),
      minOrderAmount: parseInt(minOrderAmount),
      maxDiscount: maxDiscount ? parseInt(maxDiscount) : null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      validFrom: fromDate,
      validUntil: toDate,
      applicableFoods,
      applicableCategories,
      active: true,
      createdBy: req.userId,
      createdAt: new Date(),
    });

    await newPromoCode.save();

    return sendSuccess(res, "Promo code created successfully", newPromoCode, 201);
  } catch (error) {
    console.error("Create promo code error:", error);
    return sendError(res, "Failed to create promo code", 500, { error: error.message });
  }
};

// Get All Promo Codes (Admin)
export const getAllPromoCodes = async (req, res) => {
  try {
    const { page = 1, limit = 10, active = null } = req.query;

    const { valid, page: p, limit: l, skip } = validatePagination(page, limit);

    if (!valid) {
      return sendError(res, "Invalid pagination parameters", 400);
    }

    const filter = {};
    if (active !== null) {
      filter.active = active === "true";
    }

    const total = await promoCodeModel.countDocuments(filter);

    const codes = await promoCodeModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .lean();

    return sendPaginatedResponse(res, "Promo codes retrieved", codes, p, l, total);
  } catch (error) {
    console.error("Get promo codes error:", error);
    return sendError(res, "Failed to fetch promo codes", 500, { error: error.message });
  }
};

// Get Active Promo Codes (Customer)
export const getActivePromoCodes = async (req, res) => {
  try {
    const now = new Date();

    const codes = await promoCodeModel
      .find({
        active: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
      })
      .select("code description discountType discountValue minOrderAmount")
      .lean();

    return sendSuccess(res, "Active promo codes retrieved", codes);
  } catch (error) {
    console.error("Get active promo codes error:", error);
    return sendError(res, "Failed to fetch promo codes", 500, { error: error.message });
  }
};

// Validate Promo Code
export const validatePromoCode = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const userId = req.userId;

    const validation = validateRequired({ code, orderAmount });
    if (!validation.valid) {
      return sendValidationError(res, validation.missing);
    }

    // Find promo code
    const promoCode = await promoCodeModel.findOne({
      code: code.toUpperCase(),
      active: true,
    });

    if (!promoCode) {
      return sendError(res, "Invalid or expired promo code", 404);
    }

    // Check validity dates
    const now = new Date();
    if (now < promoCode.validFrom) {
      return sendError(res, "Promo code is not yet valid", 400);
    }

    if (now > promoCode.validUntil) {
      return sendError(res, "Promo code has expired", 400);
    }

    // Check minimum order amount
    if (orderAmount < promoCode.minOrderAmount) {
      return sendError(
        res,
        `Minimum order amount of Rs. ${promoCode.minOrderAmount} required`,
        400
      );
    }

    // Check usage limit
    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      return sendError(res, "Promo code usage limit exceeded", 400);
    }

    // Check if user already used this code
    if (promoCode.usedBy && promoCode.usedBy.includes(userId)) {
      return sendError(res, "You have already used this promo code", 400);
    }

    // Calculate discount
    let discountAmount = 0;

    if (promoCode.discountType === "percentage") {
      discountAmount = (orderAmount * promoCode.discountValue) / 100;
      if (promoCode.maxDiscount) {
        discountAmount = Math.min(discountAmount, promoCode.maxDiscount);
      }
    } else {
      discountAmount = promoCode.discountValue;
    }

    discountAmount = Math.floor(discountAmount * 100) / 100; // Round to 2 decimals

    return sendSuccess(res, "Promo code is valid", {
      code: promoCode.code,
      discountAmount,
      finalAmount: Math.max(0, orderAmount - discountAmount),
      message: `You saved Rs. ${discountAmount}!`,
    });
  } catch (error) {
    console.error("Validate promo code error:", error);
    return sendError(res, "Failed to validate promo code", 500, { error: error.message });
  }
};

// Apply Promo Code (after order confirmation)
export const applyPromoCode = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.userId;

    const promoCode = await promoCodeModel.findOne({
      code: code.toUpperCase(),
    });

    if (!promoCode) {
      return sendError(res, "Promo code not found", 404);
    }

    // Add user to usedBy array if not already there
    if (!promoCode.usedBy) promoCode.usedBy = [];

    if (!promoCode.usedBy.includes(userId)) {
      promoCode.usedBy.push(userId);
      promoCode.usageCount = (promoCode.usageCount || 0) + 1;

      await promoCode.save();
    }

    return sendSuccess(res, "Promo code applied successfully");
  } catch (error) {
    console.error("Apply promo code error:", error);
    return sendError(res, "Failed to apply promo code", 500, { error: error.message });
  }
};

// Update Promo Code (Admin)
export const updatePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, discountValue, active, validUntil, usageLimit } = req.body;

    const promoCode = await promoCodeModel.findById(id);

    if (!promoCode) {
      return sendError(res, "Promo code not found", 404);
    }

    // Update allowed fields
    if (description) promoCode.description = description;
    if (discountValue) promoCode.discountValue = parseInt(discountValue);
    if (active !== undefined) promoCode.active = active;
    if (validUntil) promoCode.validUntil = new Date(validUntil);
    if (usageLimit !== undefined) promoCode.usageLimit = usageLimit;

    promoCode.updatedAt = new Date();
    await promoCode.save();

    return sendSuccess(res, "Promo code updated successfully", promoCode);
  } catch (error) {
    console.error("Update promo code error:", error);
    return sendError(res, "Failed to update promo code", 500, { error: error.message });
  }
};

// Delete Promo Code (Admin)
export const deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;

    const promoCode = await promoCodeModel.findByIdAndDelete(id);

    if (!promoCode) {
      return sendError(res, "Promo code not found", 404);
    }

    return sendSuccess(res, "Promo code deleted successfully", { deletedId: id });
  } catch (error) {
    console.error("Delete promo code error:", error);
    return sendError(res, "Failed to delete promo code", 500, { error: error.message });
  }
};

// Get Promo Code Statistics (Admin)
export const getPromoCodeStats = async (req, res) => {
  try {
    const { id } = req.params;

    const promoCode = await promoCodeModel.findById(id);

    if (!promoCode) {
      return sendError(res, "Promo code not found", 404);
    }

    return sendSuccess(res, "Promo code statistics", {
      code: promoCode.code,
      usageCount: promoCode.usageCount || 0,
      usageLimit: promoCode.usageLimit,
      remainingUsage: promoCode.usageLimit
        ? promoCode.usageLimit - (promoCode.usageCount || 0)
        : "Unlimited",
      usagePercentage: promoCode.usageLimit
        ? Math.round(((promoCode.usageCount || 0) / promoCode.usageLimit) * 100)
        : 0,
      userCount: (promoCode.usedBy || []).length,
      active: promoCode.active,
      validFrom: promoCode.validFrom,
      validUntil: promoCode.validUntil,
    });
  } catch (error) {
    console.error("Get promo stats error:", error);
    return sendError(res, "Failed to fetch statistics", 500, { error: error.message });
  }
};
