import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

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
    const registerForm = document.getElementById("registerForm");
    const registerbtn = document.getElementById("registerbtn");

    const fields = [
        document.getElementById("hospitalName"),
        document.getElementById("hospitalAddress"),
        document.getElementById("email"),
        document.getElementById("password"),
        document.getElementById("confirmPassword"),
        document.getElementById("referenceNumber")
    ];

    fields.forEach(field => {
        field.addEventListener("input", () => {
            const allFilled = fields.every(input => input.value.trim() !== "");
            registerbtn.disabled = !allFilled;
        });
    });

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const hospitalName = document.getElementById("hospitalName").value.trim();
        const hospitalAddress = document.getElementById("hospitalAddress").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();
        const referenceNumber = document.getElementById("referenceNumber").value.trim();

        if (password !== confirmPassword) {
            alert("Passwords do not match!!");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "Hospitals", `${hospitalName}_${referenceNumber}`), {
                hospitalName: hospitalName,
                hospitalAddress: hospitalAddress,
                email: email,
                referenceNumber: referenceNumber,
                uid: user.uid
            });

            alert("Registration successful");
            window.location.href = "Hospital_Dashboard.html"; 
        } catch (error) {
            console.error("Error during registration: ", error);
            alert(`Error: ${error.message}`);
        }
    });
});
