import { Request, Response } from "express";
import * as clientService from "../services/clientService";

export const createClient = async (req: Request, res: Response) => {
  try {
  const client = await clientService.createClient((req as any).body);
    res.status(201).json(client);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getClients = async (_req: Request, res: Response) => {
  const clients = await clientService.getClients();
  res.json(clients);
};

export const getClient = async (req: Request, res: Response) => {
  const client = await clientService.getClientById((req as any).params.id);
  if (!client) return res.status(404).json({ message: "Client not found" });
  res.json(client);
};

export const updateClient = async (req: Request, res: Response) => {
  const client = await clientService.updateClient((req as any).params.id, (req as any).body);
  res.json(client);
};
