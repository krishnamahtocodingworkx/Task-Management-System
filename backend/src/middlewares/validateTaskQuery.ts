import { Request, Response, NextFunction } from "express";

const allowedStatuses = ["PENDING", "IN_PROGRESS", "DONE"];

export const validateTaskQuery = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { page, limit, status, search } = req.query;

  // Validate page
  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    return res.status(400).json({ message: "Page must be a positive number" });
  }

  // Validate limit
  if (limit && (isNaN(Number(limit)) || Number(limit) < 1)) {
    return res.status(400).json({ message: "Limit must be a positive number" });
  }

  // Validate status
  if (status && !allowedStatuses.includes(String(status))) {
    return res.status(400).json({
      message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
    });
  }

  // Validate search
  if (search && typeof search !== "string") {
    return res.status(400).json({ message: "Search must be a string" });
  }

  next();
};
