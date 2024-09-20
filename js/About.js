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
    const branches = [
        { name: 'Branch 1', address: '24 Yogad St. Poblacion South, Solano, Nueva Vizcaya' },
        { name: 'Branch 2', address: '53 Dumlao, Boulevard Salvacion, Bayombong, Nueva Vizcaya' },
        { name: 'Branch 3', address: 'San Vidal St, Don Mariano Marcos, Bayombong, Nueva Vizcaya' },
        { name: 'Branch 4', address: '36 Espino St. Brgy. Quirino, Solano, Nueva Vizcaya' }
    ];

    const branchList = document.getElementById('branch-list');
    branches.forEach(branch => {
        const li = document.createElement('li');
        li.textContent = `${branch.name}: ${branch.address}`;
        branchList.appendChild(li);
    });
});