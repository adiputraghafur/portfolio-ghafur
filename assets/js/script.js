const menutoggle = document.getElementById("menu-toggle");
const navlinks = document.getElementById("nav-links-menu");
if (menutoggle && navlinks) {
  menutoggle.addEventListener("click", function () {
    navlinks.classList.toggle("active");
  });
}
function startslider() {
  const images = document.querySelectorAll(".slider-image");
  if (images.length === 0) return;
  let current = 0;
  function nextslide() {
    images[current].classList.remove("active");
    current = (current + 1) % images.length;
    images[current].classList.add("active");
  }
  setInterval(nextslide, 10000);
}
document.addEventListener("DOMContentLoaded", startslider);
function setupportfoliofilter() {
  const filterbuttons = document.querySelectorAll(".filter-btn");
  const portfolioitems = document.querySelectorAll(".portfolio-item");
  filterbuttons.forEach((button) => {
    button.addEventListener("click", function () {
      const filter = this.getAttribute("data-filter");
      filterbuttons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      portfolioitems.forEach((item) => {
        const itemcategory = item.getAttribute("data-category");
        if (filter === "all" || itemcategory === filter) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  });
}
document.addEventListener("DOMContentLoaded", setupportfoliofilter);
