/**
 * 365 Days of Love - Configuration
 */

export const CONFIG = {
  TOTAL_DAYS: 365,
  MAX_FREEZES_PER_MONTH: 5,
  APP_TITLE: "365 Days of Love",
  APP_SUBTITLE_AR: "365 رسالة .. لكل يوم في السنة",
  APP_MESSAGE_AR: "لأنكِ تستحقين أن تشعري بالحب والاطمئنان دائماً",
  
  STORAGE_KEYS: {
    CURRENT_DAY: "love365_current_journey_day",
    SHUFFLED_ORDER: "love365_shuffled_order",
    OPENED_DAYS: "love365_opened_days",
    FAVORITES: "love365_favorites",
    LAST_ACTIVE_DATE: "love365_last_active_date",
    STREAK: "love365_streak",
    LOST_STREAK: "love365_lost_streak",
    FREEZE_COUNT: "love365_freeze_count",
    FREEZE_MONTH: "love365_freeze_month",
    USER_AVATAR: "love365_user_avatar"
  }
};

if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}

