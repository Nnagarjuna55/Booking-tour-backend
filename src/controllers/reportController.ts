import { Request, Response } from "express";
import * as reportService from "../services/reportService";

export const getSummary = async (req: Request, res: Response) => {
  const { from, to } = req.query;
  const summary = await reportService.getSummaryReport(
    from ? new Date(from as string) : undefined,
    to ? new Date(to as string) : undefined
  );
  res.json(summary);
};

export const getTopPlaces = async (req: Request, res: Response) => {
  const { limit } = req.query;
  const topPlaces = await reportService.getTopPlaces(
    limit ? parseInt(limit as string) : 5
  );
  res.json(topPlaces);
};

export const getSlotUtilization = async (req: Request, res: Response) => {
  const { placeId } = req.params;
  const data = await reportService.getSlotUtilization(placeId);
  res.json(data);
};

export const getActivePlacesCount = async (_req: Request, res: Response) => {
  const count = await reportService.getActivePlacesCount();
  res.json({ count });
};
