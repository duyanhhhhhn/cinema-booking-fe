export interface IRoom {
  id: number;

  cinemaId: number;

  cinemaName?: string;

  name: string;

  type: string;

  totalSeats: number;

  seatLayout: string | null;

  createdAt?: string;
}

export interface IRoomRequest {
  cinemaId: number;
  name: string;
  type: string;
  totalSeats: number;
  seatLayout: string;
}
