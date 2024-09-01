export function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === "development";
}

export function getPort(): number {
  return parseInt(process.env.PORT || "5000", 10);
}

export function getBodySizeLimit(): string {
  return process.env.BODY_SIZE_LIMIT || "5mb";
}

export function getReservationExpiryMinutes(): number {
  return parseInt(process.env.RESERVATION_EXPIRY_MINUTES || "30", 10);
}

export function getMinAdvanceBookingHours(): number {
  return parseInt(process.env.MIN_ADVANCE_BOOKING_HOURS || "24", 10);
}

export function getSlotDurationMinutes(): number {
  return parseInt(process.env.SLOT_DURATION_MINUTES || "15", 10);
}
