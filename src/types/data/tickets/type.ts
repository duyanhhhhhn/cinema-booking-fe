export interface ITicket {
    id: number;
    bookingCode: string;
    cinemaName: string;
    roomName: string;
    movieId: number;
    movieTitle: string;
    posterUrl: string;
    seats: string;
    startTime: string;
    status: "PAID" | "PENDING" | "CANCELLED" | "FAILED";
    statusLabel: string;
    totalPrice: number;
}