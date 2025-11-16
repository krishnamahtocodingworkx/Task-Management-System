import { Router } from "express";
import { registerController } from "../controllers/auth.controllers";

const router = Router();

router.post("/register", registerController);

export default router;
