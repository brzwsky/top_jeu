document.addEventListener('DOMContentLoaded', () => {
	// --- Cookie Banner ---
	const cookieBanner = document.getElementById('cookie-banner');
	const cookieAccept = document.getElementById('cookie-accept');
	const cookieDecline = document.getElementById('cookie-decline');

	if (cookieBanner && cookieAccept && cookieDecline) {
		const cookieChoice = localStorage.getItem('cookieConsent');

		if (!cookieChoice)
			setTimeout(() => cookieBanner.classList.add('show'), 2000);
		else if (cookieChoice === 'accepted') cookieBanner.style.display = 'none';
		else if (cookieChoice === 'declined')
			cookieBanner.classList.add('minimized');

		const minimizeBanner = () => {
			cookieBanner.classList.remove('show');
			cookieBanner.classList.add('minimized');
			const container = cookieBanner.querySelector('.cookie-banner__container');
			if (container) {
				container.style.opacity = '0';
				container.style.maxHeight = '0';
			}
		};

		const expandBanner = () => {
			const container = cookieBanner.querySelector('.cookie-banner__container');
			cookieBanner.classList.remove('minimized');
			cookieBanner.classList.add('expanding');
			setTimeout(() => {
				cookieBanner.classList.add('show');
				if (container) {
					container.style.maxHeight = container.scrollHeight + 'px';
					container.style.opacity = '1';
				}
			}, 20);
			setTimeout(() => cookieBanner.classList.remove('expanding'), 450);
		};

		cookieAccept.addEventListener('click', () => {
			localStorage.setItem('cookieConsent', 'accepted');
			cookieBanner.classList.remove('show');
			cookieBanner.style.display = 'none';
			if (typeof gtag !== 'undefined') {
				gtag('consent', 'update', {
					analytics_storage: 'granted',
					ad_storage: 'granted',
				});
			}
		});

		cookieDecline.addEventListener('click', () => {
			localStorage.setItem('cookieConsent', 'declined');
			minimizeBanner();
			if (typeof gtag !== 'undefined') {
				gtag('consent', 'update', {
					analytics_storage: 'denied',
					ad_storage: 'denied',
				});
			}
		});

		cookieBanner.addEventListener('click', (e) => {
			if (e.target === cookieAccept || e.target === cookieDecline) return;
			if (cookieBanner.classList.contains('minimized')) expandBanner();
		});

		if (typeof gtag !== 'undefined') {
			const consent = localStorage.getItem('cookieConsent');
			gtag('consent', 'default', {
				analytics_storage: consent === 'accepted' ? 'granted' : 'denied',
				ad_storage: consent === 'accepted' ? 'granted' : 'denied',
			});
		}
	}

	// --- Попапы, меню, формы, FAQ ---
	const popup = document.getElementById('popup');
	const popupClose = document.getElementById('popup-close');
	const popupContact = document.getElementById('popup-contact');
	const popupContactClose = document.getElementById('popup-contact-close');
	const privacyPopup = document.getElementById('privacy-popup');
	const privacyClose = document.getElementById('privacy-close');
	const privacyLink = document.getElementById('privacy-link');
	const cookiePrivacyLink = document.getElementById('cookie-privacy-link');

	const burger = document.querySelector('.burger');
	const menu = document.querySelector('.nav-menu');
	const closeBtn = document.querySelector('.close-menu');
	const body = document.body;

	let lastFocusedElement = null;

	function openPopup(popupElement) {
		if (!popupElement) return;
		if (menu && menu.classList.contains('active')) closeMenu();
		lastFocusedElement = document.activeElement;
		popupElement.classList.remove('hidden');
		const closeButton = popupElement.querySelector('.popup__close');
		if (closeButton) closeButton.focus();
		body.style.overflow = 'hidden';
	}
	function closePopup(popupElement) {
		if (!popupElement) return;
		popupElement.classList.add('hidden');
		if (lastFocusedElement) lastFocusedElement.focus();
		body.style.overflow = '';
	}

	function openPrivacyPopup() {
		if (!privacyPopup) return;
		if (menu && menu.classList.contains('active')) closeMenu();
		lastFocusedElement = document.activeElement;
		privacyPopup.classList.add('show');
		privacyPopup.setAttribute('aria-hidden', 'false');
		if (privacyClose) privacyClose.focus();
		body.style.overflow = 'hidden';
		body.classList.add('modal-open');
	}
	function closePrivacyPopup() {
		if (!privacyPopup) return;
		privacyPopup.classList.remove('show');
		privacyPopup.setAttribute('aria-hidden', 'true');
		if (lastFocusedElement) lastFocusedElement.focus();
		body.style.overflow = '';
		body.classList.remove('modal-open');
	}

	function openMenu() {
		menu.classList.add('active');
		burger.style.display = 'none';
		body.classList.add('menu-open');
		burger.setAttribute('aria-expanded', 'true');
	}
	function closeMenu() {
		menu.classList.remove('active');
		burger.style.display = 'flex';
		body.classList.remove('menu-open');
		burger.focus();
		burger.setAttribute('aria-expanded', 'false');
	}

	const aboutLink = document.querySelector('.header__link[href="#about"]');
	if (aboutLink)
		aboutLink.addEventListener('click', (e) => {
			e.preventDefault();
			openPopup(popup);
		});

	const contactLink = document.querySelector('.header__link[href="#contact"]');
	if (contactLink)
		contactLink.addEventListener('click', (e) => {
			e.preventDefault();
			openPopup(popupContact);
		});

	if (privacyLink)
		privacyLink.addEventListener('click', (e) => {
			e.preventDefault();
			openPrivacyPopup();
		});
	if (cookiePrivacyLink)
		cookiePrivacyLink.addEventListener('click', (e) => {
			e.preventDefault();
			openPrivacyPopup();
		});

	if (privacyClose) privacyClose.addEventListener('click', closePrivacyPopup);
	if (popupClose) popupClose.addEventListener('click', () => closePopup(popup));
	if (popupContactClose)
		popupContactClose.addEventListener('click', () => closePopup(popupContact));

	window.addEventListener('click', (e) => {
		if (e.target === popup) closePopup(popup);
		else if (e.target === popupContact) closePopup(popupContact);
		else if (e.target === privacyPopup) closePrivacyPopup();
	});

	window.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			if (popup && !popup.classList.contains('hidden')) closePopup(popup);
			if (popupContact && !popupContact.classList.contains('hidden'))
				closePopup(popupContact);
			if (privacyPopup && privacyPopup.classList.contains('show'))
				closePrivacyPopup();
			if (menu && menu.classList.contains('active')) closeMenu();
		}
	});

	if (burger && menu && closeBtn) {
		burger.addEventListener('click', openMenu);
		closeBtn.addEventListener('click', closeMenu);
	}

	document.addEventListener('click', (e) => {
		if (
			menu &&
			menu.classList.contains('active') &&
			!menu.contains(e.target) &&
			!burger.contains(e.target)
		) {
			closeMenu();
		}
	});

	// --- Contact Form ---
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
				} else alert("Erreur lors de l'envoi. Veuillez réessayer.");
			} catch {
				alert('Erreur de réseau. Vérifiez votre connexion.');
			}
		});
	}

	// --- FAQ Toggle ---
	document.querySelectorAll('.faq-question').forEach((button) => {
		button.addEventListener('click', () => {
			const answer = button.nextElementSibling;
			const isOpen = button.getAttribute('aria-expanded') === 'true';
			if (isOpen) {
				answer.style.maxHeight = '0';
				button.setAttribute('aria-expanded', 'false');
				answer.classList.remove('open');
			} else {
				answer.style.maxHeight = answer.scrollHeight + 'px';
				button.setAttribute('aria-expanded', 'true');
				answer.classList.add('open');
			}
		});
	});

	// --- Header logo rotate on hover (replayable) ---
	const headerLogo = document.querySelector('.header__logo');
	const reduceMotion =
		window.matchMedia &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (headerLogo && !reduceMotion) {
		// rotate once on initial load
		headerLogo.classList.add('rotate-once');
		headerLogo.addEventListener('mouseenter', () => {
			headerLogo.classList.add('rotate-once');
		});
		headerLogo.addEventListener('animationend', () => {
			headerLogo.classList.remove('rotate-once');
		});
	}
});

// Expose a testing helper to clear consent and re-open the banner
window.clearCookies = function () {
	try {
		localStorage.removeItem('cookieConsent');
	} catch (e) {}

	// Try to expire common analytics cookies on current domain
	const expireCookie = (name) => {
		try {
			const past = 'Thu, 01 Jan 1970 00:00:00 GMT';
			document.cookie = name + '=; expires=' + past + '; path=/';
		} catch (e) {}
	};

	const allCookies = document.cookie.split(';').map((c) => c.trim());
	allCookies.forEach((pair) => {
		const eq = pair.indexOf('=');
		const key = eq > -1 ? pair.substring(0, eq) : pair;
		if (
			key.startsWith('_ga') ||
			key === '_gid' ||
			key === '_gat' ||
			key === '_gcl_au' ||
			key === '_fbp' ||
			key === '_uetsid' ||
			key === '_uetvid'
		) {
			expireCookie(key);
		}
	});

	if (typeof gtag !== 'undefined') {
		try {
			gtag('consent', 'default', {
				analytics_storage: 'denied',
				ad_storage: 'denied',
			});
		} catch (e) {}
	}

	const banner = document.getElementById('cookie-banner');
	if (banner) {
		banner.style.display = '';
		banner.classList.remove('minimized');
		const container = banner.querySelector('.cookie-banner__container');
		if (container) {
			container.style.maxHeight = '';
			container.style.opacity = '1';
		}
		setTimeout(() => banner.classList.add('show'), 10);
	}

	console.log('Cookie consent cleared. Banner reopened.');
};
