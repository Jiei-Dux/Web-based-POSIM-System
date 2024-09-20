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
    }

    function disableDarkMode() {
        body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
    }

    function updateImages(mode) {
        const images = document.querySelectorAll('img[data-lightmode][data-darkmode]');
        images.forEach(img => {
            img.src = img.getAttribute(`data-${mode}`);
        })
    }
})




document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // "Back to Top" button
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = 'Back to Top';
    backToTopButton.classList.add('btn', 'btn-primary', 'btn-sm');
    backToTopButton.id = 'back-to-top';
    document.body.appendChild(backToTopButton);

    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    });
});