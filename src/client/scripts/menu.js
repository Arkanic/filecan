export const stopLoading = () => {
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("content").classList.remove("content");
}

export const setupMenu = () => {
    // hide or show the password box based on whether or not the server needs a password to upload
}