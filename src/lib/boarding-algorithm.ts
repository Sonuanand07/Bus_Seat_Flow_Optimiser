type Booking = {
  Booking_ID: string;
  Seats: string[];
};

type BoardingSequence = {
  Seq: number;
  Booking_ID: string;
};

const validSeatRegex = /^(A|B|C|D)([1-9]|1[0-9]|20)$/;
const MAX_ROWS = 20;
const SEAT_COLUMNS = ["A", "B", "C", "D"];
const MAX_SEATS = MAX_ROWS * SEAT_COLUMNS.length;

export function parseBookingFile(fileContent: string): Booking[] {
  const lines = fileContent.trim().split("\n");
  const bookings: Booking[] = [];
  for (const line of lines) {
    const [Booking_ID, SeatsStr] = line.split(/\s+/);
    if (!Booking_ID || !SeatsStr) continue;
    const Seats = SeatsStr.split(",").map(s => s.trim()).filter(Boolean);
    bookings.push({ Booking_ID, Seats });
  }
  return bookings;
}

export function validateBookings(bookings: Booking[]): string[] {
  const errors: string[] = [];
  const seatSet = new Set<string>();
  let totalSeats = 0;

  for (const booking of bookings) {
    for (const seat of booking.Seats) {
      if (!validSeatRegex.test(seat)) {
        errors.push(`Invalid seat label: ${seat} in Booking ${booking.Booking_ID}`);
      }
      if (seatSet.has(seat)) {
        errors.push(`Duplicate seat: ${seat} in Booking ${booking.Booking_ID}`);
      }
      seatSet.add(seat);
      totalSeats++;
    }
  }

  if (totalSeats > MAX_SEATS) {
    errors.push(`Total seats booked (${totalSeats}) exceeds bus capacity (${MAX_SEATS})`);
  }

  return errors;
}

function seatDistance(seat: string): number {
  // Higher row number = further from entry
  const match = seat.match(/^([ABCD])(\d{1,2})$/);
  if (!match) return 0;
  const [, col, rowStr] = match;
  const row = parseInt(rowStr, 10);
  // Use row number as distance; can be adjusted for more complex layouts
  return row;
}

export function generateBoardingSequence(bookings: Booking[]): BoardingSequence[] {
  // Sort bookings by furthest seat (max row), then by Booking_ID
  const sorted = [...bookings].sort((a, b) => {
    const maxA = Math.max(...a.Seats.map(seatDistance));
    const maxB = Math.max(...b.Seats.map(seatDistance));
    if (maxA !== maxB) return maxB - maxA; // Descending: furthest first
    return a.Booking_ID.localeCompare(b.Booking_ID);
  });

  return sorted.map((booking, idx) => ({
    Seq: idx + 1,
    Booking_ID: booking.Booking_ID,
  }));
}