export const AES_256_GCM_ALGORITHM = 'aes-256-gcm';
export const AES_256_GCM_IV_LENGTH = 12;

export enum CronExpression {
  EVERY_SECOND = '* * * * * *',
  EVERY_5_SECONDS = '*/5 * * * * *',
  EVERY_10_SECONDS = '*/10 * * * * *',
  EVERY_30_SECONDS = '*/30 * * * * *',
  EVERY_MINUTE = '*/1 * * * *',
  EVERY_5_MINUTES = '0 */5 * * * *',
  EVERY_HOUR = '0 0-23/1 * * *',
  EVERY_3_HOURS = '0 0-23/3 * * *',
  EVERY_6_HOURS = '0 0-23/6 * * *',
  EVERY_12_HOURS = '0 0-23/12 * * *',
  EVERY_WEEK = '0 0 * * 0',
  EVERY_QUARTER = '0 0 1 */3 *',
  EVERY_6_MONTHS = '0 0 1 */6 *',
  EVERY_YEAR = '0 0 1 0 *',
}
