async function handleLogin(event) {
    event.preventDefault();
    // console.log('handleLogin called...');
    const employeeId = document.getElementById('employee-id').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase
        .from('Employee_Table')
        .select('Employee_ID, FName, LName')
        .eq('Employee_ID', employeeId)
        .eq('Password', password)
        .single();

    if (error || !data) {
        alert('Login failed: Invalid ID or password');
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

        const { data: attendanceData, error: attendanceError } = await supabase
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
            alert('Login successful, but there was an error recording attendance. Please check in manually, sorry for the inconvinience...');
        }

        const welcomeMessage = `Welcome ${data.FName} ${data.LName}`;
        document.getElementById('welcome-message').textContent = welcomeMessage;
        const welcomePopup = document.getElementById('welcome-popup');
        // console.log('Popup element:', welcomePopup);
        welcomePopup.style.display = 'block';

        setTimeout(() => {
            window.location.href = 'Home.html';
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    document.getElementById('login-form').addEventListener('submit', handleLogin);
});