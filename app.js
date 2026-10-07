const menuToggle = document.querySelector("#menuToggle");
const siteNav = document.querySelector("#siteNav");
const mobileNavigation = window.matchMedia("(max-width: 920px)");

function closeMobileMenu() {
  if (!menuToggle || !siteNav) return;
  menuToggle.setAttribute("aria-expanded", "false");
  siteNav.classList.remove("is-open");
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(open));
    siteNav.classList.toggle("is-open", open);
  });
  siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMobileMenu));
  document.addEventListener("click", (event) => {
    if (!siteNav.contains(event.target) && !menuToggle.contains(event.target)) closeMobileMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });
  const closeMenuWhenDesktop = (event) => {
    if (!event.matches) closeMobileMenu();
  };
  if (typeof mobileNavigation.addEventListener === "function") {
    mobileNavigation.addEventListener("change", closeMenuWhenDesktop);
  } else if (typeof mobileNavigation.addListener === "function") {
    mobileNavigation.addListener(closeMenuWhenDesktop);
  }
}

document.querySelectorAll("[data-gallery]").forEach((gallery) => {
  const track = gallery.querySelector(".gallery-track");
  const slides = [...gallery.querySelectorAll(".gallery-slide")];
  const previous = gallery.querySelector("[data-gallery-prev]");
  const next = gallery.querySelector("[data-gallery-next]");
  const counter = gallery.querySelector("[data-gallery-counter]");
  const dotsContainer = gallery.querySelector("[data-gallery-dots]");
  let activeIndex = 0;
  let pointerStart = null;
  if (!track || slides.length === 0) return;

  const dots = slides.map((slide, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "gallery-dot";
    dot.setAttribute("aria-label", "ดูภาพที่ " + (index + 1));
    dot.addEventListener("click", () => showSlide(index));
    dotsContainer?.append(dot);
    return dot;
  });

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    track.style.transform = "translateX(-" + (activeIndex * 100) + "%)";
    if (counter) counter.textContent = String(activeIndex + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
    slides.forEach((slide, slideIndex) => slide.setAttribute("aria-hidden", String(slideIndex !== activeIndex)));
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
      dot.setAttribute("aria-current", String(dotIndex === activeIndex));
    });
  }

  previous?.addEventListener("click", () => showSlide(activeIndex - 1));
  next?.addEventListener("click", () => showSlide(activeIndex + 1));
  gallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showSlide(activeIndex - 1);
    if (event.key === "ArrowRight") showSlide(activeIndex + 1);
  });
  gallery.addEventListener("pointerdown", (event) => {
    pointerStart = { x: event.clientX, y: event.clientY };
  });
  gallery.addEventListener("pointerup", (event) => {
    if (!pointerStart) return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      showSlide(activeIndex + (deltaX < 0 ? 1 : -1));
    }
    pointerStart = null;
  });
  gallery.addEventListener("pointercancel", () => { pointerStart = null; });

  if (slides.length < 2) {
    if (previous) previous.hidden = true;
    if (next) next.hidden = true;
    if (dotsContainer) dotsContainer.hidden = true;
    if (counter) counter.hidden = true;
  }
  showSlide(0);
});

const tourMode = document.querySelector("[data-tour-mode]");
if (tourMode) {
  const frame = document.querySelector(".campus-tour-embed");
  tourMode.addEventListener("click", () => frame?.requestFullscreen?.());
}


// Filter rooms without resetting each room's selected photo.
const placeCards = [...document.querySelectorAll('[data-place-category]')];
document.querySelectorAll('[data-place-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.placeFilter;
    document.querySelectorAll('[data-place-filter]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    let count = 0;
    placeCards.forEach(card => {
      card.hidden = category !== 'all' && card.dataset.placeCategory !== category;
      if (!card.hidden) count++;
    });
    const counter = document.querySelector('[data-places-count]');
    if (counter) counter.textContent = count + ' พื้นที่การเรียนรู้';
  });
});

const teacherFilter = document.querySelector('[data-teacher-filter]');
teacherFilter?.addEventListener('change', () => {
  let count = 0;
  document.querySelectorAll('[data-teacher-subject]').forEach(card => {
    card.hidden = teacherFilter.value !== 'all' && card.dataset.teacherSubject !== teacherFilter.value;
    if (!card.hidden) count++;
  });
  const label = document.querySelector('[data-teacher-count]');
  if (label) label.textContent = count + ' คน';
});
const tourDialog = document.querySelector("#tourDialog");
const tourDialogFrame = document.querySelector("#tourDialogFrame");
const tourDialogTitle = document.querySelector("#tourDialogTitle");
const tourSceneCards = [...document.querySelectorAll("[data-tour-scene]")];
const panoeeTourOrigin = "https://tour.panoee.net";
let activeTourScene = "";
let tourFrameReady = false;

function openTourScene(scene, title, updateHistory = true) {
  if (!tourDialog || !tourDialogFrame || !scene) return;
  activeTourScene = scene;
  tourFrameReady = false;
  if (tourDialogTitle) tourDialogTitle.textContent = title || "ชมทัวร์ 360°";
  tourDialogFrame.src = panoeeTourOrigin + "/6abf2206fce8ddf28c6a1011/" + encodeURIComponent(scene);
  if (!tourDialog.open) tourDialog.showModal();
  if (updateHistory) {
    const url = new URL(window.location.href);
    url.searchParams.set("scene", scene);
    window.history.pushState({ ...(window.history.state || {}), tourDialog: true }, "", url);
  }
}

function closeTourScene(fromPopState = false) {
  if (!tourDialog || !tourDialog.open) return;
  tourDialog.close();
  tourDialogFrame?.removeAttribute("src");
  activeTourScene = "";
  tourFrameReady = false;
  if (!fromPopState) {
    if (window.history.state?.tourDialog) {
      window.history.back();
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete("scene");
      window.history.replaceState(window.history.state, "", url);
    }
  }
}

tourSceneCards.forEach(card => card.addEventListener("click", () => {
  if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission().catch(() => {});
  }
  openTourScene(card.dataset.tourScene, card.dataset.tourTitle, true);
}));
document.querySelectorAll("[data-tour-close]").forEach(button => button.addEventListener("click", () => closeTourScene()));
tourDialog?.addEventListener("click", event => {
  if (event.target === tourDialog) closeTourScene();
});
tourDialog?.addEventListener("cancel", () => {
  if (window.history.state?.tourDialog) window.history.back();
  else {
    const url = new URL(window.location.href);
    url.searchParams.delete("scene");
    window.history.replaceState(window.history.state, "", url);
  }
});
tourDialogFrame?.addEventListener("load", () => { tourFrameReady = true; });
window.addEventListener("devicemotion", event => {
  if (!tourFrameReady || !tourDialogFrame?.contentWindow || !activeTourScene) return;
  const sample = (value, keys) => value ? Object.fromEntries(keys.map(key => [key, typeof value[key] === "number" ? value[key] : null])) : null;
  tourDialogFrame.contentWindow.postMessage({
    type: "devicemotion",
    deviceMotionEvent: {
      acceleration: sample(event.acceleration, ["x", "y", "z"]),
      accelerationIncludingGravity: sample(event.accelerationIncludingGravity, ["x", "y", "z"]),
      rotationRate: sample(event.rotationRate, ["alpha", "beta", "gamma"]),
      interval: typeof event.interval === "number" ? event.interval : 0,
      timeStamp: event.timeStamp
    }
  }, panoeeTourOrigin);
}, { passive: true });
window.addEventListener("popstate", () => {
  const scene = new URL(window.location.href).searchParams.get("scene");
  if (scene) {
    const card = tourSceneCards.find(item => item.dataset.tourScene === scene);
    openTourScene(scene, card?.dataset.tourTitle || "ชมทัวร์ 360°", false);
  } else closeTourScene(true);
});
const initialTourScene = new URL(window.location.href).searchParams.get("scene");
if (initialTourScene && tourSceneCards.some(card => card.dataset.tourScene === initialTourScene)) {
  const card = tourSceneCards.find(item => item.dataset.tourScene === initialTourScene);
  openTourScene(initialTourScene, card.dataset.tourTitle, false);
}
