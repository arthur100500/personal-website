/* Toggle between adding and removing the "responsive" class to navbar when the user clicks on the icon */
function changeNavbar() {
    let nb = document.getElementById("navbar");
    let xp = document.getElementById("navbar-burger")
    if (nb.className === "navbar") {
        nb.className += " responsive";
        xp.innerHTML = "<i class=\"fa fa-times\" aria-hidden=\"true\"></i>\n";
    } else {
        nb.className = "navbar";
        xp.innerHTML = "<i class=\"fa fa-bars\" aria-hidden=\"true\"></i>";
    }
}