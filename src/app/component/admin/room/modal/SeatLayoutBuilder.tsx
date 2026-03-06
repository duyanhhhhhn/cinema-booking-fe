import { useState } from "react";

interface ISeat {
  id: string;
  row: number;
  col: number;
  label: string;
  type: string;
  status: string;
}

interface Props {
  onChange: (layout: string, total: number) => void;
}

export default function SeatLayoutBuilder({ onChange }: Props) {
  const rows = 5;
  const cols = 8;

  const [seats, setSeats] = useState<ISeat[]>([]);

  const toggleSeat = (row: number, col: number) => {
    const id = `${row}-${col}`;
    const exists = seats.find((s) => s.id === id);

    let newSeats;

    if (exists) {
      newSeats = seats.filter((s) => s.id !== id);
    } else {
      newSeats = [
        ...seats,
        {
          id,
          row,
          col,
          label: `${String.fromCharCode(65 + row)}${col + 1}`,
          type: "standard",
          status: "active",
        },
      ];
    }

    setSeats(newSeats);
    onChange(JSON.stringify(newSeats), newSeats.length);
  };

  return (
    <div className="space-y-2">
      <div className="text-center font-semibold">Màn hình</div>

      <div className="grid gap-2">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex gap-2 justify-center">
            {Array.from({ length: cols }).map((_, col) => {
              const id = `${row}-${col}`;
              const active = seats.find((s) => s.id === id);

              return (
                <div
                  key={id}
                  onClick={() => toggleSeat(row, col)}
                  className={`w-8 h-8 rounded cursor-pointer ${
                    active ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
