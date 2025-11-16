import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const taskIdSchema = Joi.object({
  id: Joi.string().required(),
});

export const validateTaskId = (schema: Joi.ObjectSchema) => {
  return (req:Request, res:Response, next:NextFunction) => {
    const { error } = schema.validate(req.params);

    if (error) {
      return res.status(400).json({
        message: "Invalid request params",
        details: error.details?.[0]?.message || "No details available",
      });
    }

    next();
  };
};
