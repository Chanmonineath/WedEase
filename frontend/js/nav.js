// ===============================================
// MOBILE NAVIGATION - WORKING
// ===============================================

(function() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Starting mobile menu...');
        
        // Get elements
        const menuBtn = document.getElementById('mobileMenuBtn');
        const closeBtn = document.getElementById('mobileCloseBtn');
        const mobileNav = document.getElementById('mobileNav');
        const overlay = document.getElementById('navOverlay');
        const hamburger = document.getElementById('hamburger');
        
        // Open menu
        function openMenu() {
            console.log('Open menu');
            if (mobileNav) mobileNav.classList.add('open');
            if (overlay) overlay.classList.add('open');
            if (hamburger) hamburger.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
        
        // Close menu
        function closeMenu() {
            console.log('Close menu');
            if (mobileNav) mobileNav.classList.remove('open');
            if (overlay) overlay.classList.remove('open');
            if (hamburger) hamburger.classList.remove('open');
            document.body.style.overflow = '';
        }
        
        // Add events
        if (menuBtn) menuBtn.addEventListener('click', openMenu);
        if (closeBtn) closeBtn.addEventListener('click', closeMenu);
        if (overlay) overlay.addEventListener('click', closeMenu);
        
        // Close when clicking links
        if (mobileNav) {
            const links = mobileNav.querySelectorAll('a');
            links.forEach(link => link.addEventListener('click', closeMenu));
        }
        
        console.log('✅ Ready');
    });
})();