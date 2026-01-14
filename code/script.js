document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevents page refresh

    const empId = document.getElementById('employeeId').value;
    const password = document.getElementById('password').value;
    const captcha = document.getElementById('captchaInput').value;

    // Simple check (You can change "56305" to whatever your captcha is)
    if (captcha === "56305") {
        alert("Login Successful! Redirecting to Home Page...");
        
        // THIS LINE CONNECTS BACK TO THE INDEX PAGE
        window.location.href = "index.html"; 
    } else {
        alert("Invalid Captcha. Please try again.");
    }
});