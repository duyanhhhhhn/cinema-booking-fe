import { Model } from "@/types/core/model";

export interface ISeatMap {
  cinemaName: string;
  duration: number;
  fullAddress: string;
  genre: string;
  moviePosterUrl: string;
  movieTitle: string;
  roomName: string;
  seatMap: SeatRow[];
  showtimeId: number;
  startTime: string;
  roomId: number;
}

export interface SeatRow {
  rowLabel: string;
  seats: Seat[];
}

export interface Seat {
  id: number;
  code: string;
  row: string;
  number: string;
  type: string;
  status: string;
  price: number;
}

export class Seat extends Model {
  static queryKeys = {
    getSeatMap: "GET_SEAT_MAP_QUERY",
  };

  static getSeatMap(showtimeId: number) {
    return {
      queryKey: [this.queryKeys.getSeatMap, showtimeId],
      queryFn: () => {
        return this.api
          .get<ISeatMap>({
            url: `/showtimes/${showtimeId}/seats`,
          })
          .then((r) => r.data);
      },
    };
  }
}
Seat.setup();
