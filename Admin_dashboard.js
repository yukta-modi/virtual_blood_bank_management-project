import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

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

const logoffButton = document.getElementById('logoff');  

logoffButton.addEventListener('click', (event) => {
    event.preventDefault();
    
    signOut(auth).then(() => {
        alert("You have been logged out successfully.");
        
        localStorage.clear();
        sessionStorage.clear();
       
        window.location.href = "Login_container.html";  
    }).catch((error) => {
       
        console.error("Error signing out: ", error);
        alert("There was an error logging out. Please try again.");
    });
});
