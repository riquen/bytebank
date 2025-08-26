import { startOfDay, subDays } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

export const APP_TZ = 'America/Sao_Paulo'

export function sinceStartOfNDaysAgoUTC(n: number): Date {
  const nowUtc = new Date()
  const nowZoned = toZonedTime(nowUtc, APP_TZ)
  const startLocal = startOfDay(subDays(nowZoned, n))

  return fromZonedTime(startLocal, APP_TZ)
}
