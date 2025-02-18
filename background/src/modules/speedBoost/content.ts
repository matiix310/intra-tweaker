const customStyles = `
.managers img {
    border-radius: 5px !important;
}`;

var style = document.createElement("style");
style.innerHTML = customStyles;
document.head.appendChild(style);

document.getElementsByClassName("avatar")[0].setAttribute("alt", "");
