export interface SummaryReport {
  totalBookings: number;
  confirmed: number;
  cancelled: number;
}

export interface TopPlace {
  _id: string;
  total: number;
}

export interface SlotUtilization {
  _id: string;
  total: number;
}
