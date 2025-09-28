import Client, { IClient } from "../models/Client";

export const createClient = async (data: Partial<IClient>) => {
  // normalize identifiers
  const phone = data.phone ? String(data.phone).trim() : undefined;
  const email = data.email ? String(data.email).trim().toLowerCase() : undefined;

  // If no identifier provided, create the client directly
  if (!phone && !email) {
    const client = new Client({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      groupSize: data.groupSize ?? 1,
      notes: data.notes,
    });
    return client.save();
  }

  // Build query to find existing client by phone or email
  const orQuery: any[] = [];
  if (phone) orQuery.push({ phone });
  if (email) orQuery.push({ email });

  // Atomic upsert: if a client with phone/email exists, update details (name/email/phone)
  // This ensures admin-entered client data overwrites placeholders.
  const update: any = {
    $set: {
      fullName: data.fullName,
      email: email,
      phone: phone,
      groupSize: data.groupSize ?? 1,
      notes: data.notes,
    },
    $setOnInsert: {
      createdAt: new Date(),
    },
  };

  const opts = { new: true, upsert: true } as any;
  const client = await Client.findOneAndUpdate({ $or: orQuery }, update, opts).exec();
  return client as IClient;
};

export const getClients = async () => {
  return Client.find();
};

export const getClientById = async (id: string) => {
  return Client.findById(id);
};

export const updateClient = async (id: string, data: Partial<IClient>) => {
  return Client.findByIdAndUpdate(id, data, { new: true });
};
