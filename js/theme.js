// Theme management
const themes = ['light', 'dark', 'dim', 'sunset', 'forest'];
let currentThemeIndex = 0;

// Load saved theme from localStorage
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = `theme-${savedTheme}`;
        currentThemeIndex = themes.indexOf(savedTheme);
    }
});

// Theme toggle button functionality
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const newTheme = themes[currentThemeIndex];
    document.body.className = `theme-${newTheme}`;
    localStorage.setItem('theme', newTheme);
    
    // Update theme toggle icon
    const icon = themeToggle.querySelector('i');
    icon.className = currentThemeIndex === 0 ? 'fas fa-moon' : 'fas fa-sun';
});
