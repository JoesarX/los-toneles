export const BUSINESS_TIME_ZONE = "America/Tegucigalpa";
export const BUSINESS_HOURS_LABEL =
  "lunes a sábado, de 10:00 a.m. a 7:00 p.m.";
export const CLOSED_ORDER_MESSAGE = `Estamos cerrados. Programa tu pedido para ${BUSINESS_HOURS_LABEL}.`;
export const SCHEDULE_OUTSIDE_HOURS_MESSAGE = `La hora programada debe estar dentro de nuestro horario: ${BUSINESS_HOURS_LABEL}.`;

const OPEN_MINUTES = 10 * 60;
const CLOSE_MINUTES = 19 * 60;
const SLOT_MINUTES = 15;
const BUSINESS_DAYS = new Set(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);

const partFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS_TIME_ZONE,
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const businessParts = (date: Date) => {
  const parts = partFormatter.formatToParts(date);
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0
  );

  return { weekday, minutes: hour * 60 + minute };
};

export const isWithinBusinessHours = (date: Date) => {
  const { weekday, minutes } = businessParts(date);
  return (
    BUSINESS_DAYS.has(weekday) &&
    minutes >= OPEN_MINUTES &&
    minutes < CLOSE_MINUTES
  );
};

export const nextBusinessOpening = (from = new Date()) => {
  const candidate = new Date(from.getTime() + SLOT_MINUTES * 60 * 1000);
  candidate.setSeconds(0, 0);

  for (let index = 0; index < 7 * 24 * 4; index += 1) {
    if (isWithinBusinessHours(candidate)) {
      return candidate;
    }
    candidate.setTime(candidate.getTime() + SLOT_MINUTES * 60 * 1000);
  }

  return candidate;
};
