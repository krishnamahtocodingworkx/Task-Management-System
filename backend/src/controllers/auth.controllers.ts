import { Request, Response } from "express";
import { registerService } from "./auth.service";

export const registerController = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const data = await registerService(name, email, password);

    res.status(201).json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
