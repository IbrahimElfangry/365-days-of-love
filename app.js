/**
 * 365 Days of Love - Main Application Logic
 * Vanilla JavaScript (ES Modules)
 */

import { CONFIG } from './config.js';
import { ALL_MESSAGES, getMessageForDay, shuffleMessages } from './messages.js';

class LoveApp {
  constructor() {
    this.state = {
      currentDay: this.loadCurrentDay(),
      todayISODate: this.getTodayISODate(),
      lastActiveDate: localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_ACTIVE_DATE) || null,
      openedDays: this.loadOpenedDays(),
      favorites: this.loadFavorites(),
      streak: this.loadStreak(),
      lostStreak: this.loadLostStreak(),
      freezeCount: this.loadFreezeCount(),
      freezeMonth: this.loadFreezeMonth(),
      userAvatar: localStorage.getItem(CONFIG.STORAGE_KEYS.USER_AVATAR) || null,
      activeModal: null,
      selectedMessageDay: null,
      activeTab: 'archive' // 'archive' or 'favorites'
    };

    this.timerInterval = null;
    this.init();
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================
  init() {
    this.checkMonthlyFreezeReset();
    this.evaluateStreakAndDayTransition();
    this.cacheDOM();
    this.bindEvents();
    this.renderHeader();
    this.renderAvatar();
    this.renderStatusPanel();
    this.updateJarStatus();
    this.setupPositioningSync();
    this.startCountdownTimer();
    this.handleInitialURLParams();
  }

  // ==========================================
  // STORAGE & STATE HELPERS
  // ==========================================
  getTodayISODate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getCurrentMonthStr() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  loadCurrentDay() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_DAY);
    const day = parseInt(saved, 10);
    return (day && day >= 1 && day <= CONFIG.TOTAL_DAYS) ? day : 1;
  }

  saveCurrentDay(day) {
    this.state.currentDay = Math.max(1, Math.min(CONFIG.TOTAL_DAYS, day));
    localStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_DAY, String(this.state.currentDay));
  }

  loadOpenedDays() {
    try {
      const data = localStorage.getItem(CONFIG.STORAGE_KEYS.OPENED_DAYS);
      return data ? new Set(JSON.parse(data)) : new Set();
    } catch (e) {
      console.warn("Error loading opened days from localStorage:", e);
      return new Set();
    }
  }

  saveOpenedDays() {
    try {
      localStorage.setItem(
        CONFIG.STORAGE_KEYS.OPENED_DAYS,
        JSON.stringify(Array.from(this.state.openedDays))
      );
    } catch (e) {
      console.warn("Error saving opened days to localStorage:", e);
    }
  }

  loadFavorites() {
    try {
      const data = localStorage.getItem(CONFIG.STORAGE_KEYS.FAVORITES);
      return data ? new Set(JSON.parse(data)) : new Set();
    } catch (e) {
      console.warn("Error loading favorites from localStorage:", e);
      return new Set();
    }
  }

  saveFavorites() {
    try {
      localStorage.setItem(
        CONFIG.STORAGE_KEYS.FAVORITES,
        JSON.stringify(Array.from(this.state.favorites))
      );
    } catch (e) {
      console.warn("Error saving favorites to localStorage:", e);
    }
  }

  loadStreak() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.STREAK);
    return saved !== null ? (parseInt(saved, 10) || 0) : 0;
  }

  saveStreak(val) {
    this.state.streak = Math.max(0, parseInt(val, 10) || 0);
    localStorage.setItem(CONFIG.STORAGE_KEYS.STREAK, String(this.state.streak));
  }

  loadLostStreak() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.LOST_STREAK);
    return saved !== null ? (parseInt(saved, 10) || 0) : 0;
  }

  saveLostStreak(val) {
    this.state.lostStreak = Math.max(0, parseInt(val, 10) || 0);
    localStorage.setItem(CONFIG.STORAGE_KEYS.LOST_STREAK, String(this.state.lostStreak));
  }

  loadFreezeCount() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.FREEZE_COUNT);
    if (saved === null) return CONFIG.MAX_FREEZES_PER_MONTH;
    const parsed = parseInt(saved, 10);
    return !isNaN(parsed) ? Math.max(0, Math.min(CONFIG.MAX_FREEZES_PER_MONTH, parsed)) : CONFIG.MAX_FREEZES_PER_MONTH;
  }

  saveFreezeCount(count) {
    this.state.freezeCount = Math.max(0, Math.min(CONFIG.MAX_FREEZES_PER_MONTH, count));
    localStorage.setItem(CONFIG.STORAGE_KEYS.FREEZE_COUNT, String(this.state.freezeCount));
  }

  loadFreezeMonth() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.FREEZE_MONTH) || this.getCurrentMonthStr();
  }

  checkMonthlyFreezeReset() {
    const currentMonth = this.getCurrentMonthStr();
    if (this.state.freezeMonth !== currentMonth) {
      this.state.freezeCount = CONFIG.MAX_FREEZES_PER_MONTH;
      this.state.freezeMonth = currentMonth;
      this.saveFreezeCount(CONFIG.MAX_FREEZES_PER_MONTH);
      localStorage.setItem(CONFIG.STORAGE_KEYS.FREEZE_MONTH, currentMonth);
    }
  }

  // ==========================================
  // STREAK & DAY PROGRESSION ENGINE
  // ==========================================
  calendarDayDiff(isoDate1, isoDate2) {
    if (!isoDate1 || !isoDate2) return 999;
    const p1 = isoDate1.split('-').map(Number);
    const p2 = isoDate2.split('-').map(Number);
    const d1 = new Date(p1[0], p1[1] - 1, p1[2]);
    const d2 = new Date(p2[0], p2[1] - 1, p2[2]);
    const diffMs = d2.getTime() - d1.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  evaluateStreakAndDayTransition() {
    const today = this.state.todayISODate;
    const last = this.state.lastActiveDate;

    if (!last) {
      // First time launch or freshly reset
      return;
    }

    const diff = this.calendarDayDiff(last, today);

    if (diff === 0) {
      // Already opened today
      // Current day and streak intact
    } else if (diff === 1) {
      // Consecutive next day!
      // If previous day's message was opened, progress to next day if not already progressed
      if (this.state.openedDays.has(this.state.currentDay)) {
        this.saveCurrentDay(this.state.currentDay + 1);
      }
    } else if (diff > 1) {
      // Missed 1 or more calendar days: streak breaks!
      if (this.state.streak > 0) {
        this.saveLostStreak(this.state.streak);
        this.saveStreak(0);
      }
      if (this.state.openedDays.has(this.state.currentDay)) {
        this.saveCurrentDay(this.state.currentDay + 1);
      }
    }
  }

  isTodayMessageOpened() {
    return this.state.openedDays.has(this.state.currentDay) &&
           this.state.lastActiveDate === this.state.todayISODate;
  }

  restoreStreak() {
    if (this.state.freezeCount <= 0) {
      this.showToast("عفواً، لقد استنفدت محاولات التجميد لهذا الشهر.");
      return;
    }

    if (this.state.lostStreak <= 0) {
      this.showToast("لا يوجد ستريك مفقود لاستعادته حالياً.");
      return;
    }

    const restored = this.state.lostStreak;
    this.saveStreak(restored);
    this.saveLostStreak(0);
    this.saveFreezeCount(this.state.freezeCount - 1);

    this.renderHeader();
    this.renderStreakModal();
    this.showToast(`تمت استعادة الستريك بنجاح (${restored} أيام)! ❄️🔥`);
  }

  // ==========================================
  // COUNTDOWN TIMER
  // ==========================================
  startCountdownTimer() {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
      const diffMs = tomorrow.getTime() - now.getTime();

      if (diffMs <= 1000) {
        // Midnight transition
        this.state.todayISODate = this.getTodayISODate();
        this.evaluateStreakAndDayTransition();
        this.renderStatusPanel();
        this.updateJarStatus();
        this.renderHeader();
      }

      const totalSec = Math.max(0, Math.floor(diffMs / 1000));
      const hours = String(Math.floor(totalSec / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
      const seconds = String(totalSec % 60).padStart(2, '0');

      if (this.dom.countdownTimer) {
        this.dom.countdownTimer.textContent = `${hours}:${minutes}:${seconds}`;
      }
    };

    updateTimer();
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(updateTimer, 1000);
  }

  // ==========================================
  // DOM CACHING
  // ==========================================
  cacheDOM() {
    this.dom = {
      // Nav & Header
      navHome: document.getElementById('navHome'),
      navMessages: document.getElementById('navMessages'),
      navFavorites: document.getElementById('navFavorites'),
      navStreakBadge: document.getElementById('navStreakBadge'),
      navProfileBtn: document.getElementById('navProfileBtn'),
      navbarAvatarContainer: document.getElementById('navbarAvatarContainer'),
      mobileMenuToggle: document.getElementById('mobileMenuToggle'),
      mobileNavMenu: document.getElementById('mobileNavMenu'),
      streakNumberTop: document.getElementById('streakNumberTop'),

      // Hero & Scene
      sceneContainer: document.getElementById('sceneContainer'),
      jarHitArea: document.getElementById('jarHitArea'),
      jarTooltip: document.getElementById('jarTooltip'),

      // Bottom Status Panel
      statusPanel: document.getElementById('statusPanel'),
      panelDayNumber: document.getElementById('panelDayNumber'),
      panelDaySubtitle: document.getElementById('panelDaySubtitle'),
      countdownTimer: document.getElementById('countdownTimer'),
      panelStatusPill: document.getElementById('panelStatusPill'),
      panelStatusStateText: document.getElementById('panelStatusStateText'),

      // Message Opened Dialog
      messageModal: document.getElementById('messageModal'),
      modalCloseBtn: document.getElementById('modalCloseBtn'),
      modalBackBtn: document.getElementById('modalBackBtn'),
      modalFavoriteBtn: document.getElementById('modalFavoriteBtn'),
      modalDayNumber: document.getElementById('modalDayNumber'),
      modalDayTitle: document.getElementById('modalDayTitle'),
      modalArabicText: document.getElementById('modalArabicText'),
      modalVerseSection: document.getElementById('modalVerseSection'),
      modalVerseArabic: document.getElementById('modalVerseArabic'),
      modalVerseSurah: document.getElementById('modalVerseSurah'),
      modalVerseExplanation: document.getElementById('modalVerseExplanation'),
      modalSignoff: document.getElementById('modalSignoff'),

      // Consolidated Messages Modal
      messagesModal: document.getElementById('messagesModal'),
      tabBtnArchive: document.getElementById('tabBtnArchive'),
      tabBtnFavorites: document.getElementById('tabBtnFavorites'),
      tabContentArchive: document.getElementById('tabContentArchive'),
      tabContentFavorites: document.getElementById('tabContentFavorites'),
      teaserCardContainer: document.getElementById('teaserCardContainer'),
      messagesListContainer: document.getElementById('messagesListContainer'),
      favoritesGrid: document.getElementById('favoritesGrid'),

      // Streak Modal
      streakModal: document.getElementById('streakModal'),
      streakModalCount: document.getElementById('streakModalCount'),
      freezeBadge: document.getElementById('freezeBadge'),
      freezeCountDisplay: document.getElementById('freezeCountDisplay'),
      restoreStreakContainer: document.getElementById('restoreStreakContainer'),
      restoreAlertText: document.getElementById('restoreAlertText'),
      restoreStreakBtn: document.getElementById('restoreStreakBtn'),
      streakProgressFill: document.getElementById('streakProgressFill'),
      streakProgressText: document.getElementById('streakProgressText'),

      // Profile & Avatar Modal
      profileModal: document.getElementById('profileModal'),
      avatarPreviewBox: document.getElementById('avatarPreviewBox'),
      avatarFileInput: document.getElementById('avatarFileInput'),
      triggerAvatarUploadBtn: document.getElementById('triggerAvatarUploadBtn'),
      removeAvatarBtn: document.getElementById('removeAvatarBtn'),
      profileJourneyInfo: document.getElementById('profileJourneyInfo'),
      profileResetBtn: document.getElementById('profileResetBtn'),

      // Toast Notification
      toast: document.getElementById('toastNotification')
    };
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================
  bindEvents() {
    // Brand Logo click
    const brandLink = document.getElementById('brandHomeLink');
    if (brandLink) {
      brandLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeAllModals();
        this.setActiveNav(this.dom.navHome);
      });
    }

    // Jar Hit Area
    if (this.dom.jarHitArea) {
      this.dom.jarHitArea.addEventListener('click', () => {
        this.openMessageForDay(this.state.currentDay);
      });

      this.dom.jarHitArea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openMessageForDay(this.state.currentDay);
        }
      });
    }

    // Status Panel Tag Click
    if (this.dom.panelStatusPill) {
      this.dom.panelStatusPill.addEventListener('click', () => {
        this.openMessageForDay(this.state.currentDay);
      });
    }

    // Navigation Controls
    if (this.dom.navHome) {
      this.dom.navHome.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeAllModals();
        this.setActiveNav(this.dom.navHome);
      });
    }

    if (this.dom.navMessages) {
      this.dom.navMessages.addEventListener('click', (e) => {
        e.preventDefault();
        this.openMessagesModal('archive');
        this.setActiveNav(this.dom.navMessages);
      });
    }

    if (this.dom.navFavorites) {
      this.dom.navFavorites.addEventListener('click', (e) => {
        e.preventDefault();
        this.openMessagesModal('favorites');
        this.setActiveNav(this.dom.navFavorites);
      });
    }

    if (this.dom.navStreakBadge) {
      this.dom.navStreakBadge.addEventListener('click', () => {
        this.openStreakModal();
      });
    }

    if (this.dom.navProfileBtn) {
      this.dom.navProfileBtn.addEventListener('click', () => {
        this.openProfileModal();
      });
    }

    // Mobile Menu Toggle
    if (this.dom.mobileMenuToggle) {
      this.dom.mobileMenuToggle.addEventListener('click', () => {
        this.toggleMobileNav();
      });
    }

    // Modal Close Buttons
    if (this.dom.modalCloseBtn) {
      this.dom.modalCloseBtn.addEventListener('click', () => this.closeMessageModal());
    }
    if (this.dom.modalBackBtn) {
      this.dom.modalBackBtn.addEventListener('click', () => this.closeMessageModal());
    }

    // Modal Favorite Toggle
    if (this.dom.modalFavoriteBtn) {
      this.dom.modalFavoriteBtn.addEventListener('click', () => {
        this.toggleFavorite(this.state.selectedMessageDay);
      });
    }

    // Generic Close Buttons for secondary modals
    document.querySelectorAll('.modal-close-generic').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });

    // Backdrop clicks to close
    document.querySelectorAll('.app-modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeAllModals();
        }
      });
    });

    // Global Escape Key Listener
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    // Consolidated Modal Tab Switching
    if (this.dom.tabBtnArchive && this.dom.tabBtnFavorites) {
      this.dom.tabBtnArchive.addEventListener('click', () => {
        this.switchMessagesTab('archive');
      });
      this.dom.tabBtnFavorites.addEventListener('click', () => {
        this.switchMessagesTab('favorites');
      });
    }

    // Streak Restore Button
    if (this.dom.restoreStreakBtn) {
      this.dom.restoreStreakBtn.addEventListener('click', () => {
        this.restoreStreak();
      });
    }

    // Avatar Upload Events
    if (this.dom.triggerAvatarUploadBtn && this.dom.avatarFileInput) {
      this.dom.triggerAvatarUploadBtn.addEventListener('click', () => {
        this.dom.avatarFileInput.click();
      });

      this.dom.avatarFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          if (!file.type.startsWith('image/')) {
            this.showToast('يرجى اختيار ملف صورة صالح.');
            return;
          }
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target.result;
            this.state.userAvatar = dataUrl;
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_AVATAR, dataUrl);
            this.renderAvatar();
            this.showToast('تم تحديث الصورة الشخصية بنجاح! 📷');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (this.dom.removeAvatarBtn) {
      this.dom.removeAvatarBtn.addEventListener('click', () => {
        this.state.userAvatar = null;
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_AVATAR);
        if (this.dom.avatarFileInput) this.dom.avatarFileInput.value = '';
        this.renderAvatar();
        this.showToast('تمت إزالة الصورة الشخصية.');
      });
    }

    // Reset Local Progress
    if (this.dom.profileResetBtn) {
      this.dom.profileResetBtn.addEventListener('click', () => {
        if (confirm("هل أنت متأكد من إعادة ضبط الرحلة بالكامل؟ سيتم مسح السجل والعودة لليوم 1 وإعادة خلط الرسائل عشوائياً.")) {
          this.resetProgress();
        }
      });
    }
  }

  // ==========================================
  // RESET LOGIC
  // ==========================================
  resetProgress() {
    shuffleMessages(); // Fresh random permutation of all 365 messages
    this.state.openedDays.clear();
    this.state.favorites.clear();
    this.state.lastActiveDate = null;
    this.saveCurrentDay(1);
    this.saveStreak(0);
    this.saveLostStreak(0);
    this.saveFreezeCount(CONFIG.MAX_FREEZES_PER_MONTH);
    this.saveOpenedDays();
    this.saveFavorites();
    localStorage.removeItem(CONFIG.STORAGE_KEYS.LAST_ACTIVE_DATE);

    this.renderHeader();
    this.renderStatusPanel();
    this.updateJarStatus();
    this.closeAllModals();
    this.showToast("تمت إعادة ضبط الرحلة وإعادة خلط الـ 365 رسالة بنجاح! 🔄");
  }

  // ==========================================
  // AVATAR RENDERING
  // ==========================================
  renderAvatar() {
    const avatar = this.state.userAvatar;

    // Header avatar
    if (this.dom.navbarAvatarContainer) {
      if (avatar) {
        this.dom.navbarAvatarContainer.innerHTML = `
          <img src="${avatar}" alt="User Avatar" class="nav-avatar-img">
        `;
      } else {
        this.dom.navbarAvatarContainer.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="default-avatar-svg">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        `;
      }
    }

    // Profile settings preview
    if (this.dom.avatarPreviewBox) {
      if (avatar) {
        this.dom.avatarPreviewBox.innerHTML = `
          <img src="${avatar}" alt="Preview" class="avatar-preview-img">
        `;
        if (this.dom.removeAvatarBtn) this.dom.removeAvatarBtn.style.display = 'inline-block';
      } else {
        this.dom.avatarPreviewBox.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="preview-default-svg">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        `;
        if (this.dom.removeAvatarBtn) this.dom.removeAvatarBtn.style.display = 'none';
      }
    }
  }

  // ==========================================
  // UI RENDERING
  // ==========================================
  renderHeader() {
    if (this.dom.streakNumberTop) {
      this.dom.streakNumberTop.textContent = `${this.state.streak} أيام`;
    }
  }

  renderStatusPanel() {
    const isOpened = this.isTodayMessageOpened();

    if (this.dom.panelDayNumber) {
      this.dom.panelDayNumber.textContent = `اليوم ${this.state.currentDay} من ${CONFIG.TOTAL_DAYS}`;
    }

    if (this.dom.panelDaySubtitle) {
      this.dom.panelDaySubtitle.textContent = isOpened
        ? "تمت قراءة رسالة اليوم بنجاح ✨"
        : "رسالة اليوم في انتظارك ✨";
    }

    if (this.dom.panelStatusStateText) {
      this.dom.panelStatusStateText.textContent = isOpened
        ? "تم فتح رسالة اليوم ✨"
        : "لم تُفتح بعد ✨";
    }

    if (this.dom.panelStatusPill) {
      if (isOpened) {
        this.dom.panelStatusPill.classList.remove('pending');
        this.dom.panelStatusPill.classList.add('opened');
      } else {
        this.dom.panelStatusPill.classList.remove('opened');
        this.dom.panelStatusPill.classList.add('pending');
      }
    }
  }

  updateJarStatus() {
    const isOpened = this.isTodayMessageOpened();
    if (this.dom.jarTooltip) {
      this.dom.jarTooltip.textContent = isOpened
        ? "إعادة قراءة رسالة اليوم ♡"
        : "اضغط لفتح رسالة اليوم ✨";
    }
  }

  setActiveNav(activeBtn) {
    [this.dom.navHome, this.dom.navMessages, this.dom.navFavorites].forEach(btn => {
      if (btn) btn.classList.remove('active');
    });
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
  }

  toggleMobileNav() {
    if (this.dom.mobileNavMenu) {
      const isVisible = this.dom.mobileNavMenu.classList.toggle('open');
      this.dom.mobileMenuToggle.setAttribute('aria-expanded', isVisible);
    }
  }

  // ==========================================
  // MESSAGE OPENED DIALOG
  // ==========================================
  openMessageForDay(dayNumber) {
    const day = Math.max(1, Math.min(CONFIG.TOTAL_DAYS, parseInt(dayNumber, 10) || 1));
    this.state.selectedMessageDay = day;

    // Retrieve message data from shuffled pool
    const msg = getMessageForDay(day);

    // Populate Dialog Content
    this.dom.modalDayNumber.textContent = `اليوم ${day} من ${CONFIG.TOTAL_DAYS}`;
    this.dom.modalDayTitle.textContent = msg.title || "رسالة لقلبك النهاردة...";
    this.dom.modalArabicText.textContent = msg.text;

    // Quranic Verse handling
    if (msg.verseArabic) {
      this.dom.modalVerseSection.style.display = 'block';
      this.dom.modalVerseArabic.textContent = msg.verseArabic;
      this.dom.modalVerseSurah.textContent = `(${msg.verseSurah})`;
      if (msg.verseExplanation) {
        this.dom.modalVerseExplanation.style.display = 'block';
        this.dom.modalVerseExplanation.textContent = msg.verseExplanation;
      } else {
        this.dom.modalVerseExplanation.style.display = 'none';
      }
    } else {
      this.dom.modalVerseSection.style.display = 'none';
    }

    this.dom.modalSignoff.textContent = msg.signoff || "دايماً معاك وفي ضهرك ❤️";

    // Update Favorite Icon State
    this.updateModalFavoriteButton(day);

    // If opening today's message: update attendance & streak strictly
    const today = this.state.todayISODate;
    if (day === this.state.currentDay && this.state.lastActiveDate !== today) {
      const diff = this.calendarDayDiff(this.state.lastActiveDate, today);
      if (diff === 1 || !this.state.lastActiveDate) {
        this.saveStreak(this.state.streak + 1);
      } else if (diff > 1) {
        this.saveStreak(1);
      }
      this.state.lastActiveDate = today;
      localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_ACTIVE_DATE, today);
    }

    // Mark as opened
    if (!this.state.openedDays.has(day)) {
      this.state.openedDays.add(day);
      this.saveOpenedDays();
    }

    this.renderHeader();
    this.renderStatusPanel();
    this.updateJarStatus();

    // Open Modal with accessible attributes
    this.closeAllModals(false);
    this.dom.messageModal.classList.add('active');
    this.dom.messageModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    this.state.activeModal = this.dom.messageModal;
  }

  closeMessageModal() {
    this.dom.messageModal.classList.remove('active');
    this.dom.messageModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    this.state.activeModal = null;
    this.setActiveNav(this.dom.navHome);
    this.dom.jarHitArea.focus();
  }

  toggleFavorite(day) {
    if (!day) return;
    if (this.state.favorites.has(day)) {
      this.state.favorites.delete(day);
      this.showToast(`تم حذف رسالة اليوم ${day} من المفضلة.`);
    } else {
      this.state.favorites.add(day);
      this.showToast(`تم حفظ رسالة اليوم ${day} في المفضلة! ❤️`);
    }
    this.saveFavorites();
    this.updateModalFavoriteButton(day);
    if (this.state.activeTab === 'favorites') {
      this.renderFavoritesGrid();
    }
  }

  updateModalFavoriteButton(day) {
    const isFav = this.state.favorites.has(day);
    if (isFav) {
      this.dom.modalFavoriteBtn.classList.add('favorited');
      this.dom.modalFavoriteBtn.setAttribute('aria-label', 'إزالة من المفضلة');
      this.dom.modalFavoriteBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="#E63946" stroke="#E63946" width="22" height="22">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      `;
    } else {
      this.dom.modalFavoriteBtn.classList.remove('favorited');
      this.dom.modalFavoriteBtn.setAttribute('aria-label', 'إضافة إلى المفضلة');
      this.dom.modalFavoriteBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="#66584E" stroke-width="2" width="22" height="22">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      `;
    }
  }

  // ==========================================
  // CONSOLIDATED JOURNEY MESSAGES & FAVORITES MODAL
  // ==========================================
  closeAllModals(resetNav = true) {
    document.querySelectorAll('.app-modal').forEach(modal => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    });
    document.body.classList.remove('modal-open');
    this.state.activeModal = null;
    if (resetNav) {
      this.setActiveNav(this.dom.navHome);
    }
    if (this.dom.mobileNavMenu) {
      this.dom.mobileNavMenu.classList.remove('open');
    }
  }

  openMessagesModal(initialTab = 'archive') {
    this.closeAllModals(false);
    this.switchMessagesTab(initialTab);
    this.dom.messagesModal.classList.add('active');
    this.dom.messagesModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    this.state.activeModal = this.dom.messagesModal;
  }

  switchMessagesTab(tabName) {
    this.state.activeTab = tabName;
    if (tabName === 'archive') {
      this.dom.tabBtnArchive.classList.add('active');
      this.dom.tabBtnArchive.setAttribute('aria-selected', 'true');
      this.dom.tabBtnFavorites.classList.remove('active');
      this.dom.tabBtnFavorites.setAttribute('aria-selected', 'false');
      this.dom.tabContentArchive.classList.add('active');
      this.dom.tabContentFavorites.classList.remove('active');
      this.renderTeaserCard();
      this.renderOpenedArchive();
    } else {
      this.dom.tabBtnFavorites.classList.add('active');
      this.dom.tabBtnFavorites.setAttribute('aria-selected', 'true');
      this.dom.tabBtnArchive.classList.remove('active');
      this.dom.tabBtnArchive.setAttribute('aria-selected', 'false');
      this.dom.tabContentFavorites.classList.add('active');
      this.dom.tabContentArchive.classList.remove('active');
      this.renderFavoritesGrid();
    }
  }

  // Teaser Card Rendering (Upcoming Day - Blurred & Locked)
  renderTeaserCard() {
    const container = this.dom.teaserCardContainer;
    const nextDay = this.state.currentDay + 1;

    if (nextDay > CONFIG.TOTAL_DAYS) {
      container.innerHTML = `
        <div class="teaser-card">
          <p style="text-align: center; color: var(--color-cream); font-weight: 700;">
            🎉 مبروك! لقد وصلت إلى نهاية رحلة الـ 365 يوماً من الحب!
          </p>
        </div>
      `;
      return;
    }

    const nextMsg = getMessageForDay(nextDay);
    const teaserSnippet = nextMsg.text.length > 140
      ? nextMsg.text.substring(0, 140) + '...'
      : nextMsg.text;

    container.innerHTML = `
      <div class="teaser-card">
        <div class="teaser-header">
          <span class="teaser-badge">🔒 رسالة الغد (اليوم ${nextDay})</span>
          <span class="teaser-subtitle">تشويق &bull; ${nextMsg.category}</span>
        </div>
        <p class="teaser-blurred-body" aria-hidden="true">
          ${teaserSnippet}
        </p>
        <div style="text-align: center;">
          <span class="teaser-unlock-note">
            🌙 تفتح تلقائياً عند حلول اليوم الجديد
          </span>
        </div>
      </div>
    `;
  }

  renderOpenedArchive() {
    const container = this.dom.messagesListContainer;
    container.innerHTML = '';

    const opened = Array.from(this.state.openedDays).sort((a, b) => b - a);

    if (opened.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-heart-icon">✉️</div>
          <p class="empty-title">لم تفتح أي رسالة بعد</p>
          <p class="empty-subtitle">اضغط على البرطمان في الصفحة الرئيسية لفتح رسالة اليوم وحفظها في أرشيفك الدائم.</p>
        </div>
      `;
      return;
    }

    opened.forEach(day => {
      const msg = getMessageForDay(day);
      const isFav = this.state.favorites.has(day);
      const isCurrent = day === this.state.currentDay;

      const card = document.createElement('div');
      card.className = `message-item-card ${isCurrent ? 'current' : ''}`;
      card.innerHTML = `
        <div class="message-item-header">
          <span class="day-badge">اليوم ${day}</span>
          <span class="category-badge">${msg.category}</span>
          ${isFav ? '<span class="fav-badge">❤️</span>' : ''}
          ${isCurrent ? '<span class="lock-icon" style="color: var(--color-orange);">✨ رسالة اليوم</span>' : ''}
        </div>
        <p class="message-item-preview">${msg.text.substring(0, 95)}...</p>
        ${msg.verseArabic ? '<div class="fav-verse-pill" style="margin-top: 4px;">📖 ' + msg.verseArabic + '</div>' : ''}
        <button class="open-single-msg-btn">اقرأ الرسالة كاملة ♡</button>
      `;

      card.querySelector('.open-single-msg-btn').addEventListener('click', () => {
        this.openMessageForDay(day);
      });

      container.appendChild(card);
    });
  }

  renderFavoritesGrid() {
    const grid = this.dom.favoritesGrid;
    grid.innerHTML = '';

    const favDays = Array.from(this.state.favorites).sort((a, b) => a - b);

    if (favDays.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-heart-icon">♡</div>
          <p class="empty-title">لا توجد رسائل مفضلة حتى الآن</p>
          <p class="empty-subtitle">اضغط على علامة القلب بأعلى أي رسالة لحفظها هنا والرجوع إليها في أي وقت.</p>
        </div>
      `;
      return;
    }

    favDays.forEach(day => {
      const msg = getMessageForDay(day);
      const card = document.createElement('div');
      card.className = 'favorite-card';
      card.innerHTML = `
        <div class="fav-card-top">
          <span class="fav-day">اليوم ${day} &bull; ${msg.category}</span>
          <button class="fav-remove-btn" title="إزالة من المفضلة">✕</button>
        </div>
        <p class="fav-text">"${msg.text.substring(0, 110)}..."</p>
        ${msg.verseArabic ? `<div class="fav-verse-pill">${msg.verseArabic}</div>` : ''}
        <button class="fav-open-btn">عرض البطاقة كاملة</button>
      `;

      card.querySelector('.fav-open-btn').addEventListener('click', () => {
        this.openMessageForDay(day);
      });

      card.querySelector('.fav-remove-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFavorite(day);
      });

      grid.appendChild(card);
    });
  }

  // ==========================================
  // STREAK & FREEZE MODAL
  // ==========================================
  openStreakModal() {
    this.closeAllModals(false);
    this.renderStreakModal();
    this.dom.streakModal.classList.add('active');
    this.dom.streakModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    this.state.activeModal = this.dom.streakModal;
  }

  renderStreakModal() {
    if (this.dom.streakModalCount) {
      this.dom.streakModalCount.textContent = this.state.streak;
    }

    if (this.dom.freezeCountDisplay) {
      this.dom.freezeCountDisplay.textContent = this.state.freezeCount;
    }

    // Restore Streak Button visibility
    if (this.dom.restoreStreakContainer) {
      if (this.state.lostStreak > 0 && this.state.freezeCount > 0) {
        this.dom.restoreStreakContainer.style.display = 'block';
        if (this.dom.restoreAlertText) {
          this.dom.restoreAlertText.textContent = `انقطع الستريك السابق (${this.state.lostStreak} أيام)! يمكنك استعادته الآن بتكلفة محاولة تجميد واحدة.`;
        }
      } else {
        this.dom.restoreStreakContainer.style.display = 'none';
      }
    }

    // Journey completion progress
    const openedCount = this.state.openedDays.size;
    const percent = Math.min(100, Math.round((openedCount / CONFIG.TOTAL_DAYS) * 100));
    if (this.dom.streakProgressFill) {
      this.dom.streakProgressFill.style.width = `${Math.max(1, percent)}%`;
    }
    if (this.dom.streakProgressText) {
      this.dom.streakProgressText.textContent = `تم فتح ${openedCount} من أصل 365 رسالة (${percent}% مكتمل)`;
    }
  }

  // ==========================================
  // PROFILE MODAL
  // ==========================================
  openProfileModal() {
    this.closeAllModals(false);
    this.renderAvatar();
    if (this.dom.profileJourneyInfo) {
      this.dom.profileJourneyInfo.textContent = `أنت الآن في اليوم ${this.state.currentDay} من أصل 365 يوماً. تم فتح ${this.state.openedDays.size} رسالة حتى الآن.`;
    }
    this.dom.profileModal.classList.add('active');
    this.dom.profileModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    this.state.activeModal = this.dom.profileModal;
  }

  showToast(message) {
    if (!this.dom.toast) return;
    this.dom.toast.textContent = message;
    this.dom.toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.dom.toast.classList.remove('show');
    }, 2800);
  }

  // ==========================================
  // RESPONSIVE HIT-AREA POSITIONING SYNC
  // ==========================================
  setupPositioningSync() {
    const updateJarHitBox = () => {
      const container = this.dom.sceneContainer;
      if (!container || !this.dom.jarHitArea) return;

      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        // Mobile background is 680 x 941 (cropped portrait)
        const imgW = 680;
        const imgH = 941;
        const containerAspect = cw / ch;
        const imgAspect = imgW / imgH;

        let renderedW, renderedH, offsetX, offsetY;

        if (containerAspect > imgAspect) {
          renderedW = cw;
          renderedH = cw / imgAspect;
          offsetX = 0;
          offsetY = (ch - renderedH) / 2;
        } else {
          renderedH = ch;
          renderedW = ch * imgAspect;
          offsetX = (cw - renderedW) / 2;
          offsetY = (ch - renderedH) / 2;
        }

        // Jar coordinates inside 680x941 mobile artwork:
        // Jar was at X: 630..1050 (W: 420) in 1672px image.
        // Crop left offset was 496px.
        // So jar X in cropped image = 630 - 496 = 134px.
        const jarNormX = 134 / 680;
        const jarNormY = 345 / 941;
        const rawJarW = (420 / 680) * renderedW;
        const rawJarH = (470 / 941) * renderedH;

        // Constraint to max-width: 65% and max-height: 38vh so it never overpowers characters
        const maxAllowedW = cw * 0.65;
        const maxAllowedH = ch * 0.38;
        const hitW = Math.min(rawJarW, maxAllowedW);
        const hitH = Math.min(rawJarH, maxAllowedH);

        // Center horizontally
        const hitX = (cw - hitW) / 2;
        // Position vertically to align with jar body
        const rawHitY = offsetY + (jarNormY * renderedH);
        const hitY = Math.max(rawHitY, ch * 0.36);

        this.dom.jarHitArea.style.left = `${Math.round(hitX)}px`;
        this.dom.jarHitArea.style.top = `${Math.round(hitY)}px`;
        this.dom.jarHitArea.style.width = `${Math.round(hitW)}px`;
        this.dom.jarHitArea.style.height = `${Math.round(hitH)}px`;
        return;
      }

      // Desktop background is 1672 x 941
      const containerAspect = cw / ch;
      const imgAspect = 1672 / 941;

      let renderedW, renderedH, offsetX, offsetY;

      if (containerAspect > imgAspect) {
        renderedW = cw;
        renderedH = cw / imgAspect;
        offsetX = 0;
        offsetY = ch - renderedH;
      } else {
        renderedH = ch;
        renderedW = ch * imgAspect;
        offsetX = (cw - renderedW) / 2;
        offsetY = 0;
      }

      const jarNormX = 630 / 1672;
      const jarNormY = 345 / 941;
      const jarNormW = 420 / 1672;
      const jarNormH = 470 / 941;

      const hitX = offsetX + (jarNormX * renderedW);
      const hitY = offsetY + (jarNormY * renderedH);
      const hitW = jarNormW * renderedW;
      const hitH = jarNormH * renderedH;

      this.dom.jarHitArea.style.left = `${Math.round(hitX)}px`;
      this.dom.jarHitArea.style.top = `${Math.round(hitY)}px`;
      this.dom.jarHitArea.style.width = `${Math.round(hitW)}px`;
      this.dom.jarHitArea.style.height = `${Math.round(hitH)}px`;
    };

    window.addEventListener('resize', updateJarHitBox);
    window.addEventListener('orientationchange', updateJarHitBox);
    requestAnimationFrame(updateJarHitBox);
  }

  handleInitialURLParams() {
    const params = new URLSearchParams(window.location.search);
    const openDay = params.get('openDay');
    const view = params.get('view');

    if (openDay) {
      this.openMessageForDay(parseInt(openDay, 10));
    } else if (view) {
      switch (view) {
        case 'messages':
        case 'archive':
          this.openMessagesModal('archive');
          this.setActiveNav(this.dom.navMessages);
          break;
        case 'favorites':
          this.openMessagesModal('favorites');
          this.setActiveNav(this.dom.navFavorites);
          break;
        case 'streak':
          this.openStreakModal();
          break;
        case 'profile':
          this.openProfileModal();
          break;
      }
    }
  }
}

export { LoveApp };

// Start application when DOM is ready
function initLoveApp() {
  if (!window.loveApp) {
    window.loveApp = new LoveApp();
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoveApp);
  } else {
    initLoveApp();
  }
}
