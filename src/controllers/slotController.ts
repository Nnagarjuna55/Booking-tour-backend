import { Request, Response } from "express";
import * as slotService from "../services/slotService";

export const createSlot = async (req: Request, res: Response) => {
  try {
  const payload = (req as any).body;
  const slot = await slotService.createSlot(payload);
    res.status(201).json(slot);
  } catch (err: any) {
    // include limited context to help debugging in dev
    const debugMsg = err?.message || "Invalid slot data";
    res.status(400).json({ message: debugMsg });
  }
};

export const getSlotsByPlace = async (req: Request, res: Response) => {
  const slots = await slotService.getSlotsByPlace((req as any).params.placeId);
  res.json(slots);
};

export const updateSlot = async (req: Request, res: Response) => {
  const slot = await slotService.updateSlot((req as any).params.id, (req as any).body);
  res.json(slot);
};

export const cancelSlot = async (req: Request, res: Response) => {
  const slot = await slotService.cancelSlot((req as any).params.id);
  res.json(slot);
};
