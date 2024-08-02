// Loading Animation
window.addEventListener('load', function() {
    var loading = document.getElementById('loading');
    var content = document.getElementById('content');

    var minimumLoadingTime = 3000;

    this.setTimeout(function() {
        // Hide Loading Animation
        loading.style.display = 'none';
    
        // Redirect after the page loads
        window.location.href = "html/Login.html";
    }, minimumLoadingTime);
});