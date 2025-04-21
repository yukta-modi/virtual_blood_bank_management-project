import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, signInWithEmailAndPassword,sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCPm5wXyaacdzd4MpEsYI1UuP2c3-7Hy34",
    authDomain: "final-project-cd776.firebaseapp.com",
    projectId: "final-project-cd776",
    storageBucket: "final-project-cd776.appspot.com",
    messagingSenderId: "113355665466",
    appId: "1:113355665466:web:2d62bc7129dfe074984503"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", function() {

    const tabLinks = document.querySelectorAll(".tab-link");
    const formContainers = document.querySelectorAll(".form-container");

    tabLinks.forEach(link => {
        link.addEventListener("click", function() {
            const tab = this.getAttribute("data-tab");

            tabLinks.forEach(link => link.classList.remove("active"));
            this.classList.add("active");

            formContainers.forEach(container => container.classList.remove("active"));
            document.getElementById(tab).classList.add("active");
        });
    });

   
    const registerButton = document.getElementById('register-button');
    if (registerButton) {
        registerButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            window.location.href = "Public_Registration.html";
        });
    }

   
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById("user-email").value;
            const password = document.getElementById("user-password").value;

            if (email && password) {
                try {
                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    localStorage.setItem("userId", user.uid);
                    window.location.href = "Users_Dashboard.html";

                } catch (error) {
                    console.error("Error during sign in:", error.message);
                    alert("Failed to login. Please check your email and password.");
                }
            } else {
                alert("Please enter both email and password.");
            }
        });
    }

    
    const forgotPasswordDonor = document.getElementById('forgot-password-donor');
    if (forgotPasswordDonor) {
        forgotPasswordDonor.addEventListener('click', async function(e) {
            e.preventDefault();
            const email = document.getElementById("user-email").value;
            if (email) {
                try {
                    await sendPasswordResetEmail(auth, email);
                    alert("Password reset email sent!");
                } catch (error) {
                    console.error("Error sending password reset email:", error.message);
                    alert("Failed to send password reset email. Please check the email address.");
                }
            } else {
                alert("Please enter your email address to reset your password.");
            }
        });
    }

    
    const registerButtonHospital = document.getElementById('register-button-hospital');
    if (registerButtonHospital) {
        registerButtonHospital.addEventListener('click', function(e) {
            e.preventDefault();
            
            window.location.href = "login page.html";  
        });
    }

    
    const hospitalLoginForm = document.getElementById('hospitalLoginForm');
    if (hospitalLoginForm) {
        hospitalLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById("hospital-admin-email").value;
            const password = document.getElementById("hospital-admin-password").value;
            const referenceNo = document.getElementById("hospital-admin-reference-number").value;

            if (email && password && referenceNo) {
                console.log("Hospital Admin Login Attempt:", email, password, referenceNo);
                window.location.href = "Hospital_Dashboard.html";  
            } else {
                alert("Please fill in all fields.");
            }
        });
    }

    
    const forgotPasswordHospital = document.getElementById('forgot-password-hospital');
    if (forgotPasswordHospital) {
        forgotPasswordHospital.addEventListener('click', async function(e) {
            e.preventDefault();
            const email = document.getElementById("hospital-admin-email").value;
            if (email) {
                try {
                    await sendPasswordResetEmail(auth, email);
                    alert("Password reset email sent!");
                } catch (error) {
                    console.error("Error sending password reset email:", error.message);
                    alert("Failed to send password reset email. Please check the email address.");
                }
            } else {
                alert("Please enter your email address to reset your password.");
            }
        });
    }

    const adminLoginForm = document.getElementById('admin').querySelector('form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.getElementById("admin-email").value;
            const password = document.getElementById("admin-password").value;

            if (email === "app56@administrator.com" && password === "adPassword@123") {
                try {
                    await signInWithEmailAndPassword(auth, email, password);
                    window.location.href = "Admin_dashboard.html"; 
                } catch (error) {
                    alert("Failed to login. Please check your email and password.");
                }
            } else {
                alert("Access Denied");
            }
        });
    }
});
