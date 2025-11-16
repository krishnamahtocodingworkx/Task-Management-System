import Joi from "joi";

export const registerSchema = Joi.object({
    name: Joi.string().min(2).optional(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

export const createTaskSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().allow("", null),
    status: Joi.string()
        .valid("PENDING", "IN_PROGRESS", "DONE")
        .default("PENDING"),
});

export const updateTaskSchema = Joi.object({
    title: Joi.string().min(3).optional(),
    description: Joi.string().allow(null, "").optional(),
    status: Joi.string()
      .valid("PENDING", "IN_PROGRESS", "DONE")
      .optional(),
  }).min(1); // At least one field must be provided