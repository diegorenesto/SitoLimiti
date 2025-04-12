// Theme Switching Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved theme preference or use user's system preference
    initTheme();
    
    // Theme toggle buttons
    const themeToggle = document.querySelector('.theme-toggle');
    const themeToggleSidebar = document.querySelector('.theme-toggle-sidebar');
    const themeCheckbox = document.getElementById('check');
    const themeIcon = document.getElementById('theme-icon');
    
    // Add event listeners for theme toggling
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (themeToggleSidebar) {
        themeToggleSidebar.addEventListener('click', toggleTheme);
    }
    
    /**
     * Initialize theme based on saved preference or system preference
     */
    function initTheme() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeState(savedTheme === 'dark');
        } else {
            // Check for system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            updateThemeState(prefersDark);
        }
    }
    
    /**
     * Toggle between light and dark themes
     */
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Update DOM
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Save preference
        localStorage.setItem('theme', newTheme);
        
        // Update theme state in UI
        updateThemeState(newTheme === 'dark');
        
        // Dispatch theme changed event for other components to update
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
    }
    
    /**
     * Update UI elements to match current theme
     */
    function updateThemeState(isDark) {
        // Update theme toggle icons
        const themeToggle = document.querySelector('.theme-toggle');
        const themeToggleSidebar = document.querySelector('.theme-toggle-sidebar');
        
        if (themeToggle) {
            themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
        
        if (themeToggleSidebar) {
            themeToggleSidebar.innerHTML = isDark ? 
                '<i class="fas fa-sun"></i> Tema chiaro' : 
                '<i class="fas fa-moon"></i> Tema scuro';
        }
        
        // Update theme icon in the header
        if (themeIcon) {
            themeIcon.innerHTML = isDark ? '🌙' : '☀️';
        }
        
        // Update theme checkbox
        if (themeCheckbox) {
            themeCheckbox.checked = isDark;
        }
    }
    
    // Make toggleTheme available globally
    window.toggleTheme = toggleTheme;
});
