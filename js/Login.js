async function LoginHandler(event) {
    event.preventDefault();

    const employeeId = document.getElementById('employee-id').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase
        .from('Employee')
        .select('Employee_ID, FName, LName')
        .eq('Employee_ID', employeeId)
        .eq('Password', password)
        .single();

    if (error || !data) {
        showErrorPopup();
        return;
    }

    if (data) {
        showWelcomePopup(data.FName, data.LName);
    }
}

function showWelcomePopup(firstName, lastName) {
    const welcomeMessage = `Welcome ${firstName} ${lastName}`;
    document.getElementById('welcome-message').textContent = welcomeMessage;
    const welcomePopup = document.getElementById('welcome-popup');
    welcomePopup.style.display = 'flex';
    setTimeout(() => {
        window.location.href = 'Home.html';
        console.log(new Date().toISOString());
    }, 5000);
}

function showErrorPopup() {
    const errorPopup = document.getElementById('error-popup');
    errorPopup.style.display = 'flex';
}

function closeErrorPopup() {
    const errorPopup = document.getElementById('error-popup');
    errorPopup.style.display = 'none';
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.src = '../Assets/open-eye.png';
        toggleIcon.alt = 'Hide Password';
        return;
    }

    if (passwordInput.type === 'text') {
        passwordInput.type = 'password';
        toggleIcon.src = '../Assets/hidden-eye.png';
        toggleIcon.alt = 'Show Password';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    document.getElementById('login-form').addEventListener('submit', LoginHandler);
    document.querySelector('.toggle-password').addEventListener('click', togglePasswordVisibility);
    document.getElementById('close-error-popup').addEventListener('click', closeErrorPopup);

    document.getElementById('about-btn').addEventListener('click', function () {
        window.location.href = 'About.html';
    });

    document.getElementById('help-btn').addEventListener('click', function () {
        window.location.href = 'Help.html';
    });
});