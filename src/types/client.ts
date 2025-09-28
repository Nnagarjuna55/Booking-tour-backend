export interface ClientDTO {
  _id?: string;
  fullName: string;
  email: string;
  phone: string;
  groupSize?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
