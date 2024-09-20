// ===== ===== ===== ===== ===== Dark/Light Mode Function ===== ===== ===== ===== ===== //
document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // User Preference Checker
    if (localStorage.getItem('darkMode') === 'enabled') {
        enableDarkMode();
    }

    darkModeToggle.addEventListener('click', function() {
        if (body.classList.contains('dark-mode')) {
            disableDarkMode();
            return;
        }

        if (!body.classList.contains('dark-mode')) {
            enableDarkMode();
        }
    });

    function enableDarkMode() {
        body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
        updateImages('darkmode');
    }

    function disableDarkMode() {
        body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
        updateImages('lightmode');
    }

    function updateImages(mode) {
        const images = document.querySelectorAll('img[data-lightmode][data-darkmode]');
        images.forEach(img => {
            img.src = img.getAttribute(`data-${mode}`);
        });

        const svgs = document.querySelectorAll('svg[data-lightmode][data-darkmode]');
        svgs.forEach(svg => {
            svg.innerHTML = svg.getAttribute(`data-${mode}`);
        });
    }
})