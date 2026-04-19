// ===============================================
// MOBILE NAVIGATION - WORKING
// ===============================================

(function() {
    function initNav() {
        const menuBtn = document.getElementById('mobileMenuBtn');
        const closeBtn = document.getElementById('mobileCloseBtn');
        const mobileNav = document.getElementById('mobileNav');
        const overlay = document.getElementById('navOverlay');
        const hamburger = document.getElementById('hamburger');

        if (!menuBtn || !mobileNav) {
            console.log('Nav elements not found, retrying...');
            setTimeout(initNav, 100);
            return;
        }

        console.log('✅ Nav elements found, attaching listeners...');

        function openMenu() {
            mobileNav.classList.add('open');
            if (overlay) overlay.classList.add('open');
            if (hamburger) hamburger.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            mobileNav.classList.remove('open');
            if (overlay) overlay.classList.remove('open');
            if (hamburger) hamburger.classList.remove('open');
            document.body.style.overflow = '';
        }

        // TOGGLE instead of just open
        menuBtn.addEventListener('click', () => {
            if (mobileNav.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        if (closeBtn) closeBtn.addEventListener('click', closeMenu);
        if (overlay) overlay.addEventListener('click', closeMenu);

        if (mobileNav) {
            mobileNav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', closeMenu);
            });
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeMenu();
        });

        console.log('✅ Mobile nav fully initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNav);
    } else {
        initNav();
    }
})();