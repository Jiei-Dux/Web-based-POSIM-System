// JavaScript to make tooltip follow mouse cursor
document.addEventListener('mousemove', (event) => {
    const tooltip = document.getElementById('tooltip');
    tooltip.style.left = `${event.pageX + 10}px`; // Adjust 10 pixels to the right of the cursor
    tooltip.style.top = `${event.pageY + 10}px`; // Adjust 10 pixels below the cursor
});