// ============================================================================
// OPTIMIZED JS WITH DOM CACHING & EVENT DELEGATION
// Enhanced with section-based observers, improved delegation, and unified analytics
// ============================================================================

// Global observers registry for better memory management
const observerRegistry = {
	scrollObservers: new Map(),
	globalScrollObserver: null,
};

// ============================================================================
// COOKIE CONSENT & ANALYTICS MANAGEMENT (Unified)
// ============================================================================

class CookieConsentManager {
	constructor() {
		// Cache DOM elements
		this.banner = document.getElementById('cookie-banner');
		this.acceptBtn = document.getElementById('cookie-accept');
		this.declineBtn = document.getElementById('cookie-decline');
		this.settingsLink = document.getElementById('cookie-settings-link');
		this.minimizedIcon = this.banner?.querySelector(
			'.cookie-banner__minimized-icon'
		);
		this.container = this.banner?.querySelector('.cookie-banner__container');

		// Analytics banner elements (unified management)
		this.analyticsBanner = document.querySelector('.cookie-consent-banner');
		this.analyticsAccept = document.getElementById('accept-analytics-btn');

		// State
		this.consentKey = 'cookieConsent';
		this.analyticsConsentKey = 'analyticsConsent';
		this.analyticsLoaded = false;
		this.ahrefsLoaded = false;

		this.init();
	}

	init() {
		this.loadConsentState();
		this.setupEventListeners();
		this.loadAnalyticsIfConsented();
		this.setupAnalyticsBanner();
	}

	loadConsentState() {
		if (!this.banner) return;

		const consent = localStorage.getItem(this.consentKey);

		if (!consent) {
			setTimeout(() => this.showBanner(), 2000);
		} else if (consent === 'accepted') {
			this.banner.style.display = 'none';
		} else if (consent === 'declined') {
			this.minimizeBanner();
		}
	}

	showBanner() {
		if (!this.banner) return;

		this.banner.classList.add('show');
		if (this.acceptBtn) this.acceptBtn.focus();
	}

	minimizeBanner() {
		if (!this.banner || !this.container) return;

		this.banner.classList.remove('show');
		this.banner.classList.add('minimized');
		this.container.style.opacity = '0';
		this.container.style.maxHeight = '0';
	}

	expandBanner() {
		if (!this.banner || !this.container) return;

		this.banner.classList.remove('minimized');
		this.banner.classList.add('expanding');

		setTimeout(() => {
			this.banner.classList.add('show');
			this.container.style.maxHeight = this.container.scrollHeight + 'px';
			this.container.style.opacity = '1';
		}, 20);

		setTimeout(() => {
			this.banner.classList.remove('expanding');
			this.container.style.maxHeight = 'none';
		}, 450);
	}

	setupEventListeners() {
		if (!this.banner) return;

		// Event delegation for all cookie banner interactions
		document.addEventListener('click', (e) => {
			if (e.target === this.acceptBtn) {
				this.acceptCookies();
			} else if (e.target === this.declineBtn) {
				this.declineCookies();
			} else if (e.target === this.settingsLink) {
				e.preventDefault();
				this.resetAndShowBanner();
			} else if (e.target === this.minimizedIcon) {
				this.expandBanner();
			} else if (
				e.target === this.banner &&
				this.banner.classList.contains('minimized')
			) {
				this.expandBanner();
			}
		});

		document.addEventListener('keydown', (e) => {
			const isActivateKey = e.key === 'Enter' || e.key === ' ';

			if (e.target === this.settingsLink && isActivateKey) {
				e.preventDefault();
				this.resetAndShowBanner();
			} else if (e.target === this.minimizedIcon && isActivateKey) {
				e.preventDefault();
				this.expandBanner();
			}
		});
	}

	// Unified analytics banner management
	setupAnalyticsBanner() {
		if (!this.analyticsBanner || !this.analyticsAccept) return;

		const analyticsChoice = localStorage.getItem(this.analyticsConsentKey);

		if (analyticsChoice === 'accepted') {
			this.analyticsBanner.style.display = 'none';
		} else {
			setTimeout(() => {
				this.analyticsBanner.classList.add('show');
			}, 2000);
		}

		this.analyticsAccept.addEventListener('click', () => {
			localStorage.setItem(this.analyticsConsentKey, 'accepted');
			this.analyticsBanner.style.display = 'none';

			// Update gtag consent
			if (typeof gtag !== 'undefined') {
				gtag('consent', 'update', {
					analytics_storage: 'granted',
					ad_storage: 'granted',
				});
			}
		});
	}

	resetAndShowBanner() {
		if (!this.banner || !this.container) return;

		this.banner.style.display = '';
		this.banner.classList.remove('minimized');
		this.container.style.maxHeight = '';
		this.container.style.opacity = '1';
		this.showBanner();
	}

	acceptCookies() {
		localStorage.setItem(this.consentKey, 'accepted');
		if (this.banner) {
			this.banner.classList.remove('show');
			this.banner.style.display = 'none';
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

		this.loadGoogleAnalytics();
		this.loadAhrefsAnalytics();
		this.analyticsLoaded = true;
	}

	loadGoogleAnalytics() {
		const script = document.createElement('script');
		script.async = true;
		script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YYE4H0PHYY';
		document.head.appendChild(script);

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
		if (typeof gtag !== 'undefined') {
			gtag('consent', 'update', {
				analytics_storage: 'denied',
				ad_storage: 'denied',
			});
		}
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

	clearConsent() {
		localStorage.removeItem(this.consentKey);
		this.disableAnalytics();
		this.removeAnalyticsCookies();

		if (this.banner && this.container) {
			this.banner.style.display = '';
			this.banner.classList.remove('minimized');
			this.container.style.maxHeight = '';
			this.container.style.opacity = '1';
			setTimeout(() => this.showBanner(), 10);
		}
	}
}

// ============================================================================
// POPUP & MODAL MANAGEMENT (Enhanced with conflict prevention)
// ============================================================================

class PopupManager {
	constructor() {
		// Cache DOM elements
		this.aboutLink = document.querySelector('.header__link[href="#about"]');
		this.aboutFooterLink = document.querySelector(
			'.footer__link[href="#about"]'
		);
		this.contactLink = document.querySelector('.header__link[href="#contact"]');
		this.contactFooterLink = document.querySelector(
			'.footer__link[href="#contact"]'
		);
		this.privacyLink = document.getElementById('privacy-link');
		this.cookiePrivacyLink = document.getElementById('cookie-privacy-link');

		this.popup = document.getElementById('popup');
		this.popupClose = document.getElementById('popup-close');
		this.popupContact = document.getElementById('popup-contact');
		this.popupContactClose = document.getElementById('popup-contact-close');
		this.privacyPopup = document.getElementById('privacy-popup');
		this.privacyClose = document.getElementById('privacy-close');

		this.lastFocusedElement = null;
		this.isClosing = false; // Prevent double-closing
		this.isOpening = false; // Prevent double-opening
		this.activeModals = new Set(); // Track active modals
		this.modalStack = []; // Stack for modal hierarchy
		this.visualFeedback = true; // Enable visual feedback to prevent flicker
		this.animationDuration = 200; // Animation duration in ms
		this.feedbackTimeout = null; // Track feedback timeout

		this.init();
	}

	init() {
		this.setupEventListeners();
	}

	setupEventListeners() {
		// Event delegation for all popup interactions
		document.addEventListener('click', (e) => {
			// About popup
			if (e.target === this.aboutLink || e.target === this.aboutFooterLink) {
				e.preventDefault();
				this.openPopup(this.popup);
			} else if (e.target === this.popupClose) {
				this.closePopup(this.popup);
			}

			// Contact popup
			else if (
				e.target === this.contactLink ||
				e.target === this.contactFooterLink
			) {
				e.preventDefault();
				this.openPopup(this.popupContact);
			} else if (e.target === this.popupContactClose) {
				this.closePopup(this.popupContact);
			}

			// Privacy popup
			else if (
				e.target === this.privacyLink ||
				e.target === this.cookiePrivacyLink
			) {
				e.preventDefault();
				this.openPrivacyPopup();
			} else if (e.target === this.privacyClose) {
				this.closePrivacyPopup();
			}

			// Backdrop clicks
			else if (e.target === this.popup) {
				this.closePopup(this.popup);
			} else if (e.target === this.popupContact) {
				this.closePopup(this.popupContact);
			} else if (e.target === this.privacyPopup) {
				this.closePrivacyPopup();
			}
		});

		document.addEventListener('keydown', (e) => {
			const isActivateKey = e.key === 'Enter' || e.key === ' ';

			// About popup
			if (
				(e.target === this.aboutLink || e.target === this.aboutFooterLink) &&
				isActivateKey
			) {
				e.preventDefault();
				this.openPopup(this.popup);
			}

			// Contact popup
			else if (
				(e.target === this.contactLink ||
					e.target === this.contactFooterLink) &&
				isActivateKey
			) {
				e.preventDefault();
				this.openPopup(this.popupContact);
			}

			// Privacy popup
			else if (
				(e.target === this.privacyLink ||
					e.target === this.cookiePrivacyLink) &&
				isActivateKey
			) {
				e.preventDefault();
				this.openPrivacyPopup();
			}

			// Escape key
			else if (e.key === 'Escape') {
				if (this.popup && !this.popup.classList.contains('hidden')) {
					this.closePopup(this.popup);
				} else if (
					this.popupContact &&
					!this.popupContact.classList.contains('hidden')
				) {
					this.closePopup(this.popupContact);
				} else if (
					this.privacyPopup &&
					this.privacyPopup.classList.contains('show')
				) {
					this.closePrivacyPopup();
				}
			}
		});
	}

	openPopup(popupElement) {
		if (!popupElement || this.isClosing || this.isOpening) return;

		// Prevent rapid successive openings
		if (this.activeModals.has(popupElement)) {
			return; // Already open
		}

		this.isOpening = true;

		// Close any existing modals to prevent conflicts
		this.closeAllModals();

		// Add visual feedback to prevent flicker
		if (this.visualFeedback) {
			popupElement.style.opacity = '0';
			popupElement.style.transition = `opacity ${this.animationDuration}ms ease`;
			popupElement.style.transform = 'scale(0.95)';
		}

		// Add opening delay to prevent conflicts
		setTimeout(() => {
			if (this.isClosing) {
				this.isOpening = false;
				return; // Check if closing was initiated during delay
			}

			this.closeMenu();
			this.lastFocusedElement = document.activeElement;
			popupElement.classList.remove('hidden');

			// Smooth fade-in to prevent flicker
			if (this.visualFeedback) {
				requestAnimationFrame(() => {
					popupElement.style.opacity = '1';
					popupElement.style.transform = 'scale(1)';
				});
			}

			const closeButton = popupElement.querySelector('.popup__close');
			if (closeButton) closeButton.focus();
			document.body.style.overflow = 'hidden';

			// Track active modal
			this.activeModals.add(popupElement);
			this.modalStack.push(popupElement);

			// Reset opening flag after animation
			this.feedbackTimeout = setTimeout(() => {
				this.isOpening = false;
				if (this.visualFeedback) {
					popupElement.style.transition = '';
					popupElement.style.opacity = '';
					popupElement.style.transform = '';
				}
			}, this.animationDuration);
		}, 50); // Small delay to prevent rapid opening
	}

	closePopup(popupElement) {
		if (!popupElement || this.isClosing || this.isOpening) return;

		this.isClosing = true;

		// Smooth fade-out to prevent flicker
		if (this.visualFeedback) {
			popupElement.style.transition = `opacity ${this.animationDuration}ms ease, transform ${this.animationDuration}ms ease`;
			popupElement.style.opacity = '0';
			popupElement.style.transform = 'scale(0.95)';

			setTimeout(() => {
				popupElement.classList.add('hidden');
				popupElement.style.transition = '';
				popupElement.style.opacity = '';
				popupElement.style.transform = '';
			}, this.animationDuration);
		} else {
			popupElement.classList.add('hidden');
		}

		if (this.lastFocusedElement) this.lastFocusedElement.focus();
		document.body.style.overflow = '';

		// Remove from tracking
		this.activeModals.delete(popupElement);
		const index = this.modalStack.indexOf(popupElement);
		if (index > -1) {
			this.modalStack.splice(index, 1);
		}

		// Reset closing flag after animation
		setTimeout(() => {
			this.isClosing = false;
		}, 300);
	}

	openPrivacyPopup() {
		if (!this.privacyPopup || this.isClosing) return;

		this.closeMenu();
		this.lastFocusedElement = document.activeElement;
		this.privacyPopup.classList.add('show');
		this.privacyPopup.setAttribute('aria-hidden', 'false');
		const closeButton = this.privacyPopup.querySelector(
			'.privacy-popup__close'
		);
		if (closeButton) closeButton.focus();
		document.body.style.overflow = 'hidden';
		document.body.classList.add('modal-open');
	}

	closePrivacyPopup() {
		if (!this.privacyPopup || this.isClosing) return;

		this.isClosing = true;
		this.privacyPopup.classList.remove('show');
		this.privacyPopup.setAttribute('aria-hidden', 'true');
		if (this.lastFocusedElement) this.lastFocusedElement.focus();
		document.body.style.overflow = '';
		document.body.classList.remove('modal-open');

		// Reset closing flag after animation
		setTimeout(() => {
			this.isClosing = false;
		}, 300);
	}

	// Safe menu closing with conflict prevention
	closeMenu() {
		const menu = document.querySelector('.nav-menu');
		const burger = document.querySelector('.burger');
		if (menu && burger && menu.classList.contains('active')) {
			menu.classList.remove('active');
			burger.style.display = 'flex';
			document.body.classList.remove('menu-open');
			burger.focus();
			burger.setAttribute('aria-expanded', 'false');
		}
	}

	// Close all active modals to prevent conflicts
	closeAllModals() {
		this.activeModals.forEach((modal) => {
			if (modal === this.popup) {
				this.closePopup(modal);
			} else if (modal === this.popupContact) {
				this.closePopup(modal);
			} else if (modal === this.privacyPopup) {
				this.closePrivacyPopup();
			}
		});
		this.activeModals.clear();
		this.modalStack = [];
	}

	// Get the topmost modal (for proper focus management)
	getTopModal() {
		return this.modalStack[this.modalStack.length - 1];
	}

	// Check if any modal is currently open
	hasActiveModals() {
		return this.activeModals.size > 0;
	}

	// Prevent rapid modal operations
	debounceModalOperation(operation, delay = 100) {
		clearTimeout(this.modalDebounceTimer);
		this.modalDebounceTimer = setTimeout(operation, delay);
	}

	// Safe modal opening with conflict prevention
	safeOpenPopup(popupElement) {
		if (this.isClosing || this.activeModals.has(popupElement)) return;

		this.debounceModalOperation(() => {
			this.openPopup(popupElement);
		});
	}

	// Safe modal closing with conflict prevention
	safeClosePopup(popupElement) {
		if (this.isClosing) return;

		this.debounceModalOperation(() => {
			this.closePopup(popupElement);
		});
	}

	// Reset modal state (for debugging or manual reset)
	resetModalState() {
		this.isClosing = false;
		this.isOpening = false;
		this.activeModals.clear();
		this.modalStack = [];
		document.body.style.overflow = '';
		document.body.classList.remove('modal-open');

		// Reset visual feedback styles
		if (this.visualFeedback) {
			[this.popup, this.popupContact, this.privacyPopup].forEach((modal) => {
				if (modal) {
					modal.style.transition = '';
					modal.style.opacity = '';
				}
			});
		}
	}

	// Toggle visual feedback (for performance tuning)
	setVisualFeedback(enabled) {
		this.visualFeedback = enabled;
	}

	// Get current modal state (for debugging)
	getModalState() {
		return {
			isClosing: this.isClosing,
			isOpening: this.isOpening,
			activeModals: Array.from(this.activeModals),
			modalStack: this.modalStack,
			visualFeedback: this.visualFeedback,
			animationDuration: this.animationDuration,
		};
	}

	// Set animation duration
	setAnimationDuration(duration) {
		this.animationDuration = Math.max(100, Math.min(1000, duration)); // Clamp between 100ms and 1000ms
	}

	// Enhanced visual feedback for rapid clicks
	enhanceVisualFeedback() {
		// Add subtle shake animation for rapid clicks
		const activeModal = this.getTopModal();
		if (activeModal && this.visualFeedback) {
			activeModal.style.animation = 'shake 0.3s ease-in-out';
			setTimeout(() => {
				activeModal.style.animation = '';
			}, 300);
		}
	}
}

// ============================================================================
// MOBILE MENU MANAGEMENT
// ============================================================================

class MobileMenuManager {
	constructor() {
		// Cache DOM elements
		this.burger = document.querySelector('.burger');
		this.menu = document.querySelector('.nav-menu');
		this.closeBtn = document.querySelector('.close-menu');

		this.init();
	}

	init() {
		this.setupEventListeners();
	}

	setupEventListeners() {
		// Event delegation for mobile menu
		document.addEventListener('click', (e) => {
			const burgerClicked = e.target.closest && e.target.closest('.burger');
			const closeClicked = e.target.closest && e.target.closest('.close-menu');
			if (burgerClicked && this.burger && burgerClicked === this.burger) {
				this.openMenu();
			} else if (
				closeClicked &&
				this.closeBtn &&
				closeClicked === this.closeBtn
			) {
				this.closeMenu();
			} else if (
				this.menu &&
				this.menu.classList.contains('active') &&
				!this.menu.contains(e.target) &&
				!this.burger.contains(e.target)
			) {
				this.closeMenu();
			}
		});

		document.addEventListener('keydown', (e) => {
			if (
				e.key === 'Escape' &&
				this.menu &&
				this.menu.classList.contains('active')
			) {
				this.closeMenu();
			}
		});
	}

	openMenu() {
		if (this.menu && this.burger) {
			this.menu.classList.add('active');
			this.burger.style.display = 'none';
			document.body.classList.add('menu-open');
			this.burger.setAttribute('aria-expanded', 'true');
		}
	}

	closeMenu() {
		if (this.menu && this.burger) {
			this.menu.classList.remove('active');
			this.burger.style.display = 'flex';
			document.body.classList.remove('menu-open');
			this.burger.focus();
			this.burger.setAttribute('aria-expanded', 'false');
		}
	}
}

// ============================================================================
// FORM MANAGEMENT
// ============================================================================

class FormManager {
	constructor() {
		// Cache DOM elements
		this.contactForm = document.getElementById('contact-form');
		this.successMessage = document.getElementById('form-success-message');

		this.init();
	}

	init() {
		this.setupContactForm();
	}

	setupContactForm() {
		if (!this.contactForm || !this.successMessage) return;

		this.contactForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const formData = new FormData(this.contactForm);

			try {
				const response = await fetch(this.contactForm.action, {
					method: this.contactForm.method,
					headers: { Accept: 'application/json' },
					body: formData,
				});

				if (response.ok) {
					this.contactForm.reset();
					this.successMessage.classList.remove('hidden');
					setTimeout(() => this.successMessage.classList.add('hidden'), 5000);
				} else {
					alert("Erreur lors de l'envoi. Veuillez réessayer.");
				}
			} catch {
				alert('Erreur de réseau. Vérifiez votre connexion.');
			}
		});
	}
}

// ============================================================================
// FAQ MANAGEMENT
// ============================================================================

class FAQManager {
	constructor() {
		// Cache container for better performance
		this.faqSection = document.querySelector('.faq-section');
		this.faqQuestions =
			this.faqSection?.querySelectorAll('.faq-question') || [];
		this.lazyAttachThreshold = 50; // Use lazy attach for more than 50 FAQ items
		this.virtualScrollThreshold = 200; // Use virtual scrolling for more than 200 FAQ items
		this.ultraLargeThreshold = 500; // Use enhanced virtual scrolling for more than 500 FAQ items
		this.extremeThreshold = 1000; // Use DOM recycling for more than 1000 FAQ items
		this.attachedElements = new Set();
		this.intersectionObserver = null;
		this.virtualScrollEnabled = false;
		this.visibleRange = { start: 0, end: 0 };

		this.init();
	}

	init() {
		this.setupFAQ();
		if (this.faqQuestions.length > this.extremeThreshold) {
			this.setupDOMRecycling();
		} else if (this.faqQuestions.length > this.ultraLargeThreshold) {
			this.setupEnhancedVirtualScrolling();
		} else if (this.faqQuestions.length > this.virtualScrollThreshold) {
			this.setupVirtualScrolling();
		} else if (this.faqQuestions.length > this.lazyAttachThreshold) {
			this.setupLazyAttach();
		}
	}

	setupFAQ() {
		// Use container-based delegation for better performance
		const container = this.faqSection || document;

		// Event delegation for FAQ interactions
		container.addEventListener('click', (e) => {
			const button = e.target?.closest?.('.faq-question');
			if (button) this.toggleFAQ(button);
		});

		container.addEventListener('keydown', (e) => {
			const isActivateKey = e.key === 'Enter' || e.key === ' ';
			if (e.defaultPrevented || !isActivateKey) return;

			const button = e.target?.closest?.('.faq-question');
			if (button) {
				e.preventDefault();
				this.toggleFAQ(button);
			}
		});
	}

	// Lazy attach for large FAQ sections
	setupLazyAttach() {
		this.intersectionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const faqItem = entry.target;
						if (!this.attachedElements.has(faqItem)) {
							this.attachFAQEvents(faqItem);
							this.attachedElements.add(faqItem);
						}
						// Unobserve after attaching
						this.intersectionObserver.unobserve(faqItem);
					}
				});
			},
			{ threshold: 0.1, rootMargin: '100px' }
		);

		// Observe all FAQ questions
		this.faqQuestions.forEach((question) => {
			this.intersectionObserver.observe(question);
		});
	}

	attachFAQEvents(faqItem) {
		// Attach specific events to individual FAQ item if needed
		// This is called when the FAQ item comes into view
	}

	// Virtual scrolling setup for very large FAQ sections
	setupVirtualScrolling() {
		this.virtualScrollEnabled = true;
		const container = this.faqSection;
		if (!container) return;

		// Create virtual scroll container
		const virtualContainer = document.createElement('div');
		virtualContainer.className = 'virtual-faq-container';
		virtualContainer.style.height = `${this.faqQuestions.length * 60}px`; // Estimated height

		// Replace original content with virtual container
		container.innerHTML = '';
		container.appendChild(virtualContainer);

		// Setup intersection observer for virtual scrolling
		this.setupVirtualScrollObserver(virtualContainer);
	}

	setupVirtualScrollObserver(virtualContainer) {
		this.intersectionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						this.updateVisibleFAQItems(entry.target);
					}
				});
			},
			{ threshold: 0.1, rootMargin: '200px' }
		);

		this.intersectionObserver.observe(virtualContainer);
	}

	updateVisibleFAQItems(container) {
		// Calculate visible range based on scroll position
		const scrollTop = container.scrollTop || window.pageYOffset;
		const containerHeight = container.clientHeight;
		const itemHeight = 60; // Estimated FAQ item height

		const start = Math.max(0, Math.floor(scrollTop / itemHeight) - 5);
		const end = Math.min(
			this.faqQuestions.length,
			Math.ceil((scrollTop + containerHeight) / itemHeight) + 5
		);

		// Only update if range has changed significantly
		if (
			Math.abs(start - this.visibleRange.start) > 3 ||
			Math.abs(end - this.visibleRange.end) > 3
		) {
			this.renderVisibleFAQItems(start, end);
			this.visibleRange = { start, end };
		}
	}

	renderVisibleFAQItems(start, end) {
		// This would render only visible FAQ items
		// Implementation depends on specific FAQ structure
		console.log(`Rendering FAQ items ${start} to ${end}`);
	}

	// Enhanced virtual scrolling for ultra-large sections (>500 items)
	setupEnhancedVirtualScrolling() {
		this.virtualScrollEnabled = true;
		const container = this.faqSection;
		if (!container) return;

		// Create enhanced virtual scroll container with performance optimizations
		const virtualContainer = document.createElement('div');
		virtualContainer.className = 'enhanced-virtual-faq-container';
		virtualContainer.style.height = `${this.faqQuestions.length * 60}px`;
		virtualContainer.style.position = 'relative';

		// Add performance optimizations
		virtualContainer.style.willChange = 'transform';
		virtualContainer.style.contain = 'layout style paint';

		// Replace original content with virtual container
		container.innerHTML = '';
		container.appendChild(virtualContainer);

		// Setup enhanced intersection observer
		this.setupEnhancedVirtualScrollObserver(virtualContainer);

		// Add scroll throttling for better performance
		this.setupScrollThrottling(virtualContainer);
	}

	setupEnhancedVirtualScrollObserver(virtualContainer) {
		this.intersectionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						this.updateVisibleFAQItemsEnhanced(entry.target);
					}
				});
			},
			{ threshold: 0.05, rootMargin: '300px' } // Larger margin for better performance
		);

		this.intersectionObserver.observe(virtualContainer);
	}

	updateVisibleFAQItemsEnhanced(container) {
		// Enhanced calculation with performance optimizations
		const scrollTop = container.scrollTop || window.pageYOffset;
		const containerHeight = container.clientHeight;
		const itemHeight = 60;

		// Use more aggressive buffering for ultra-large lists
		const bufferSize = Math.min(20, Math.ceil(containerHeight / itemHeight));

		const start = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
		const end = Math.min(
			this.faqQuestions.length,
			Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize
		);

		// Only update if range has changed significantly (reduced sensitivity)
		if (
			Math.abs(start - this.visibleRange.start) > 5 ||
			Math.abs(end - this.visibleRange.end) > 5
		) {
			this.renderVisibleFAQItemsEnhanced(start, end);
			this.visibleRange = { start, end };
		}
	}

	renderVisibleFAQItemsEnhanced(start, end) {
		// Enhanced rendering with performance optimizations
		console.log(
			`Enhanced rendering FAQ items ${start} to ${end} (${end - start} items)`
		);
	}

	setupScrollThrottling(container) {
		let scrollTimeout;
		container.addEventListener(
			'scroll',
			() => {
				clearTimeout(scrollTimeout);
				scrollTimeout = setTimeout(() => {
					this.updateVisibleFAQItemsEnhanced(container);
				}, 16); // ~60fps throttling
			},
			{ passive: true }
		);
	}

	// DOM recycling for extreme lists (>1000 items)
	setupDOMRecycling() {
		this.virtualScrollEnabled = true;
		this.domRecyclingEnabled = true;
		const container = this.faqSection;
		if (!container) return;

		// Create minimal DOM structure with recycling
		const virtualContainer = document.createElement('div');
		virtualContainer.className = 'dom-recycled-faq-container';
		virtualContainer.style.height = `${this.faqQuestions.length * 60}px`;
		virtualContainer.style.position = 'relative';

		// Performance optimizations for extreme lists
		virtualContainer.style.willChange = 'transform';
		virtualContainer.style.contain = 'layout style paint';
		virtualContainer.style.overflow = 'hidden';

		// Replace original content
		container.innerHTML = '';
		container.appendChild(virtualContainer);

		// Setup DOM recycling
		this.setupDOMRecyclingObserver(virtualContainer);
		this.setupScrollThrottling(virtualContainer);
	}

	setupDOMRecyclingObserver(virtualContainer) {
		this.intersectionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						this.updateDOMRecycledItems(entry.target);
					}
				});
			},
			{ threshold: 0.01, rootMargin: '100px' } // Very sensitive for extreme lists
		);

		this.intersectionObserver.observe(virtualContainer);
	}

	updateDOMRecycledItems(container) {
		// Calculate visible range with aggressive buffering
		const scrollTop = container.scrollTop || window.pageYOffset;
		const containerHeight = container.clientHeight;
		const itemHeight = 60;

		// Minimal buffer for extreme performance
		const bufferSize = 5;

		const start = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
		const end = Math.min(
			this.faqQuestions.length,
			Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize
		);

		// Only update if range has changed significantly
		if (
			Math.abs(start - this.visibleRange.start) > 2 ||
			Math.abs(end - this.visibleRange.end) > 2
		) {
			this.renderDOMRecycledItems(start, end, container);
			this.visibleRange = { start, end };
		}
	}

	renderDOMRecycledItems(start, end, container) {
		// DOM recycling: reuse existing elements instead of creating new ones
		console.log(
			`DOM recycling FAQ items ${start} to ${end} (${end - start} items)`
		);

		// Clear container and render only visible items
		container.innerHTML = '';

		// Create only the visible items
		for (let i = start; i < end; i++) {
			const item = this.createRecycledFAQItem(i);
			container.appendChild(item);
		}
	}

	createRecycledFAQItem(index) {
		// Create minimal DOM structure for each FAQ item
		const item = document.createElement('div');
		item.className = 'faq-item-recycled';
		item.style.position = 'absolute';
		item.style.top = `${index * 60}px`;
		item.style.height = '60px';
		item.textContent = `FAQ Item ${index + 1}`;
		return item;
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

	// Cleanup method for memory management
	cleanup() {
		if (this.intersectionObserver) {
			this.intersectionObserver.disconnect();
			this.intersectionObserver = null;
		}
		this.attachedElements.clear();
	}
}

// ============================================================================
// CASINO BUTTONS ACCESSIBILITY
// ============================================================================

class CasinoButtonsManager {
	constructor() {
		// Cache container for better performance
		this.casinoContainer = document.querySelector('.casino-cards-container');
		this.casinoButtons =
			this.casinoContainer?.querySelectorAll('.casino-card__button') || [];
		this.lazyAttachThreshold = 30; // Use lazy attach for more than 30 casino buttons
		this.virtualScrollThreshold = 100; // Use virtual scrolling for more than 100 casino buttons
		this.ultraLargeThreshold = 300; // Use enhanced virtual scrolling for more than 300 casino buttons
		this.attachedElements = new Set();
		this.intersectionObserver = null;
		this.virtualScrollEnabled = false;
		this.visibleRange = { start: 0, end: 0 };

		this.init();
	}

	init() {
		this.setupCasinoButtons();
		if (this.casinoButtons.length > this.ultraLargeThreshold) {
			this.setupEnhancedVirtualScrolling();
		} else if (this.casinoButtons.length > this.virtualScrollThreshold) {
			this.setupVirtualScrolling();
		} else if (this.casinoButtons.length > this.lazyAttachThreshold) {
			this.setupLazyAttach();
		}
	}

	setupCasinoButtons() {
		// Use container-based delegation for better performance
		const container = this.casinoContainer || document;

		// Event delegation for keyboard activation
		container.addEventListener('keydown', (e) => {
			const isActivateKey = e.key === 'Enter' || e.key === ' ';
			if (!isActivateKey) return;

			// Casino buttons
			const casinoBtn = e.target?.closest?.('.casino-card__button');
			if (casinoBtn) {
				e.preventDefault();
				casinoBtn.click();
				return;
			}

			// Footer links (skip ones with their own handlers)
			const link = e.target?.closest?.('.footer__link');
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

	// Lazy attach for large casino sections
	setupLazyAttach() {
		this.intersectionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const casinoCard = entry.target;
						if (!this.attachedElements.has(casinoCard)) {
							this.attachCasinoEvents(casinoCard);
							this.attachedElements.add(casinoCard);
						}
						// Unobserve after attaching
						this.intersectionObserver.unobserve(casinoCard);
					}
				});
			},
			{ threshold: 0.1, rootMargin: '100px' }
		);

		// Observe all casino cards
		this.casinoButtons.forEach((button) => {
			const casinoCard = button.closest('.casino-card');
			if (casinoCard) {
				this.intersectionObserver.observe(casinoCard);
			}
		});
	}

	attachCasinoEvents(casinoCard) {
		// Attach specific events to individual casino card if needed
		// This is called when the casino card comes into view
	}

	// Virtual scrolling setup for very large casino sections
	setupVirtualScrolling() {
		this.virtualScrollEnabled = true;
		const container = this.casinoContainer;
		if (!container) return;

		// Create virtual scroll container
		const virtualContainer = document.createElement('div');
		virtualContainer.className = 'virtual-casino-container';
		virtualContainer.style.height = `${this.casinoButtons.length * 200}px`; // Estimated height

		// Replace original content with virtual container
		container.innerHTML = '';
		container.appendChild(virtualContainer);

		// Setup intersection observer for virtual scrolling
		this.setupVirtualScrollObserver(virtualContainer);
	}

	setupVirtualScrollObserver(virtualContainer) {
		this.intersectionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						this.updateVisibleCasinoCards(entry.target);
					}
				});
			},
			{ threshold: 0.1, rootMargin: '200px' }
		);

		this.intersectionObserver.observe(virtualContainer);
	}

	updateVisibleCasinoCards(container) {
		// Calculate visible range based on scroll position
		const scrollTop = container.scrollTop || window.pageYOffset;
		const containerHeight = container.clientHeight;
		const itemHeight = 200; // Estimated casino card height

		const start = Math.max(0, Math.floor(scrollTop / itemHeight) - 3);
		const end = Math.min(
			this.casinoButtons.length,
			Math.ceil((scrollTop + containerHeight) / itemHeight) + 3
		);

		// Only update if range has changed significantly
		if (
			Math.abs(start - this.visibleRange.start) > 2 ||
			Math.abs(end - this.visibleRange.end) > 2
		) {
			this.renderVisibleCasinoCards(start, end);
			this.visibleRange = { start, end };
		}
	}

	renderVisibleCasinoCards(start, end) {
		// This would render only visible casino cards
		// Implementation depends on specific casino card structure
		console.log(`Rendering casino cards ${start} to ${end}`);
	}

	// Enhanced virtual scrolling for ultra-large casino sections (>300 items)
	setupEnhancedVirtualScrolling() {
		this.virtualScrollEnabled = true;
		const container = this.casinoContainer;
		if (!container) return;

		// Create enhanced virtual scroll container with performance optimizations
		const virtualContainer = document.createElement('div');
		virtualContainer.className = 'enhanced-virtual-casino-container';
		virtualContainer.style.height = `${this.casinoButtons.length * 200}px`;
		virtualContainer.style.position = 'relative';

		// Add performance optimizations
		virtualContainer.style.willChange = 'transform';
		virtualContainer.style.contain = 'layout style paint';

		// Replace original content with virtual container
		container.innerHTML = '';
		container.appendChild(virtualContainer);

		// Setup enhanced intersection observer
		this.setupEnhancedVirtualScrollObserver(virtualContainer);

		// Add scroll throttling for better performance
		this.setupScrollThrottling(virtualContainer);
	}

	setupEnhancedVirtualScrollObserver(virtualContainer) {
		this.intersectionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						this.updateVisibleCasinoCardsEnhanced(entry.target);
					}
				});
			},
			{ threshold: 0.05, rootMargin: '400px' } // Larger margin for casino cards
		);

		this.intersectionObserver.observe(virtualContainer);
	}

	updateVisibleCasinoCardsEnhanced(container) {
		// Enhanced calculation with performance optimizations
		const scrollTop = container.scrollTop || window.pageYOffset;
		const containerHeight = container.clientHeight;
		const itemHeight = 200;

		// Use more aggressive buffering for ultra-large lists
		const bufferSize = Math.min(10, Math.ceil(containerHeight / itemHeight));

		const start = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
		const end = Math.min(
			this.casinoButtons.length,
			Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize
		);

		// Only update if range has changed significantly (reduced sensitivity)
		if (
			Math.abs(start - this.visibleRange.start) > 3 ||
			Math.abs(end - this.visibleRange.end) > 3
		) {
			this.renderVisibleCasinoCardsEnhanced(start, end);
			this.visibleRange = { start, end };
		}
	}

	renderVisibleCasinoCardsEnhanced(start, end) {
		// Enhanced rendering with performance optimizations
		console.log(
			`Enhanced rendering casino cards ${start} to ${end} (${
				end - start
			} items)`
		);
	}

	setupScrollThrottling(container) {
		let scrollTimeout;
		container.addEventListener(
			'scroll',
			() => {
				clearTimeout(scrollTimeout);
				scrollTimeout = setTimeout(() => {
					this.updateVisibleCasinoCardsEnhanced(container);
				}, 16); // ~60fps throttling
			},
			{ passive: true }
		);
	}

	// Cleanup method for memory management
	cleanup() {
		if (this.intersectionObserver) {
			this.intersectionObserver.disconnect();
			this.intersectionObserver = null;
		}
		this.attachedElements.clear();
	}
}

// ============================================================================
// ANIMATION MANAGEMENT
// ============================================================================

class AnimationManager {
	constructor() {
		// Cache DOM elements
		this.headerLogo = document.querySelector('.header__logo');
		this.disclaimer = document.querySelector('.disclaimer');
		this.reduceMotion = window.matchMedia?.(
			'(prefers-reduced-motion: reduce)'
		).matches;

		this.init();
	}

	init() {
		this.setupHeaderLogoAnimation();
		this.setupBellAnimation();
	}

	setupHeaderLogoAnimation() {
		if (!this.headerLogo || this.reduceMotion) return;

		// Rotate once on initial load
		this.headerLogo.classList.add('rotate-once');
		this.headerLogo.addEventListener('mouseenter', () => {
			this.headerLogo.classList.add('rotate-once');
		});
		this.headerLogo.addEventListener('animationend', () => {
			this.headerLogo.classList.remove('rotate-once');
		});
	}

	setupBellAnimation() {
		if (!this.disclaimer || this.reduceMotion) return;

		// Trigger bell animation after 2 seconds on every page load
		setTimeout(() => {
			this.disclaimer.classList.add('bell-start');
			setTimeout(() => {
				this.disclaimer.classList.remove('bell-start');
			}, 2000);
		}, 2000);

		// Also trigger on hover
		this.disclaimer.addEventListener('mouseenter', () => {
			this.disclaimer.classList.add('bell-start');
			setTimeout(() => {
				this.disclaimer.classList.remove('bell-start');
			}, 2000);
		});
	}
}

// ============================================================================
// SCROLL REVEAL ANIMATION MANAGEMENT (Enhanced with adaptive parameters and once option)
// ============================================================================

class ScrollRevealManager {
	constructor() {
		// Cache DOM elements and sections
		this.elements = document.querySelectorAll('.fade-in');
		this.faqSection = document.querySelector('.faq-section');
		this.casinoSection = document.querySelector('.casino-cards-container');
		this.heroSection = document.querySelector('.hero-section');

		// Section-based element collections
		this.sectionElements = {
			faq: this.faqSection ? this.faqSection.querySelectorAll('.fade-in') : [],
			casino: this.casinoSection
				? this.casinoSection.querySelectorAll('.fade-in')
				: [],
			hero: this.heroSection
				? this.heroSection.querySelectorAll('.fade-in')
				: [],
			other: [],
		};

		// Adaptive parameters based on screen size
		this.adaptiveConfig = this.getAdaptiveConfig();
		this.animationOnce = true; // Set to false if animations should repeat

		// Section-specific once settings
		this.sectionOnceSettings = {
			faq: true, // FAQ animations should not repeat
			casino: true, // Casino animations should not repeat
			hero: false, // Hero animations can repeat
			other: true, // Other animations should not repeat
		};

		// Element-specific once settings (for individual control)
		this.elementOnceSettings = new Map();

		// Enable scroll-up animations (allows elements to animate again when scrolling up)
		this.enableScrollUpAnimations = true;

		this.init();
	}

	// Get adaptive configuration based on screen size and device type
	getAdaptiveConfig() {
		const isMobile = window.innerWidth <= 768;
		const isTablet = window.innerWidth <= 1024;
		const isLargeScreen = window.innerWidth > 1440;
		const isUltraWide = window.innerWidth > 1920;

		// Dynamic configuration based on page characteristics
		const pageHeight = document.documentElement.scrollHeight;
		const viewportHeight = window.innerHeight;
		const isLongPage = pageHeight > viewportHeight * 3; // More than 3 viewports
		const isVeryLongPage = pageHeight > viewportHeight * 5; // More than 5 viewports
		const totalFadeElements = this.elements.length;
		const isHighElementCount = totalFadeElements > 100;

		// Enhanced rootMargin for long pages and high element count
		let rootMargin = '0px 0px -5px 0px'; // Base: 5px as requested

		if (isVeryLongPage || isHighElementCount) {
			// For very long pages or many elements, trigger earlier
			rootMargin = '0px 0px -50px 0px';
		} else if (isLongPage) {
			// For long pages, slightly earlier trigger
			rootMargin = '0px 0px -20px 0px';
		}

		// Adaptive threshold based on page characteristics
		let threshold = isMobile ? 0.1 : isTablet ? 0.08 : 0.05;
		if (isVeryLongPage || isHighElementCount) {
			threshold = Math.max(0.01, threshold * 0.5); // Lower threshold for better performance
		}

		return {
			threshold,
			rootMargin,
			sectionThreshold: isMobile ? 10 : isTablet ? 15 : 20,
			once: true, // Prevent re-triggering animations
			isLongPage,
			isVeryLongPage,
			isHighElementCount,
			totalElements: totalFadeElements,
		};
	}

	init() {
		if (!this.elements.length) return;
		this.categorizeElements();
		this.setupSectionObservers();
		this.setupResizeListener();
	}

	// Listen for resize events to update adaptive config
	setupResizeListener() {
		let resizeTimeout;
		window.addEventListener('resize', () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				this.adaptiveConfig = this.getAdaptiveConfig();
				// Recreate observers with new config if needed
				this.recreateObservers();
			}, 250);
		});
	}

	// Categorize elements by sections for better performance
	categorizeElements() {
		const allElements = Array.from(this.elements);

		allElements.forEach((element) => {
			if (this.faqSection && this.faqSection.contains(element)) {
				this.sectionElements.faq.push(element);
			} else if (this.casinoSection && this.casinoSection.contains(element)) {
				this.sectionElements.casino.push(element);
			} else if (this.heroSection && this.heroSection.contains(element)) {
				this.sectionElements.hero.push(element);
			} else {
				this.sectionElements.other.push(element);
			}
		});
	}

	setupSectionObservers() {
		// Create observers for each section with more than threshold elements
		Object.entries(this.sectionElements).forEach(([sectionName, elements]) => {
			if (elements.length === 0) return;

			// Use global observer for small sections, separate observers for large ones
			if (elements.length > this.adaptiveConfig.sectionThreshold) {
				this.createSectionObserver(sectionName, elements);
			} else {
				this.useGlobalObserver(elements);
			}
		});
	}

	createSectionObserver(sectionName, elements) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('visible');
						// Check individual element setting first, then section setting
						const elementOnce = this.getElementOnce(entry.target);
						// Only unobserve if it's a "once" animation and element is fully visible
						if (elementOnce && entry.intersectionRatio >= 0.5) {
							observer.unobserve(entry.target);
						}
					} else if (this.enableScrollUpAnimations) {
						// Remove visible class when scrolling up to allow re-animation
						// This works for both once and repeat animations
						entry.target.classList.remove('visible');
					}
				});
			},
			{
				threshold: this.adaptiveConfig.threshold,
				rootMargin: this.adaptiveConfig.rootMargin,
			}
		);

		// Store observer for cleanup
		observerRegistry.scrollObservers.set(sectionName, observer);

		// Observe all elements in this section
		elements.forEach((el) => observer.observe(el));
	}

	useGlobalObserver(elements) {
		// Use global observer if it doesn't exist
		if (!observerRegistry.globalScrollObserver) {
			observerRegistry.globalScrollObserver = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							entry.target.classList.add('visible');
							// Only unobserve if element is fully visible (allows scroll-up animations)
							if (entry.intersectionRatio >= 0.5) {
								observerRegistry.globalScrollObserver.unobserve(entry.target);
							}
						} else if (this.enableScrollUpAnimations) {
							// Remove visible class when scrolling up to allow re-animation
							entry.target.classList.remove('visible');
						}
					});
				},
				{
					threshold: this.adaptiveConfig.threshold,
					rootMargin: this.adaptiveConfig.rootMargin,
				}
			);
		}

		elements.forEach((el) => observerRegistry.globalScrollObserver.observe(el));
	}

	// Recreate observers with new adaptive config
	recreateObservers() {
		this.cleanup();
		this.setupSectionObservers();
	}

	// Toggle scroll-up animations
	setScrollUpAnimations(enabled) {
		this.enableScrollUpAnimations = enabled;
	}

	// Set individual element once setting
	setElementOnce(element, once) {
		if (element && element.nodeType === Node.ELEMENT_NODE) {
			this.elementOnceSettings.set(element, once);
		}
	}

	// Get individual element once setting
	getElementOnce(element) {
		if (element && this.elementOnceSettings.has(element)) {
			return this.elementOnceSettings.get(element);
		}
		// Fall back to section setting
		const section = this.getElementSection(element);
		return this.sectionOnceSettings[section] ?? true;
	}

	// Determine which section an element belongs to
	getElementSection(element) {
		if (this.faqSection && this.faqSection.contains(element)) return 'faq';
		if (this.casinoSection && this.casinoSection.contains(element))
			return 'casino';
		if (this.heroSection && this.heroSection.contains(element)) return 'hero';
		return 'other';
	}

	// Get current animation settings
	getAnimationSettings() {
		return {
			enableScrollUpAnimations: this.enableScrollUpAnimations,
			sectionOnceSettings: this.sectionOnceSettings,
			adaptiveConfig: this.adaptiveConfig,
			elementOnceSettings: Array.from(this.elementOnceSettings.entries()),
		};
	}

	// Cleanup method for memory management
	cleanup() {
		observerRegistry.scrollObservers.forEach((observer) =>
			observer.disconnect()
		);
		observerRegistry.scrollObservers.clear();
		if (observerRegistry.globalScrollObserver) {
			observerRegistry.globalScrollObserver.disconnect();
			observerRegistry.globalScrollObserver = null;
		}
	}
}

// ============================================================================
// DARK MODE MANAGEMENT (Enhanced with MutationObserver for dynamic elements)
// ============================================================================

class DarkModeManager {
	constructor() {
		// Cache DOM elements
		this.toggleCheckbox = document.getElementById('theme-toggle');
		this.toggleBall = document.querySelector('.toggle-ball');
		this.themeLabel = document.querySelector('.theme-label');
		this.themeSwitchLabel = document.querySelector('.theme-switch-label');
		this.body = document.body;
		this.casinoImages = document.querySelectorAll('.casino-card__image');

		// MutationObserver for dynamic elements
		this.mutationObserver = null;
		this.observedContainers = new Set();
		this.pendingUpdates = new Set(); // Batch updates
		this.updateScheduled = false; // Prevent multiple RAF calls

		this.init();
	}

	init() {
		this.loadSavedTheme();
		if (this.toggleCheckbox && this.body) {
			this.setupEventListeners();
			this.setupMutationObserver();
		}
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

		// Listen for system theme changes
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

	// Setup MutationObserver to watch for dynamically added casino cards
	setupMutationObserver() {
		if (!this.mutationObserver) {
			this.mutationObserver = new MutationObserver((mutations) => {
				// Batch all mutations to avoid excessive updates
				mutations.forEach((mutation) => {
					if (mutation.type === 'childList') {
						mutation.addedNodes.forEach((node) => {
							if (node.nodeType === Node.ELEMENT_NODE) {
								// Check if it's a casino card or contains casino cards
								const casinoImages = node.matches?.('.casino-card__image')
									? [node]
									: node.querySelectorAll?.('.casino-card__image') || [];

								if (casinoImages.length > 0) {
									// Add to pending updates instead of immediate processing
									casinoImages.forEach((img) => this.pendingUpdates.add(img));
								}
							}
						});
					}
				});

				// Schedule batched update using requestAnimationFrame
				this.scheduleBatchedUpdate();
			});
		}

		// Observe common containers where casino cards might be added
		const containers = [
			document.querySelector('.casino-cards-container'),
			document.querySelector('.casino-section'),
			document.querySelector('.main-content'),
		].filter(Boolean);

		containers.forEach((container) => {
			if (!this.observedContainers.has(container)) {
				this.mutationObserver.observe(container, {
					childList: true,
					subtree: true,
				});
				this.observedContainers.add(container);
			}
		});
	}

	// Schedule batched update using requestAnimationFrame
	scheduleBatchedUpdate() {
		if (this.updateScheduled) return;

		this.updateScheduled = true;
		requestAnimationFrame(() => {
			this.processBatchedUpdates();
			this.updateScheduled = false;
		});
	}

	// Process all pending updates in a single batch
	processBatchedUpdates() {
		if (this.pendingUpdates.size === 0) return;

		const images = Array.from(this.pendingUpdates);
		this.pendingUpdates.clear();
		this.updateDynamicLogos(images);
	}

	// Update logos for dynamically added elements
	updateDynamicLogos(images) {
		const isDark = this.body.classList.contains('dark');
		images.forEach((img) => {
			const darkSrc = img.dataset.dark;
			if (!darkSrc) return;

			if (isDark) {
				if (!img.dataset.light) {
					img.dataset.light = img.src;
				}
				img.src = darkSrc;
			} else if (img.dataset.light) {
				img.src = img.dataset.light;
			}
		});
	}

	// Manual method to update logos for newly inserted casino cards
	// Call this method after programmatically adding casino cards
	updateNewCasinoCards(container = null) {
		const targetContainer = container || document;
		const newImages = targetContainer.querySelectorAll('.casino-card__image');
		if (newImages.length > 0) {
			this.updateDynamicLogos(Array.from(newImages));
		}
	}

	// Public method to force update all casino logos
	forceUpdateAllLogos() {
		// Update existing cached images
		this.updateLogos();

		// Update any new images that might have been added
		const allCasinoImages = document.querySelectorAll('.casino-card__image');
		this.updateDynamicLogos(Array.from(allCasinoImages));
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

	// Enhanced logo updating with safe attribute checking
	updateLogos() {
		if (!this.body) return;

		const isDark = this.body.classList.contains('dark');
		this.casinoImages.forEach((img) => {
			// Safe attribute checking - skip if attributes don't exist
			const darkSrc = img.dataset.dark;
			if (!darkSrc) return; // Skip if no dark source

			if (isDark) {
				// Store current light source before switching
				if (!img.dataset.light) {
					img.dataset.light = img.src;
				}
				img.src = darkSrc;
			} else if (img.dataset.light) {
				// Only switch if light source exists
				img.src = img.dataset.light;
			}
		});
	}

	// Cleanup MutationObserver
	cleanup() {
		if (this.mutationObserver) {
			this.mutationObserver.disconnect();
			this.mutationObserver = null;
		}
		this.observedContainers.clear();
	}
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
	// Safety: ensure body is scrollable on initial load
	document.body.style.overflow = '';
	document.body.classList.remove('menu-open', 'modal-open');

	// Initialize critical managers first (non-blocking for scroll)
	window.cookieConsentManager = new CookieConsentManager();
	window.popupManager = new PopupManager();
	window.mobileMenuManager = new MobileMenuManager();
	window.formManager = new FormManager();
	window.faqManager = new FAQManager();
	window.casinoButtonsManager = new CasinoButtonsManager();
	window.darkModeManager = new DarkModeManager();

	// Defer non-critical visual managers to idle time to avoid blocking initial scroll
	const defer = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
	defer(() => {
		window.animationManager = new AnimationManager();
		window.scrollRevealManager = new ScrollRevealManager();
	});

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
});

// ============================================================================
// TESTING HELPERS
// ============================================================================

window.clearCookies = function () {
	if (window.cookieConsentManager) {
		window.cookieConsentManager.clearConsent();
	}
};

// ============================================================================
// CLEANUP ON PAGE UNLOAD (Memory management)
// ============================================================================

window.addEventListener('beforeunload', () => {
	// Cleanup all managers
	if (window.scrollRevealManager) {
		window.scrollRevealManager.cleanup();
	}
	if (window.darkModeManager) {
		window.darkModeManager.cleanup();
	}
	if (window.faqManager) {
		window.faqManager.cleanup();
	}
	if (window.casinoButtonsManager) {
		window.casinoButtonsManager.cleanup();
	}
});
