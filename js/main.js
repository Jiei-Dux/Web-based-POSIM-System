// Tooltip follow Mouse Pointer Animation
document.addEventListener('mousemove', (event) => {
    const tooltip = document.getElementById('tooltip');
    const tooltipUser= document.getElementById('tooltipUser');
    const tooltipLogout= document.getElementById('tooltipLogout');

    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY + 10}px`;

    tooltipUser.style.left = `${event.pageX + 10}px`;
    tooltipUser.style.top = `${event.pageY + 10}px`;

    tooltipLogout.style.left = `${event.pageX + 10}px`;
    tooltipLogout.style.top = `${event.pageY + 10}px`;
});
