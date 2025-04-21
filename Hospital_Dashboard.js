import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, query, orderBy, limit, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
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

document.addEventListener("DOMContentLoaded", async function() {

    const dropdownBtns = document.querySelectorAll(".dropdown-toggle");
    const sidebarLinks = document.querySelectorAll(".sidebar-link");
    const contentSections = document.querySelectorAll(".content-section");
    const appointmentsList = document.getElementById("pendingList"); 
    const donorsRecordList = document.getElementById('donorsRecordList');
   
    async function showPendingList() {
        contentSections.forEach(section => section.style.display = "none"); 
        const pendingListSection = document.getElementById("pendingList"); 
        pendingListSection.style.display = "block"; 

        await fetchAppointments(); 
    }
    await showPendingList();

    function handleLogout() {
        signOut(auth).then(() => {

            localStorage.clear();
            window.location.href = "Login_container.html";

        }).catch((error) => {
            console.error("Error signing out: ", error);
        });
    }

   
    dropdownBtns.forEach(button => {
        button.addEventListener("click", function(event) {
            event.preventDefault();
            this.classList.toggle("active");

            const dropdownContent = this.nextElementSibling;
            dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";

        });
    });

    
    sidebarLinks.forEach(link => {
        link.addEventListener("click", async function(event) {
            event.preventDefault();
            const targetId = this.getAttribute("data-target");

            if (targetId === "logout") {
                handleLogout(); 
                return; 
            }

            contentSections.forEach(section => section.style.display = "none");
            document.getElementById(targetId).style.display = "block";

            if (targetId === "pendingList") {
                await fetchAppointments(); 

            }else if (targetId === "donorsRecord") {
                await fetchDonorsRecords();

            }else if (targetId === "storage1" || targetId === "storage2" || targetId === "storage3" || targetId === "storage4") {
                await fetchStorageData(targetId);
                
            }else if (targetId === "awareness") {
                displayAwarenessPosts();
            }
        });
    });

    async function fetchAppointments() {
        try {
            const querySnapshot = await getDocs(collection(db, "appointments"));
            appointmentsList.innerHTML = ''; 
    
            for (const donorDoc of querySnapshot.docs) {
                const donorData = donorDoc.data();
                const donorId = donorDoc.id;
    
                const firstName = donorData.firstName || "Unknown";
                const lastName = donorData.lastName || "Unknown";
    
                async function fetchAndDisplaySubCollection(subCollectionName) {
                    const subCollectionSnapshot = await getDocs(collection(db, "appointments", donorId, subCollectionName));
                    subCollectionSnapshot.forEach(doc => {
                        const appointmentData = doc.data();
    
                        const displayFirstName = appointmentData.firstName || firstName;
                        const displayLastName = appointmentData.lastName || lastName;
    
                        const appointmentDiv = document.createElement("div");
                        appointmentDiv.classList.add("appointment-box");
    
                        appointmentDiv.innerHTML = `
                            <p><strong>Donor Name:</strong> ${displayFirstName} ${displayLastName}</p>
                            <p><strong>Date and Time:</strong> ${appointmentData.dateTime}</p>
                            <p><strong>Location:</strong> ${appointmentData.location}</p>
                            <p><strong>Blood Group:</strong> ${appointmentData.bloodGroup}</p>
                            <p><strong>Appointment Type:</strong> ${subCollectionName.replace('_', ' ').replace('appointments', 'Appointment')}</p>
                            <div class="appointment-buttons">
                                <button class="done-button">Done</button>
                                <button class="cancel-button">Cancelled</button>
                            </div>
                        `;
                        appointmentDiv.querySelector(".cancel-button").addEventListener("click", async function () {
                            await deleteAppointment(donorId, subCollectionName, doc.id); 
                            appointmentDiv.remove(); 
                        });

                        appointmentDiv.querySelector(".done-button").addEventListener("click", async function () {
                            const appointmentType = subCollectionName.replace('_', ' ').replace('appointments', 'Appointment');
                            await moveToDonorRecords(donorId, subCollectionName, doc.id, appointmentData, { firstName: displayFirstName, lastName: displayLastName }, appointmentType);
                            appointmentDiv.remove(); 
                        });
                        appointmentsList.appendChild(appointmentDiv);
                    });
                }
    
                await fetchAndDisplaySubCollection("Donation_appointments");
                await fetchAndDisplaySubCollection("Test_Appointments");
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
        }
    }             

    async function moveToDonorRecords(donorId, subCollectionName, appointmentId, appointmentData, donorData, appointmentType) {
        try {
            const firstName = donorData.firstName || appointmentData.firstName || "Unknown";
            const lastName = donorData.lastName || appointmentData.lastName || "Unknown";

            const donorDocRef = doc(db, "History", donorId);
            await setDoc(donorDocRef, {
            });
    
            const appointmentsSubColRef = collection(donorDocRef, "appointments_TEST");

            const newAppointmentDocRef = doc(appointmentsSubColRef);
            await setDoc(newAppointmentDocRef, {
                ...appointmentData,
                firstName: firstName,
                lastName: lastName,
                appointmentType: appointmentType
            });
    
            await deleteDoc(doc(db, "appointments", donorId, subCollectionName, appointmentId));
        } catch (error) {
            console.error("Error moving appointment to Donor Records:", error);
        }
    }       


    async function fetchDonorsRecords() { 
        try {
            const querySnapshot = await getDocs(collection(db, "History"));
            
            if (querySnapshot.empty) {
                
                donorsRecordList.innerHTML = '<p>No donor records found.</p>';
                return;
            }
            donorsRecordList.innerHTML = '';  

            for (const donorDoc of querySnapshot.docs) {
                const donorId = donorDoc.id;
                const donorName = donorId;

            async function fetchAndDisplaydonorrecord(subCollectionName) {
                const donorsQuerySnapshot = await getDocs(collection(db, "History", donorId, subCollectionName));                    

            donorsQuerySnapshot.forEach(async (donorDoc) => {
                const donorId = donorDoc.id;
                const appointmentData = donorDoc.data();

                const donorDiv = document.createElement("div");
                donorDiv.classList.add("donor-section");
                donorDiv.innerHTML = `<h3>${donorName.replace('_', ' ')}</h3>`;

                if (!appointmentData.empty) {
                        const appointmentDiv = document.createElement("div");
                        appointmentDiv.classList.add("appointment-box");

                        appointmentDiv.innerHTML = `
                            <p><strong>Donor Name:</strong> ${appointmentData.firstName || 'N/A'} ${appointmentData.lastName || 'N/A'}</p>
                            <p><strong>Date and Time:</strong> ${appointmentData.dateTime || 'N/A'}</p>
                            <p><strong>Location:</strong> ${appointmentData.location || 'N/A'}</p>
                            <p><strong>Blood Group:</strong> ${appointmentData.bloodGroup || 'N/A'}</p>
                            <p><strong>Appointment Type:</strong> ${appointmentData.appointmentType || 'N/A'}</p>
                        `;

                        donorDiv.appendChild(appointmentDiv);
                } else {
                    const noAppointmentsDiv = document.createElement("div");
                    noAppointmentsDiv.classList.add("no-appointments");
                    noAppointmentsDiv.innerHTML = `<p>No appointments found for ${donorId.replace('_', ' ')}</p>`;
                    donorDiv.appendChild(noAppointmentsDiv);
                }

                donorsRecordList.appendChild(donorDiv);
               
            });
        }
        await fetchAndDisplaydonorrecord("appointments_TEST");

    }} catch (error) {
        console.error("Error fetching donor records:", error);
        donorsRecordList.innerHTML = '<p>Error fetching donor records.</p>';
    }}

    async function findNearestBloodStorage(address) {
        try {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: address }, async function (results, status) {
                if (status === 'OK') {
                    const hospitalLocation = results[0].geometry.location;

                    const storageDocRef = doc(db, "Blood Storage", "StorageLocations");
                    const storageDoc = await getDoc(storageDocRef);

                    if (storageDoc.exists()) {
                        const storageData = storageDoc.data();
                        const locations = [];

                        for (const [key, geoPoint] of Object.entries(storageData)) {
                            if (geoPoint && geoPoint.latitude && geoPoint.longitude) {
                                locations.push({
                                    name: key,
                                    location: new google.maps.LatLng(geoPoint.latitude, geoPoint.longitude)
                                });
                            } else {
                                console.error("Invalid GeoPoint data for storage location: ", key);
                            }
                        }

                        if (locations.length > 0) {
                            calculateDistances(hospitalLocation, locations);
                        } else {
                            document.getElementById("nearestStorage").textContent = "No storage location found.";
                        }
                    } 
                } else {
                    console.error('Geocode was not successful for the following reason: ' + status);
                }
            });
        } catch (error) {
            console.error("Error finding nearest blood storage:", error);
        }
    }

    function calculateDistances(hospitalLocation, locations) {
        const service = new google.maps.DistanceMatrixService();
        const destinationLocations = locations.map(location => location.location);

        service.getDistanceMatrix({
            origins: [hospitalLocation],
            destinations: destinationLocations,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
        }, (response, status) => {
            if (status !== google.maps.DistanceMatrixStatus.OK) {
                console.error('Error with DistanceMatrixService:', status);
            } else {
                displayResults(response, locations);
            }
        });
    }

    function displayResults(response, locations) {
        const results = response.rows[0].elements;
        const sortedLocations = [];

        for (let i = 0; i < results.length; i++) {
            sortedLocations.push({
                name: locations[i].name,
                distance: results[i].distance.text,
                duration: results[i].duration.text
            });
        }

        sortedLocations.sort((a, b) => {
            const distanceA = parseFloat(a.distance.replace('km', '').trim());
            const distanceB = parseFloat(b.distance.replace('km', '').trim());
            return distanceA - distanceB;
        });

        let output = 'Storage Locations: <br>';
        sortedLocations.forEach(location => {
            output += `${location.name},<br>
                        distance: ${location.distance},<br>
                        Estimated Time: ${location.duration}<br><br>`;
        });

        document.getElementById("nearestStorage").innerHTML = output;
    }

    document.getElementById("searchButton").addEventListener("click", function () {
        const address = document.getElementById("addressInput").value;
        findNearestBloodStorage(address);
    });
    
    async function fetchStorageData(storageId) {
        const storageDocId = storageId.replace("storage", "Storage"); 
        const storageDocRef = doc(db, "Blood Storage", storageDocId);
        const storageDoc = await getDoc(storageDocRef);

        if (storageDoc.exists()) {
            const storageData = storageDoc.data();
            const storageContentDiv = document.getElementById(`${storageId}Content`);
            storageContentDiv.innerHTML = '';  

            for (const [bloodType, quantity] of Object.entries(storageData)) {
                const storageDiv = document.createElement("div");
                storageDiv.classList.add("storage-box");

                storageDiv.innerHTML = `
                    <p><strong>${bloodType} => </strong> ${quantity}</p>
                    <button class="order-button" data-blood-type="${bloodType}" data-storage-id="${storageDocId}">Order</button>
                `;

                storageContentDiv.appendChild(storageDiv);
            }

            const orderButtons = storageContentDiv.querySelectorAll(".order-button");
            orderButtons.forEach(button => {
                button.addEventListener("click", function() {
                    const bloodType = this.getAttribute("data-blood-type");
                    const storageId = this.getAttribute("data-storage-id");
                    showOrderForm(bloodType, storageId);
                });
            });
        } 
    }

    function showOrderForm(bloodType, storageId) {

        const storageDocRef = doc(db, "Blood Storage", storageId);
        getDoc(storageDocRef).then((docSnapshot) => {
            if (docSnapshot.exists()) {
                const storageData = docSnapshot.data();
                const availableQuantity = storageData[bloodType];
    
                const formHtml = `
                    <div id="orderForm" class="order-form-popup">
                        <div class="order-form-content">
                            <h2>Order Blood</h2>
                            <form>
                                <label for="hospitalName">Hospital Name:</label>
                                <input type="text" id="hospitalName" name="hospitalName" required><br>
    
                                <label for="hospitalAddress">Hospital Address:</label>
                                <input type="text" id="hospitalAddress" name="hospitalAddress" required><br>
    
                                <label for="referenceNumber">Reference Number:</label>
                                <input type="text" id="referenceNumber" name="referenceNumber" required><br>
    
                                <label for="bloodGroup">Blood Group:</label>
                                <input type="text" id="bloodGroup" name="bloodGroup" value="${bloodType}" readonly><br>
    
                                <label for="bloodQuantity">Blood Quantity:</label>
                                <input type="number" id="bloodQuantity" name="bloodQuantity" required
                                       min="1" max="${availableQuantity}"><br>
                                       
                                <button type="submit">Submit Order</button>
                                <button type="button" id="cancelOrder">Cancel</button>
                            </form>
                        </div>
                    </div>
                `;
    
                document.body.insertAdjacentHTML('beforeend', formHtml);
    
                document.getElementById("cancelOrder").addEventListener("click", function() {
                    document.getElementById("orderForm").remove();
                });
    
                document.getElementById("bloodQuantity").addEventListener("input", function() {
                    const quantity = parseInt(this.value, 10);
                    if (quantity < 1 || quantity > availableQuantity) {
                        alert(`Please enter a valid quantity (1 to ${availableQuantity}).`);
                        this.value = '';
                    }
                });
    
                
                document.querySelector("#orderForm form").addEventListener("submit", async function(event) {
                    event.preventDefault();
    
                    
                    const hospitalName = document.getElementById("hospitalName").value;
                    const hospitalAddress = document.getElementById("hospitalAddress").value;
                    const referenceNumber = document.getElementById("referenceNumber").value;
                    const bloodGroup = document.getElementById("bloodGroup").value;
                    const bloodQuantity = parseInt(document.getElementById("bloodQuantity").value, 10);
                    const orderDate = new Date().toLocaleString();
    
                    if (bloodQuantity < 1 || bloodQuantity > availableQuantity) {
                        alert(`Invalid quantity. Please enter a value between 1 and ${availableQuantity}.`);
                        return;
                    }
    
                    const hospitalRef = `${hospitalName}_${referenceNumber}`;
    
                    try {
                        const bloodOrderRef = collection(db, "Order", hospitalRef, "Blood Order");
    
                        const q = query(bloodOrderRef, orderBy("orderId", "desc"), limit(1));
                        const querySnapshot = await getDocs(q);
                        let nextId = 1;
                        if (!querySnapshot.empty) {
                            const lastDoc = querySnapshot.docs[0];
                            nextId = lastDoc.data().orderId + 1;
                        }
    
                        await setDoc(doc(bloodOrderRef, `${nextId}`), {
                            hospitalName: hospitalName,
                            hospitalAddress: hospitalAddress,
                            bloodGroup: bloodGroup,
                            quantity: bloodQuantity,
                            orderDate: orderDate,
                            storageId: storageId,
                            orderId: nextId
                        });
    
                        const newQuantity = availableQuantity - bloodQuantity;
                        await setDoc(storageDocRef, { [bloodGroup]: newQuantity }, { merge: true });

                        alert("Order submitted successfully!!!");

                        document.getElementById("orderForm").remove();
                    } catch (error) {
                        console.error("Error saving order or updating stock:", error);
                    }
                });
            } 
        }).catch((error) => {
            console.error("Error fetching storage data:", error);
        });
    }
    async function deleteAppointment(donorId, subCollectionName, appointmentId) {
        try {
            await deleteDoc(doc(db, "appointments", donorId, subCollectionName, appointmentId));

        } catch (error) {
            console.error("Error deleting appointment:", error);
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
    }
});