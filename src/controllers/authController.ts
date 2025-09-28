import { Request, Response } from "express";
import * as authService from "../services/authService";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    const admin = await authService.registerAdmin(email, password, role);
    res.status(201).json(admin);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { token, admin } = await authService.loginAdmin(email, password);
    res.json({ token, admin });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};
