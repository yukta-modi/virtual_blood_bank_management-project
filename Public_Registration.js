import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore, addDoc, collection } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

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
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    const registerButton = document.getElementById('register');
    const firstNameField = document.getElementById('firstName');
    const lastNameField = document.getElementById('lastName');
    const bloodGroupField = document.getElementById('bloodGroup');
    const emailField = document.getElementById('registerEmail');
    const mobileNumberField = document.getElementById('mobileNumber');
    const addressField = document.getElementById('address');
    const passwordField = document.getElementById('loginPassword');
    const confirmPasswordField = document.getElementById('confirmPassword');
    const form = document.getElementById('registerForm');

    form.addEventListener('input', () => {
        const allFilled = [
            firstNameField.value.trim(),
            lastNameField.value.trim(),
            bloodGroupField.value,
            emailField.value.trim(),
            mobileNumberField.value.trim(),
            addressField.value.trim(),
            passwordField.value.trim(),
            confirmPasswordField.value.trim(),
        ].every(Boolean);
        registerButton.disabled = !allFilled;
    });

    function showPopup(message) {
        alert(message); 
    }

    function validateForm() {
        const firstName = firstNameField.value.trim();
        const lastName = lastNameField.value.trim();
        const bloodGroup = bloodGroupField.value;
        const email = emailField.value.trim();
        const mobileNumber = mobileNumberField.value.trim();
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;

        const firstNameValid = /^[A-Z][a-z]+$/.test(firstName);
        const lastNameValid = /^[A-Z][a-z]+$/.test(lastName);
        const emailValid = email.includes("@") && email.includes(".");
        const mobileNumberValid = /^\+44\d{10}$/.test(mobileNumber);
        const passwordValid = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(password);
        const passwordsMatch = password === confirmPassword;

        if (!firstNameValid) {
            showPopup("First name should start with an uppercase letter followed by lowercase letters.");
            return false;
        }
        if (!lastNameValid) {
            showPopup("Last name should start with an uppercase letter followed by lowercase letters.");
            return false;
        }
        if (!emailValid) {
            showPopup("Please enter a valid email address with '@' and domain.");
            return false;
        }
        if (!mobileNumberValid) {
            showPopup("Mobile number should be in the format +441234567890.");
            return false;
        }
        if (!passwordValid) {
            showPopup("Password must be 8-15 characters long, include letters, numbers, and special characters.");
            return false;
        }
        if (!passwordsMatch) {
            showPopup("Passwords do not match.");
            return false;
        }

        return true; 
    }
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        if (!validateForm()) return;

        const firstName = firstNameField.value;
        const lastName = lastNameField.value;
        const bloodGroup = bloodGroupField.value;
        const email = emailField.value;
        const mobileNumber = mobileNumberField.value;
        const address = addressField.value;
        const password = passwordField.value;

        try {
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
   
            await addDoc(collection(db, "users"), {
                firstName,
                lastName,
                bloodGroup,
                email,
                mobileNumber,
                address,
                uid: user.uid
            });

            localStorage.setItem("userId", user.uid);

            showPopup("User registered successfully!");
            window.location.href = 'Users_Dashboard.html';

        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                showPopup("The email address is already in use by another account.");
            } else {
                showPopup("Error registering user: " + error.message);
            }
        }
    });
});
