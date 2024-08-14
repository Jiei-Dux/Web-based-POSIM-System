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