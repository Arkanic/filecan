export const stopLoading = () => {
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("content").classList.remove("content");
}