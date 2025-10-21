// ============================================================================
// COOKIE CONSENT & ANALYTICS MANAGEMENT
// ============================================================================

class CookieConsentManager {
	constructor() {
		this.consentKey = 'cookieConsent';
		this.analyticsLoaded = false;
		this.ahrefsLoaded = false;
		this.init();
	}

	init() {
		this.loadConsentState();
		this.setupEventListeners();
		this.loadAnalyticsIfConsented();
	}

	loadConsentState() {
		const consent = localStorage.getItem(this.consentKey);
		const banner = document.getElementById('cookie-banner');

		if (!banner) return;

		if (!consent) {
			// Show banner after 2 seconds
			setTimeout(() => this.showBanner(), 2000);
		} else if (consent === 'accepted') {
			banner.style.display = 'none';
		} else if (consent === 'declined') {
			this.minimizeBanner();
		}
	}

	showBanner() {
		const banner = document.getElementById('cookie-banner');
		if (banner) {
			banner.classList.add('show');
			// Focus on accept button for accessibility
			const acceptBtn = document.getElementById('cookie-accept');
			if (acceptBtn) acceptBtn.focus();
		}
	}

	minimizeBanner() {
		const banner = document.getElementById('cookie-banner');
		if (!banner) return;

		banner.classList.remove('show');
		banner.classList.add('minimized');
		const container = banner.querySelector('.cookie-banner__container');
		if (container) {
			container.style.opacity = '0';
			container.style.maxHeight = '0';
		}
	}

	expandBanner() {
		const banner = document.getElementById('cookie-banner');
		if (!banner) return;

		const container = banner.querySelector('.cookie-banner__container');
		banner.classList.remove('minimized');
		banner.classList.add('expanding');

		setTimeout(() => {
			banner.classList.add('show');
			if (container) {
				// Stabilize height during transition
				container.style.maxHeight = container.scrollHeight + 'px';
				container.style.opacity = '1';
			}
		}, 20);

		setTimeout(() => {
			banner.classList.remove('expanding');
			// After transition ends, remove maxHeight lock to allow natural layout
			if (container) container.style.maxHeight = 'none';
		}, 450);
	}

	setupEventListeners() {
		const banner = document.getElementById('cookie-banner');
		const isActivateKey = (e) => e.key === 'Enter' || e.key === ' ';
		const acceptBtn = document.getElementById('cookie-accept');
		const declineBtn = document.getElementById('cookie-decline');
		const settingsLink = document.getElementById('cookie-settings-link');
		const minimizedIcon = banner?.querySelector(
			'.cookie-banner__minimized-icon'
		);

		if (acceptBtn) {
			acceptBtn.addEventListener('click', () => this.acceptCookies());
		}

		if (declineBtn) {
			declineBtn.addEventListener('click', () => this.declineCookies());
		}

		if (settingsLink) {
			settingsLink.addEventListener('click', (e) => {
				e.preventDefault();
				// Reset banner state and show it
				const banner = document.getElementById('cookie-banner');
				if (banner) {
					banner.style.display = '';
					banner.classList.remove('minimized');
					const container = banner.querySelector('.cookie-banner__container');
					if (container) {
						container.style.maxHeight = '';
						container.style.opacity = '1';
					}
					this.showBanner();
				}
			});
			settingsLink.addEventListener('keydown', (e) => {
				if (isActivateKey(e)) {
					e.preventDefault();
					// Reset banner state and show it
					const banner = document.getElementById('cookie-banner');
					if (banner) {
						banner.style.display = '';
						banner.classList.remove('minimized');
						const container = banner.querySelector('.cookie-banner__container');
						if (container) {
							container.style.maxHeight = '';
							container.style.opacity = '1';
						}
						this.showBanner();
					}
				}
			});
		}

		if (banner) {
			banner.addEventListener('click', (e) => {
				if (e.target === acceptBtn || e.target === declineBtn) return;
				if (banner.classList.contains('minimized')) {
					this.expandBanner();
				}
			});
		}

		if (minimizedIcon) {
			minimizedIcon.addEventListener('click', () => this.expandBanner());
			minimizedIcon.addEventListener('keydown', (e) => {
				if (isActivateKey(e)) {
					e.preventDefault();
					this.expandBanner();
				}
			});
		}
	}

	acceptCookies() {
		localStorage.setItem(this.consentKey, 'accepted');
		const banner = document.getElementById('cookie-banner');
		if (banner) {
			banner.classList.remove('show');
			banner.style.display = 'none';
		}
		this.loadAnalytics();
		this.updateGtagConsent('granted');
	}

	declineCookies() {
		localStorage.setItem(this.consentKey, 'declined');
		this.minimizeBanner();
		this.disableAnalytics();
		this.updateGtagConsent('denied');
	}

	loadAnalytics() {
		if (this.analyticsLoaded) return;

		// Load Google Analytics
		this.loadGoogleAnalytics();

		// Load Ahrefs Analytics
		this.loadAhrefsAnalytics();

		this.analyticsLoaded = true;
	}

	loadGoogleAnalytics() {
		// Load GA script
		const script = document.createElement('script');
		script.async = true;
		script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YYE4H0PHYY';
		document.head.appendChild(script);

		// Initialize GA
		script.onload = () => {
			if (typeof gtag !== 'undefined') {
				gtag('js', new Date());
				gtag('config', 'G-YYE4H0PHYY');
			}
		};
	}

	loadAhrefsAnalytics() {
		const script = document.createElement('script');
		script.async = true;
		script.src = 'https://analytics.ahrefs.com/analytics.js';
		script.setAttribute('data-key', 'flKbnmCKyZQK+Qsr+U37qQ');
		document.head.appendChild(script);
		this.ahrefsLoaded = true;
	}

	disableAnalytics() {
		// Disable GA tracking
		if (typeof gtag !== 'undefined') {
			gtag('consent', 'update', {
				analytics_storage: 'denied',
				ad_storage: 'denied',
			});
		}

		// Remove analytics cookies
		this.removeAnalyticsCookies();
	}

	removeAnalyticsCookies() {
		const cookies = [
			'_ga',
			'_gid',
			'_gat',
			'_gcl_au',
			'_fbp',
			'_uetsid',
			'_uetvid',
		];
		const past = 'Thu, 01 Jan 1970 00:00:00 GMT';

		cookies.forEach((cookie) => {
			document.cookie = `${cookie}=; expires=${past}; path=/; domain=.${window.location.hostname}`;
			document.cookie = `${cookie}=; expires=${past}; path=/`;
		});
	}

	updateGtagConsent(status) {
		if (typeof gtag !== 'undefined') {
			gtag('consent', 'update', {
				analytics_storage: status,
				ad_storage: status,
			});
		}
	}

	loadAnalyticsIfConsented() {
		const consent = localStorage.getItem(this.consentKey);
		if (consent === 'accepted') {
			this.loadAnalytics();
		}
	}

	// Public method to clear consent (for testing)
	clearConsent() {
		localStorage.removeItem(this.consentKey);
		this.disableAnalytics();
		this.removeAnalyticsCookies();

		const banner = document.getElementById('cookie-banner');
		if (banner) {
			banner.style.display = '';
			banner.classList.remove('minimized');
			const container = banner.querySelector('.cookie-banner__container');
			if (container) {
				container.style.maxHeight = '';
				container.style.opacity = '1';
			}
			setTimeout(() => this.showBanner(), 10);
		}
	}
}

// ============================================================================
// POPUP & MODAL MANAGEMENT
// ============================================================================

class PopupManager {
	constructor() {
		this.lastFocusedElement = null;
		this.init();
	}

	init() {
		this.setupEventListeners();
	}

	setupEventListeners() {
		const isActivateKey = (e) => e.key === 'Enter' || e.key === ' ';
		// About popup
		const aboutLink = document.querySelector('.header__link[href="#about"]');
		const aboutFooterLink = document.querySelector(
			'.footer__link[href="#about"]'
		);
		const popup = document.getElementById('popup');
		const popupClose = document.getElementById('popup-close');

		if (aboutLink && popup) {
			aboutLink.addEventListener('click', (e) => {
				e.preventDefault();
				this.openPopup(popup);
			});
			aboutLink.addEventListener('keydown', (e) => {
				if (isActivateKey(e)) {
					e.preventDefault();
					this.openPopup(popup);
				}
			});
		}

		if (aboutFooterLink && popup) {
			aboutFooterLink.addEventListener('click', (e) => {
				e.preventDefault();
				this.openPopup(popup);
			});
			aboutFooterLink.addEventListener('keydown', (e) => {
				if (isActivateKey(e)) {
					e.preventDefault();
					this.openPopup(popup);
				}
			});
		}

		if (popupClose) {
			popupClose.addEventListener('click', () => this.closePopup(popup));
		}

		// Contact popup
		const contactLink = document.querySelector(
			'.header__link[href="#contact"]'
		);
		const contactFooterLink = document.querySelector(
			'.footer__link[href="#contact"]'
		);
		const popupContact = document.getElementById('popup-contact');
		const popupContactClose = document.getElementById('popup-contact-close');

		if (contactLink && popupContact) {
			contactLink.addEventListener('click', (e) => {
				e.preventDefault();
				this.openPopup(popupContact);
			});
			contactLink.addEventListener('keydown', (e) => {
				if (isActivateKey(e)) {
					e.preventDefault();
					this.openPopup(popupContact);
				}
			});
		}

		if (contactFooterLink && popupContact) {
			contactFooterLink.addEventListener('click', (e) => {
				e.preventDefault();
				this.openPopup(popupContact);
			});
			contactFooterLink.addEventListener('keydown', (e) => {
				if (isActivateKey(e)) {
					e.preventDefault();
					this.openPopup(popupContact);
				}
			});
		}

		if (popupContactClose) {
			popupContactClose.addEventListener('click', () =>
				this.closePopup(popupContact)
			);
		}

		// Privacy popup
		const privacyLink = document.getElementById('privacy-link');
		const cookiePrivacyLink = document.getElementById('cookie-privacy-link');
		const privacyPopup = document.getElementById('privacy-popup');
		const privacyClose = document.getElementById('privacy-close');

		if (privacyLink && privacyPopup) {
			privacyLink.addEventListener('click', (e) => {
				e.preventDefault();
				this.openPrivacyPopup();
			});
			privacyLink.addEventListener('keydown', (e) => {
				if (isActivateKey(e)) {
					e.preventDefault();
					this.openPrivacyPopup();
				}
			});
		}

		if (cookiePrivacyLink && privacyPopup) {
			cookiePrivacyLink.addEventListener('click', (e) => {
				e.preventDefault();
				this.openPrivacyPopup();
			});
			cookiePrivacyLink.addEventListener('keydown', (e) => {
				if (isActivateKey(e)) {
					e.preventDefault();
					this.openPrivacyPopup();
				}
			});
		}

		if (privacyClose) {
			privacyClose.addEventListener('click', () => this.closePrivacyPopup());
		}

		// Close on backdrop click
		window.addEventListener('click', (e) => {
			if (e.target === popup) this.closePopup(popup);
			else if (e.target === popupContact) this.closePopup(popupContact);
			else if (e.target === privacyPopup) this.closePrivacyPopup();
		});

		// Close on Escape key
		window.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				if (popup && !popup.classList.contains('hidden'))
					this.closePopup(popup);
				if (popupContact && !popupContact.classList.contains('hidden'))
					this.closePopup(popupContact);
				if (privacyPopup && privacyPopup.classList.contains('show'))
					this.closePrivacyPopup();
			}
		});
	}

	openPopup(popupElement) {
		if (!popupElement) return;

		// Close mobile menu if open
		const menu = document.querySelector('.nav-menu');
		if (menu && menu.classList.contains('active')) {
			this.closeMenu();
		}

		this.lastFocusedElement = document.activeElement;
		popupElement.classList.remove('hidden');
		const closeButton = popupElement.querySelector('.popup__close');
		if (closeButton) closeButton.focus();
		document.body.style.overflow = 'hidden';
	}

	closePopup(popupElement) {
		if (!popupElement) return;
		popupElement.classList.add('hidden');
		if (this.lastFocusedElement) this.lastFocusedElement.focus();
		document.body.style.overflow = '';
	}

	openPrivacyPopup() {
		const privacyPopup = document.getElementById('privacy-popup');
		if (!privacyPopup) return;

		// Close mobile menu if open
		const menu = document.querySelector('.nav-menu');
		if (menu && menu.classList.contains('active')) {
			this.closeMenu();
		}

		this.lastFocusedElement = document.activeElement;
		privacyPopup.classList.add('show');
		privacyPopup.setAttribute('aria-hidden', 'false');
		const closeButton = privacyPopup.querySelector('.privacy-popup__close');
		if (closeButton) closeButton.focus();
		document.body.style.overflow = 'hidden';
		document.body.classList.add('modal-open');
	}

	closePrivacyPopup() {
		const privacyPopup = document.getElementById('privacy-popup');
		if (!privacyPopup) return;

		privacyPopup.classList.remove('show');
		privacyPopup.setAttribute('aria-hidden', 'true');
		if (this.lastFocusedElement) this.lastFocusedElement.focus();
		document.body.style.overflow = '';
		document.body.classList.remove('modal-open');
	}

	closeMenu() {
		const menu = document.querySelector('.nav-menu');
		const burger = document.querySelector('.burger');
		if (menu && burger) {
			menu.classList.remove('active');
			burger.style.display = 'flex';
			document.body.classList.remove('menu-open');
			burger.focus();
			burger.setAttribute('aria-expanded', 'false');
		}
	}
}

// ============================================================================
// MOBILE MENU MANAGEMENT
// ============================================================================

class MobileMenuManager {
	constructor() {
		this.init();
	}

	init() {
		this.setupEventListeners();
	}

	setupEventListeners() {
		const burger = document.querySelector('.burger');
		const menu = document.querySelector('.nav-menu');
		const closeBtn = document.querySelector('.close-menu');

		if (burger && menu && closeBtn) {
			burger.addEventListener('click', () => this.openMenu());
			closeBtn.addEventListener('click', () => this.closeMenu());
		}

		// Close menu when clicking outside
		document.addEventListener('click', (e) => {
			if (
				menu &&
				menu.classList.contains('active') &&
				!menu.contains(e.target) &&
				!burger.contains(e.target)
			) {
				this.closeMenu();
			}
		});

		// Close menu on Escape key
		window.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && menu && menu.classList.contains('active')) {
				this.closeMenu();
			}
		});
	}

	openMenu() {
		const menu = document.querySelector('.nav-menu');
		const burger = document.querySelector('.burger');
		if (menu && burger) {
			menu.classList.add('active');
			burger.style.display = 'none';
			document.body.classList.add('menu-open');
			burger.setAttribute('aria-expanded', 'true');
		}
	}

	closeMenu() {
		const menu = document.querySelector('.nav-menu');
		const burger = document.querySelector('.burger');
		if (menu && burger) {
			menu.classList.remove('active');
			burger.style.display = 'flex';
			document.body.classList.remove('menu-open');
			burger.focus();
			burger.setAttribute('aria-expanded', 'false');
		}
	}
}

// ============================================================================
// FORM MANAGEMENT
// ============================================================================

class FormManager {
	constructor() {
		this.init();
	}

	init() {
		this.setupContactForm();
	}

	setupContactForm() {
		const contactForm = document.getElementById('contact-form');
		const successMessage = document.getElementById('form-success-message');

		if (contactForm && successMessage) {
			contactForm.addEventListener('submit', async (e) => {
				e.preventDefault();
				const formData = new FormData(contactForm);

				try {
					const response = await fetch(contactForm.action, {
						method: contactForm.method,
						headers: { Accept: 'application/json' },
						body: formData,
					});

					if (response.ok) {
						contactForm.reset();
						successMessage.classList.remove('hidden');
						setTimeout(() => successMessage.classList.add('hidden'), 5000);
					} else {
						alert("Erreur lors de l'envoi. Veuillez réessayer.");
					}
				} catch {
					alert('Erreur de réseau. Vérifiez votre connexion.');
				}
			});
		}
	}
}

// ============================================================================
// FAQ MANAGEMENT
// ============================================================================

class FAQManager {
	constructor() {
		this.init();
	}

	init() {
		this.setupFAQ();
	}

	setupFAQ() {
		const isActivateKey = (e) => e.key === 'Enter' || e.key === ' ';

		// Event delegation for clicks
		document.addEventListener('click', (e) => {
			const button =
				e.target && e.target.closest && e.target.closest('.faq-question');
			if (button) this.toggleFAQ(button);
		});

		// Event delegation for keyboard activation
		document.addEventListener('keydown', (e) => {
			if (e.defaultPrevented || !isActivateKey(e)) return;
			const button =
				e.target && e.target.closest && e.target.closest('.faq-question');
			if (button) {
				e.preventDefault();
				this.toggleFAQ(button);
			}
		});
	}

	toggleFAQ(button) {
		const answer = button.nextElementSibling;
		const isOpen = button.getAttribute('aria-expanded') === 'true';

		if (isOpen) {
			answer.style.maxHeight = '0';
			button.setAttribute('aria-expanded', 'false');
			answer.classList.remove('open');
		} else {
			// Close any other open FAQ items (accordion behavior)
			document
				.querySelectorAll('.faq-question[aria-expanded="true"]')
				.forEach((openBtn) => {
					if (openBtn !== button) {
						const openAnswer = openBtn.nextElementSibling;
						if (openAnswer) {
							openAnswer.style.maxHeight = '0';
							openAnswer.classList.remove('open');
						}
						openBtn.setAttribute('aria-expanded', 'false');
					}
				});

			// Stabilize: clear then set exact height for smooth transition
			answer.style.maxHeight = '';
			answer.style.maxHeight = answer.scrollHeight + 'px';
			button.setAttribute('aria-expanded', 'true');
			answer.classList.add('open');
		}
	}
}

// ============================================================================
// CASINO BUTTONS ACCESSIBILITY
// ============================================================================

class CasinoButtonsManager {
	constructor() {
		this.init();
	}

	init() {
		this.setupCasinoButtons();
	}

	setupCasinoButtons() {
		const isActivateKey = (e) => e.key === 'Enter' || e.key === ' ';

		// Event delegation for keyboard activation on buttons and footer links
		document.addEventListener('keydown', (e) => {
			if (!isActivateKey(e)) return;

			// Casino buttons
			const casinoBtn =
				e.target &&
				e.target.closest &&
				e.target.closest('.casino-card__button');
			if (casinoBtn) {
				e.preventDefault();
				casinoBtn.click();
				return;
			}

			// Footer links (skip ones with their own handlers)
			const link =
				e.target && e.target.closest && e.target.closest('.footer__link');
			if (link) {
				if (link.id === 'privacy-link' || link.id === 'cookie-settings-link')
					return;
				const href = link.getAttribute('href');
				if (
					link.hasAttribute('disabled') ||
					link.getAttribute('aria-disabled') === 'true'
				)
					return;
				if (href === '#about' || href === '#contact') return;
				e.preventDefault();
				link.click();
			}
		});
	}
}

// ============================================================================
// ANIMATION MANAGEMENT
// ============================================================================

class AnimationManager {
	constructor() {
		this.init();
	}

	init() {
		this.setupHeaderLogoAnimation();
		this.setupBellAnimation();
	}

	setupHeaderLogoAnimation() {
		const headerLogo = document.querySelector('.header__logo');
		const reduceMotion =
			window.matchMedia &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (headerLogo && !reduceMotion) {
			// Rotate once on initial load
			headerLogo.classList.add('rotate-once');
			headerLogo.addEventListener('mouseenter', () => {
				headerLogo.classList.add('rotate-once');
			});
			headerLogo.addEventListener('animationend', () => {
				headerLogo.classList.remove('rotate-once');
			});
		}
	}

	setupBellAnimation() {
		const disclaimer = document.querySelector('.disclaimer');
		if (!disclaimer) return;
		const reduceMotion =
			window.matchMedia &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// Trigger bell animation after 2 seconds on every page load
		if (!reduceMotion) {
			setTimeout(() => {
				disclaimer.classList.add('bell-start');
				// Remove class after animation completes
				setTimeout(() => {
					disclaimer.classList.remove('bell-start');
				}, 2000); // 2 seconds for the animation
			}, 2000);
		}

		// Also trigger on hover
		disclaimer.addEventListener('mouseenter', () => {
			disclaimer.classList.add('bell-start');
			setTimeout(() => {
				disclaimer.classList.remove('bell-start');
			}, 2000);
		});
	}
}

// ============================================================================
// SCROLL REVEAL ANIMATION MANAGEMENT
// ============================================================================

class ScrollRevealManager {
	constructor() {
		this.init();
	}

	init() {
		const elements = document.querySelectorAll('.fade-in');
		if (!elements.length) return;

		const observer = new IntersectionObserver(
			(entries, observer) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('visible');
					} else {
						entry.target.classList.remove('visible');
					}
				});
			},
			{ threshold: 0.05, rootMargin: '0px 0px -5px 0px' }
		);

		elements.forEach((el) => observer.observe(el));
	}
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
	// Initialize all managers
	window.cookieConsentManager = new CookieConsentManager();
	window.popupManager = new PopupManager();
	window.mobileMenuManager = new MobileMenuManager();
	window.formManager = new FormManager();
	window.faqManager = new FAQManager();
	window.casinoButtonsManager = new CasinoButtonsManager();
	window.animationManager = new AnimationManager();
	window.darkModeManager = new DarkModeManager();
	window.scrollRevealManager = new ScrollRevealManager();

	// ========================================================================
	// INPUT METHOD DETECTION (Keyboard-only focus outlines)
	// ========================================================================
	(function setupInputMethodDetection() {
		let usingKeyboard = false;
		const body = document.body;
		if (!body) return;

		const keyboardKeys = new Set([
			'Tab',
			'ArrowUp',
			'ArrowDown',
			'ArrowLeft',
			'ArrowRight',
			'Escape',
		]);

		window.addEventListener(
			'keydown',
			(e) => {
				if (keyboardKeys.has(e.key)) {
					usingKeyboard = true;
					body.classList.add('user-is-tabbing');
				}
			},
			{ passive: true }
		);

		const disableKeyboardMode = () => {
			if (!usingKeyboard) return;
			usingKeyboard = false;
			body.classList.remove('user-is-tabbing');
		};

		window.addEventListener('mousedown', disableKeyboardMode, {
			passive: true,
		});
		window.addEventListener('touchstart', disableKeyboardMode, {
			passive: true,
		});
		window.addEventListener('pointerdown', disableKeyboardMode, {
			passive: true,
		});
	})();

	// ========================================================================
	// ANALYTICS BANNER MANAGEMENT
	// ========================================================================
	const analyticsBanner = document.querySelector('.cookie-consent-banner');
	const analyticsAccept = document.getElementById('accept-analytics-btn');

	if (analyticsBanner && analyticsAccept) {
		const analyticsChoice = localStorage.getItem('analyticsConsent');

		if (analyticsChoice === 'accepted') {
			analyticsBanner.style.display = 'none';
		} else {
			setTimeout(() => {
				analyticsBanner.classList.add('show');
			}, 2000);
		}

		analyticsAccept.addEventListener('click', () => {
			localStorage.setItem('analyticsConsent', 'accepted');
			analyticsBanner.style.display = 'none';

			// Запуск Google Analytics
			if (typeof gtag !== 'undefined') {
				gtag('consent', 'update', {
					analytics_storage: 'granted',
					ad_storage: 'granted',
				});
			}
		});
	}
});

// ============================================================================
// TESTING HELPERS
// ============================================================================

// Expose testing helper to clear consent and re-open the banner
window.clearCookies = function () {
	if (window.cookieConsentManager) {
		window.cookieConsentManager.clearConsent();
		// Cookie consent cleared. Banner reopened.
	}
};

// ============================================================================
// DARK MODE MANAGEMENT
// ============================================================================

class DarkModeManager {
	constructor() {
		this.toggleCheckbox = document.getElementById('theme-toggle');
		this.toggleBall = document.querySelector('.toggle-ball');
		this.themeLabel = document.querySelector('.theme-label');
		this.themeSwitchLabel = document.querySelector('.theme-switch-label');
		this.body = document.body;
		this.init();
	}

	init() {
		this.loadSavedTheme();
		if (this.toggleCheckbox && this.body) this.setupEventListeners();
	}

	loadSavedTheme() {
		if (!this.body) return;
		const savedTheme = localStorage.getItem('theme');

		let isDark;
		if (savedTheme) {
			this.body.classList.add(savedTheme);
			isDark = savedTheme === 'dark';
			if (this.toggleCheckbox) this.toggleCheckbox.checked = isDark;
		} else {
			const prefersDark = window.matchMedia(
				'(prefers-color-scheme: dark)'
			).matches;
			this.body.classList.add(prefersDark ? 'dark' : 'light');
			isDark = prefersDark;
			if (this.toggleCheckbox) this.toggleCheckbox.checked = prefersDark;
		}
		this.updateToggleUI(isDark);
		this.updateLogos();

		window
			.matchMedia('(prefers-color-scheme: dark)')
			.addEventListener('change', (e) => {
				if (!localStorage.getItem('theme')) {
					const isDark = e.matches;
					if (!this.body) return;
					this.body.classList.toggle('dark', isDark);
					this.body.classList.toggle('light', !isDark);
					this.updateToggleUI(isDark);
					this.updateLogos();
					if (this.toggleCheckbox) this.toggleCheckbox.checked = isDark;
				}
			});
	}

	setupEventListeners() {
		if (!this.toggleCheckbox) return;
		this.toggleCheckbox.addEventListener('change', () => this.toggleTheme());
	}

	toggleTheme() {
		if (!this.body) return;
		const isDark = !this.body.classList.contains('dark');
		this.body.classList.toggle('dark', isDark);
		this.body.classList.toggle('light', !isDark);
		this.updateToggleUI(isDark);
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
		this.updateLogos();
	}

	updateToggleUI(isDark) {
		// Update toggle ball with theme icon if present
		if (this.toggleBall) {
			this.toggleBall.textContent = isDark ? '🌙' : '☀️';
			this.toggleBall.style.transition =
				'transform 0.3s ease, background 0.3s ease, color 0.3s ease';
		}
		if (this.themeLabel) {
			this.themeLabel.style.color = isDark ? '#fff' : '#000';
			this.themeLabel.style.transition = 'color 0.3s ease';
		}
		if (this.themeSwitchLabel) {
			this.themeSwitchLabel.style.transition = 'background 0.3s ease';
		}
	}

	updateLogos() {
		if (!this.body) return;
		const isDark = this.body.classList.contains('dark');
		document.querySelectorAll('.casino-card__image').forEach((img) => {
			const darkSrc = img.dataset.dark;
			if (darkSrc) {
				if (isDark) {
					img.dataset.light = img.src;
					img.src = darkSrc;
				} else if (img.dataset.light) {
					img.src = img.dataset.light;
				}
			}
		});
	}
}
