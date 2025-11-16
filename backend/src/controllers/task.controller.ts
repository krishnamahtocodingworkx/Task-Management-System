import { Request, Response } from "express";
import { createTaskSchema } from "../utils/validation";
import prisma from "../utils/prisma";
import { TaskStatus } from "@prisma/client";

export const createTask = async (req: Request, res: Response) => {
    try {
      const { title, description, status = "PENDING" } = req.body;
      const userId = req.user?.id;
  
      const task = await prisma.task.create({
        data: {
          title,
          description,
          status,
          ownerId: userId!,
        },
      });
  
      return res.status(201).json({
        message: "Task created successfully",
        task,
      });
  
    } catch (err) {
      console.error("Task Create Error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  export const getTasks = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
  
      // Get query params
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = (req.query.search as string) || "";
      const status = (req.query.status as string) || "";
  
      const skip = (page - 1) * limit;
  
      // Prisma query filters
      const whereClause: any = {
        ownerId: userId,
      };
  
      if (search) {
        whereClause.title = {
          contains: search,
          mode: "insensitive", // makes search case-insensitive
        };
      }
  
      if (status) {
        whereClause.status = status; // must match enum values
      }
  
      // Fetch tasks
      const tasks = await prisma.task.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      });
  
      // Total Count
      const total = await prisma.task.count({
        where: whereClause,
      });
  
      return res.json({
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        tasks,
      });
  
    } catch (err) {
      console.error("GET Tasks Error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  
  export const getTaskById = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id; 
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({ message: "Task ID is required" });
      }

      const task = await prisma.task.findFirst({
        where: {
          id,
          ownerId: userId,
        },
      });
  
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      return res.json(task);
  
    } catch (error) {
      console.log("GET TASK BY ID ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };


  export const updateTask = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
  
      // Check if task exists AND belongs to user
      if (!id) {
        return res.status(400).json({ message: "Task ID is required" });
      }

      const existing = await prisma.task.findFirst({
        where: {
          id,
          ownerId: userId,
        },
      });
  
      if (!existing) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      // Update task
      const updated = await prisma.task.update({
        where: { id },
        data: req.body, // safe because validated by Joi
      });
  
      return res.json({
        message: "Task updated successfully",
        task: updated,
      });
  
    } catch (error) {
      console.log("UPDATE TASK ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  export const deleteTask = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Task ID is required" });
      }
      // Check if task exists and belongs to user
      const existing = await prisma.task.findFirst({
        where: {
          id,
          ownerId: userId,
        },
      });
  
      if (!existing) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      await prisma.task.delete({
        where: { id },
      });
  
      return res.json({ message: "Task deleted successfully" });
  
    } catch (error) {
      console.error("DELETE TASK ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
  
  export const toggleTaskStatus = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({ message: "Task ID is required" });
      }
      // Verify task belongs to user
      const task = await prisma.task.findFirst({
        where: { id, ownerId: userId },
      });
  
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      // Toggle logic
      let newStatus;
  
      switch (task.status) {
        case "PENDING":
          newStatus = "IN_PROGRESS";
          break;
        case "IN_PROGRESS":
          newStatus = "DONE";
          break;
        case "DONE":
          newStatus = "PENDING";
          break;
        default:
          newStatus = "PENDING";
      }
  
      const updatedTask = await prisma.task.update({
        where: { id },
        data: { status: newStatus as TaskStatus },
      });
  
      return res.json({
        message: `Task status updated to ${newStatus}`,
        task: updatedTask,
      });
  
    } catch (error) {
      console.error("TOGGLE TASK STATUS ERROR:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  