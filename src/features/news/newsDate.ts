import dayjs from "dayjs";

// news dated today are flagged as new (same rule as the recentNews count sent
// at login)
export const isRecentNews = (date: string) =>
  dayjs(date).isSame(dayjs(), "day");
