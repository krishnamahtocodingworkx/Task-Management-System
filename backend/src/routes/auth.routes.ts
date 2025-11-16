import { Router } from "express";
import { login, logoutController, refreshTokenController, registerController } from "../controllers/auth.controllers";
import validate from "../middlewares/validate";
import { loginSchema, registerSchema } from "../utils/validation";

const router = Router();

router.post("/register",validate(registerSchema) ,registerController);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refreshTokenController);
router.post("/logout", logoutController);


export default router;
