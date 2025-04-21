import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, doc, getDoc, query, collection, where, getDocs, setDoc, orderBy, deleteDoc} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
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
const db = getFirestore(app);
const auth = getAuth(app);

    function handleLogout() {
        signOut(auth).then(() => {

            localStorage.removeItem("userId");
            window.location.href = "Login_container.html"; 

        }).catch((error) => {
            console.error("Error signing out: ", error);
        });
    }

document.addEventListener("DOMContentLoaded", async function() {

    const userId = localStorage.getItem("userId");
    let firstName = "";
    let lastName = "";

    if (userId) {
        try {
            const userQuery = query(collection(db, "users"), where("uid", "==", userId));
            const querySnapshot = await getDocs(userQuery);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();

                firstName = userData.firstName || "";
                lastName = userData.lastName || "";

                document.getElementById("profileFirstName").textContent = firstName;
                document.getElementById("profileLastName").textContent = lastName;
                document.getElementById("profileBloodGroup").textContent = userData.bloodGroup || "";
                document.getElementById("profileEmail").textContent = userData.email || "";
                document.getElementById("profileMobileNumber").textContent = userData.mobileNumber || "";
                document.getElementById("profileAddress").textContent = userData.address || "";
            } else {
                console.error("No such document!");
            }
        } catch (error) {
            console.error("Error getting document:", error);
        }
    } else {
        console.error("No user ID found in local storage.");
    }

    const sidebarLinks = document.querySelectorAll(".sidebar-link");
    const contentSections = document.querySelectorAll(".content-section");

    sidebarLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            const targetId = this.getAttribute("data-target");
    
            if (targetId === 'donationAppointments') {
                const proceed = confirm("Is blood test done in recent 1 month or have you booked any appointment for Blood test?");
                if (proceed) {
                    contentSections.forEach(section => section.classList.remove("active"));
                    document.getElementById(targetId).classList.add("active");
                } else {
                    alert("Book a Blood Test appointment minimum 4hrs before donation appointment.");
                    return;
                }
            } else if (targetId === 'donationAppointments_list') {
                displayAppointments(firstName, lastName, "Donation_appointments", "donationAppointmentsList");
                contentSections.forEach(section => section.classList.remove("active"));
                document.getElementById(targetId).classList.add("active");

            } else if (targetId === 'bloodtestAppointments_list') {
                displayAppointments(firstName, lastName, "Test_Appointments", "bloodtestAppointmentsList");
                contentSections.forEach(section => section.classList.remove("active"));
                document.getElementById(targetId).classList.add("active");

            } else if (targetId === 'logout') {
                handleLogout();  
            }else if (targetId === "awareness") {
                displayAwarenessPosts();
            }else {
                contentSections.forEach(section => section.classList.remove("active"));
                document.getElementById(targetId).classList.add("active");
            }
        });
    });    
    
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(event) {
            event.preventDefault();
            const submenu = this.nextElementSibling;
            submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
        });
    });


    flatpickr("#donationdatetimePicker", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        minDate: "today"
    });

    flatpickr("#testdatetimePicker", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        minDate: "today"
    });

    
    const donationLocationSearch = document.getElementById("donationlocationSearch");
    const donationLocationDropdown = document.getElementById("donationlocationDropdown");

    
    async function fetchHospitals() {
        try {
            const hospitalsRef = collection(db, "Hospitals");
            const querySnapshot = await getDocs(hospitalsRef);

            donationLocationDropdown.innerHTML = "";

            querySnapshot.forEach((doc) => {
                const hospitalData = doc.data();
                const hospitalName = hospitalData.hospitalName;

                const div = document.createElement("div");
                div.setAttribute("data-value", hospitalName);
                div.textContent = hospitalName;

                donationLocationDropdown.appendChild(div);
            });
        } catch (error) {
            console.error("Error fetching hospitals:", error);
        }
    }

    fetchHospitals();

    donationLocationSearch.addEventListener('focus', () => {
        donationLocationDropdown.style.display = 'block';
    });

    document.addEventListener('click', function(event) {
        if (!donationLocationDropdown.contains(event.target) && !donationLocationSearch.contains(event.target)) {
            donationLocationDropdown.style.display = 'none';
        }
    });

    donationLocationSearch.addEventListener('input', function () {
        const filter = donationLocationSearch.value.toLowerCase();
        const items = donationLocationDropdown.querySelectorAll('div');

        let hasResults = false;
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(filter)) {
                item.style.display = '';
                hasResults = true;
            } else {
                item.style.display = 'none';
            }
        });

        if (!hasResults) {
            const noResultDiv = document.createElement('div');
            noResultDiv.textContent = "No results found";
            noResultDiv.classList.add('no-results');
            donationLocationDropdown.appendChild(noResultDiv);
        } else {
            const noResultDiv = donationLocationDropdown.querySelector('.no-results');
            if (noResultDiv) noResultDiv.remove();
        }
    });

    donationLocationDropdown.addEventListener('click', function(event) {
        if (event.target.tagName === 'DIV') {
            const selectedLocation = event.target.getAttribute('data-value');
            donationLocationSearch.value = event.target.textContent;
            donationLocationDropdown.style.display = 'none';
        }
    });

    const bookAppointmentButton = document.getElementById("donationButton");

    if (bookAppointmentButton) {
        bookAppointmentButton.addEventListener("click", async function() {
            const location = document.getElementById("donationlocationSearch").value;
            const dateTime = document.getElementById("donationdatetimePicker").value;
            if (!dateTime || !location) {
                alert("Please select a date, time, and location for the appointment.");
                return;
            }
            const documentId = `${firstName}_${lastName}`;
            try {
                const userDocRef = doc(db, "appointments", documentId);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    await setDoc(userDocRef, { userId, firstName, lastName });
                }
                const donationAppointmentsRef = collection(db, "appointments", documentId, "Donation_appointments");
                const conflictingAppointmentsQuery = query(donationAppointmentsRef, where("dateTime", "==", dateTime));
                const conflictingAppointmentsSnapshot = await getDocs(conflictingAppointmentsQuery);

                if (!conflictingAppointmentsSnapshot.empty) {
                    alert("You cannot book 2 appointments at the same time.");
                    return;
                }
                const donationDocsSnap = await getDocs(donationAppointmentsRef);
                const newDocId = (donationDocsSnap.size + 1).toString(); 
                await setDoc(doc(donationAppointmentsRef, newDocId), {
                    userId,
                    firstName,
                    lastName,
                    bloodGroup: document.getElementById("profileBloodGroup").textContent,
                    location,
                    dateTime
                });
                alert("Appointment booked successfully!");
            } catch (error) {
                console.error("Error saving appointment details:", error);
                alert("Error saving appointment details: " + error.message);
            }
        });
    } else {
        console.error("Book Appointment button not found.");
    }

    const testLocationSearch = document.getElementById("testlocationSearch");
    const testLocationDropdown = document.getElementById("testlocationDropdown");
 
    async function fetchTestHospitals() {
        try {
            const hospitalsRef = collection(db, "Hospitals");
            const querySnapshot = await getDocs(hospitalsRef);
    
            testLocationDropdown.innerHTML = "";
    
            querySnapshot.forEach((doc) => {
                const hospitalData = doc.data();
                const hospitalName = hospitalData.hospitalName;
    
                const div = document.createElement("div");
                div.setAttribute("data-value", hospitalName);
                div.textContent = hospitalName;
    
                testLocationDropdown.appendChild(div);
            });
        } catch (error) {
            console.error("Error fetching hospitals:", error);
        }
    }
    
    fetchTestHospitals();
    
    testLocationSearch.addEventListener('focus', () => {
        testLocationDropdown.style.display = 'block';
    });
    
    document.addEventListener('click', function(event) {
        if (!testLocationDropdown.contains(event.target) && !testLocationSearch.contains(event.target)) {
            testLocationDropdown.style.display = 'none';
        }
    });
    
    testLocationSearch.addEventListener('input', function () {
        const filter = testLocationSearch.value.toLowerCase();
        const items = testLocationDropdown.querySelectorAll('div');
    
        let hasResults = false;
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(filter)) {
                item.style.display = '';
                hasResults = true;
            } else {
                item.style.display = 'none';
            }
        });
    
        if (!hasResults) {
            const noResultDiv = document.createElement('div');
            noResultDiv.textContent = "No results found";
            noResultDiv.classList.add('no-results');
            testLocationDropdown.appendChild(noResultDiv);
        } else {
            const noResultDiv = testLocationDropdown.querySelector('.no-results');
            if (noResultDiv) noResultDiv.remove();
        }
    });
    
    testLocationDropdown.addEventListener('click', function(event) {
        if (event.target.tagName === 'DIV') {
            const selectedLocation = event.target.getAttribute('data-value');
            testLocationSearch.value = event.target.textContent;
            testLocationDropdown.style.display = 'none';
        }
    });

    
    const bookTestAppointmentButton = document.getElementById("bookAppointmentButton");
    if (bookTestAppointmentButton) {
        bookTestAppointmentButton.addEventListener("click", async function () {
            const location = document.getElementById("testlocationSearch").value;
            const dateTime = document.getElementById("testdatetimePicker").value;

            if (!dateTime || !location) {
                alert("Please select a date, time, and location for the appointment.");
                return;
            }

            const documentId = `${firstName}_${lastName}`;

            try {
                const userDocRef = doc(db, "appointments", documentId);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    await setDoc(userDocRef, { userId, firstName, lastName });
                }

                const testAppointmentsRef = collection(db, "appointments", documentId, "Test_Appointments");

                const conflictingAppointmentsQuery = query(testAppointmentsRef, where("dateTime", "==", dateTime));
                const conflictingAppointmentsSnapshot = await getDocs(conflictingAppointmentsQuery);


                if (!conflictingAppointmentsSnapshot.empty) {
                    
                    alert("You cannot book 2 appointments at the same time.");
                    return;
                }
                
                const testDocsSnap = await getDocs(testAppointmentsRef);
                const newDocId = (testDocsSnap.size + 1).toString(); 

             
                await setDoc(doc(testAppointmentsRef, newDocId), {
                    userId,
                    firstName,
                    lastName,
                    bloodGroup: document.getElementById("profileBloodGroup").textContent,
                    location,
                    dateTime
                });

                alert("Blood Test Appointment booked successfully!");
            } catch (error) {
                console.error("Error saving appointment details:", error);
                alert("Error saving appointment details: " + error.message);
            }
        });
    } else {
        console.error("Book Blood Test Appointment button not found.");
    }

    async function displayAppointments(firstName, lastName, subCollectionName, listElementId) {
        const appointmentsList = document.getElementById(listElementId);
        if (appointmentsList) {
            appointmentsList.innerHTML = '';
    
            const documentId = `${firstName}_${lastName}`;
            const appointmentsRef = collection(db, "appointments", documentId, subCollectionName);
            const q = query(appointmentsRef, orderBy("dateTime", "asc"));
            const querySnapshot = await getDocs(q);
    
            if (!querySnapshot.empty) {
                querySnapshot.forEach((docSnap) => {
                    const appointmentData = docSnap.data();
                    const appointmentId = docSnap.id;  
                    const appointmentBox = document.createElement("div");
                    appointmentBox.classList.add("appointment-box");
    
                    
                    appointmentBox.innerHTML = `Date: ${appointmentData.dateTime}, Location: ${appointmentData.location} 
                        <button class="cancel-button" data-id="${appointmentId}">Cancel</button>`;
    
                    
                    appointmentsList.appendChild(appointmentBox);
                });
    
                const cancelButtons = document.querySelectorAll(".cancel-button");
                cancelButtons.forEach(button => {
                    button.addEventListener("click", async (event) => {
                        const appointmentId = event.target.getAttribute("data-id");
    
                        if (confirm("Are you sure you want to cancel this appointment?")) {
                            await deleteAppointment(firstName, lastName, subCollectionName, appointmentId);
                        }
                    });
                });
            } else {
                const noAppointmentBox = document.createElement("div");
                noAppointmentBox.classList.add("appointment-box");
                noAppointmentBox.textContent = "No appointments found.";
                appointmentsList.appendChild(noAppointmentBox);
            }
        } else {
            console.error(`${listElementId} element not found.`);
        }
    }            

    async function deleteAppointment(firstName, lastName, subCollectionName, appointmentId) {
        try {
            const documentId = `${firstName}_${lastName}`;
            const appointmentDocRef = doc(db, "appointments", documentId, subCollectionName, appointmentId);

            await deleteDoc(appointmentDocRef);
            alert("Appointment cancelled successfully!");

            displayAppointments(firstName, lastName, subCollectionName, "donationAppointmentsList");
        } catch (error) {
            console.error("Error cancelling appointment:", error);
            alert("Error cancelling appointment: " + error.message);
        }
    }

    function displayAwarenessPosts() {
        const awarenessPostsContainer = document.getElementById("awarenessPosts");

        awarenessPostsContainer.innerHTML = '';

        const posts = [
            {
                title: "The Importance of Blood Donation",
                content: "Blood donation is crucial as it helps save lives. A single donation can save up to three people. Your contribution can help in surgeries, accidents, and severe illnesses."
            },
            {
                title: "Health Benefits of Donating Blood",
                content: "Donating blood is not only good for the recipient but also beneficial for the donor. Regular blood donation helps in maintaining a healthy heart and liver, reduces the risk of cancer, and improves overall cardiovascular health."
            },
            {
                title: "Who Can Donate Blood?",
                content: "Healthy individuals between the ages of 18 and 65, weighing at least 50kg, can donate blood. It's important to ensure you meet the eligibility criteria before donating to ensure both your safety and the recipient's."
            }
        ];

        posts.forEach(post => {
            const postDiv = document.createElement("div");
            postDiv.classList.add("awareness-post");

            postDiv.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content}</p>
            `;

            awarenessPostsContainer.appendChild(postDiv);
        });

        contentSections.forEach(section => section.classList.remove("active"));
        document.getElementById("awareness").classList.add("active");
    }
});