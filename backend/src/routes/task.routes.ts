import { Router } from "express";
import { createTask, deleteTask, getTaskById, getTasks, toggleTaskStatus, updateTask } from "../controllers/task.controller";
import { auth } from "../middlewares/auth";
import validate from "../middlewares/validate";
import { createTaskSchema, updateTaskSchema } from "../utils/validation";
import { validateTaskQuery } from "../middlewares/validateTaskQuery";
import { taskIdSchema, validateTaskId } from "../middlewares/taskIdValidation";

const router = Router();

router.post("/", auth, validate(createTaskSchema), createTask);
router.get("/", auth, validateTaskQuery, getTasks);
router.get("/:id", auth, validateTaskId(taskIdSchema), getTaskById);
router.patch(
    "/:id",
    auth,
    validateTaskId(taskIdSchema),
    validate(updateTaskSchema),
    updateTask
  );

  router.delete(
    "/:id",
    auth,
    validateTaskId(taskIdSchema),
    deleteTask
  );
  router.patch(
    "/:id/toggle",
    auth,
    validateTaskId(taskIdSchema),
    toggleTaskStatus
  );
  
  

export default router;
