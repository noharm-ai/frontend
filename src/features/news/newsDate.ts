import dayjs from "dayjs";

// news dated within these last days are flagged as new (same window as the
// recentNews count sent at login)
export const RECENT_DAYS = 3;

export const isRecentNews = (date: string) =>
  !dayjs(date).isBefore(dayjs().startOf("day").subtract(RECENT_DAYS, "day"));
