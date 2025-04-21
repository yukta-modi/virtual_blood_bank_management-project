document.addEventListener("DOMContentLoaded", function() {
    console.log("External script loaded and executed.");

    const testButton = document.getElementById("test-button");
    if (testButton) {
        testButton.addEventListener("click", function() {
            console.log("Button clicked");
            alert("Button clicked!");
        });
    }
});