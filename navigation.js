// Navigation and Sidebar Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const sidebar = document.getElementById('sidebar');
    const mobileSidebar = document.getElementById('mySidebar');
    const closeSidebar = document.querySelector('.close-sidebar');
    
    // Initialize AOS animation library if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }
    
    /**
     * Open the sidebar
     */
    function openNav() {
        if (mobileSidebar) {
            mobileSidebar.style.width = '250px';
        }
        
        if (sidebar) {
            sidebar.style.display = 'block';
            sidebar.classList.add('open');
        }
    }
    
    /**
     * Close the sidebar
     */
    function closeNav() {
        if (mobileSidebar) {
            mobileSidebar.style.width = '0';
        }
        
        if (sidebar) {
            sidebar.classList.remove('open');
            setTimeout(() => {
                sidebar.style.display = 'none';
            }, 300);
        }
    }
    
    // Add event listeners
    if (navToggle) {
        navToggle.addEventListener('click', openNav);
    }
    
    if (closeSidebar) {
        closeSidebar.addEventListener('click', closeNav);
    }
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        // Check if click is outside sidebar and navbar
        const isOutsideSidebar = sidebar && !sidebar.contains(event.target);
        const isOutsideMobileSidebar = mobileSidebar && !mobileSidebar.contains(event.target);
        const isOutsideNavToggle = navToggle && !navToggle.contains(event.target);
        
        if (isOutsideSidebar && isOutsideMobileSidebar && isOutsideNavToggle) {
            if (sidebar && sidebar.classList.contains('open')) {
                closeNav();
            }
        }
    });
    
    // Handle responsive behavior
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992 && sidebar && sidebar.classList.contains('open')) {
            closeNav();
        }
    });
    
    // Make functions available globally
    window.openNav = openNav;
    window.closeNav = closeNav;
});
