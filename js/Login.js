async function handleLogin(event) {
    event.preventDefault();

    const employeeId = document.getElementById('employee-id').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase
        .from('Employee_Table')
        .select('Employee_ID, FName, LName')
        .eq('Employee_ID', employeeId)
        .eq('Password', password)
        .single();

    if (error || !data) {
        showErrorPopup();
        return;
    }

    if (data) {
        const now = new Date();
        console.log('Attempting to insert attendance record...');
        const { data: maxNumberData, error: maxNumberError } = await supabase
            .from('Employee_Attendance')
            .select('Number')
            .order('Number', { ascending: false })
            .limit(1)
            .single();

        let nextNumber = 1;
        if (!maxNumberError && maxNumberData) {
            nextNumber = maxNumberData.Number + 1;
        }

        const { error: attendanceError } = await supabase
            .from('Employee_Attendance')
            .insert({
                Number: nextNumber,
                Employee_Number: data.Employee_ID,
                FName: data.FName,
                LName: data.LName,
                ClockIn: now.toISOString()
            });

        if (attendanceError) {
            console.error('Error recording attendance:', attendanceError);
            alert('Login successful, but there was an error recording attendance. Please check in manually, sorry for the inconvenience...');
        }

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
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.querySelector('.toggle-password').addEventListener('click', togglePasswordVisibility);
    document.getElementById('close-error-popup').addEventListener('click', closeErrorPopup);

    document.getElementById('about-btn').addEventListener('click', function () {
        window.location.href = 'About.html';
    });

    document.getElementById('help-btn').addEventListener('click', function () {
        window.location.href = 'Help.html';
    });
});