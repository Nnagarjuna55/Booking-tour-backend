export interface PlaceDTO {
  _id?: string;
  name: string;
  location: string;
  description?: string;
  images?: string[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
