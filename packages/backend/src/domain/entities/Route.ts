export type Route = {
  id?: number;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  estimated_time: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
};