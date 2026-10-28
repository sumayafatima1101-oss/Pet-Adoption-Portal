const API_BASE = (window.PET_PORTAL_API || "http://localhost:3000/api").replace(/\/$/, "");

const samplePets = [
  {id:"demo-1",name:"Mochi",species:"dog",breed:"Indie mix",age:1,description:"A happy little explorer who loves gentle walks and new friends.",image_url:"https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80",status:"available"},
  {id:"demo-2",name:"Peaches",species:"cat",breed:"Domestic shorthair",age:2,description:"A soft-hearted nap expert who enjoys sunny windows and quiet cuddles.",image_url:"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",status:"available"},
  {id:"demo-3",name:"Kiwi",species:"bird",breed:"Budgie",age:1,description:"A curious little chatterbox who needs a safe, enriching home.",image_url:"https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=900&q=80",status:"available"},
  {id:"demo-4",name:"Daisy",species:"horse",breed:"Indian country horse",age:6,description:"A gentle horse who needs experienced, responsible equine care.",image_url:"https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=900&q=80",status:"available"},
  {id:"demo-5",name:"Bubbles",species:"fish",breed:"Betta fish",age:1,description:"A bright swimmer who needs a properly maintained, suitable aquarium.",image_url:"https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=900&q=80",status:"available"},
  {id:"demo-6",name:"Shelly",species:"turtle",breed:"Red-eared slider",age:3,description:"A calm turtle who needs a species-appropriate habitat and long-term care.",image_url:"https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=900&q=80",status:"available"},
  {id:"demo-7",name:"Clover",species:"rabbit",breed:"Mini lop",age:1,description:"A gentle bunny who loves space to hop, hide and explore safely.",image_url:"https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=80",status:"available"},
  {id:"demo-8",name:"Pip",species:"hamster",breed:"Syrian hamster",age:1,description:"A tiny night-time adventurer who needs a spacious, enriched enclosure.",image_url:"https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=900&q=80",status:"pending"},
  {id:"demo-9",name:"Mango",species:"guinea pig",breed:"American guinea pig",age:2,description:"A sweet little veggie fan who thrives with companionship and daily care.",image_url:"https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80",status:"available"}
];

const state = { pets: [...samplePets], usingDemoData: true, adminKey: "", toastTimer: null };
const $ = (id) => document.getElementById(id);
const petGrid = $("petGrid");
const dialog = $("petDialog");

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[char]);
}
function titleCase(value = "") {
  return String(value).replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}
function showMessage(element, message, type = "") {
  element.textContent = message;
  element.className = `form-message ${type}`.trim();
}
async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body;
}
function renderPets() {
  const query = $("searchInput").value.trim().toLowerCase();
  const species = $("speciesFilter").value;
  const status = $("statusFilter").value;
  const filtered = state.pets.filter((pet) => {
    const searchable = `${pet.name} ${pet.species} ${pet.breed || ""} ${pet.description || ""}`.toLowerCase();
    return (!query || searchable.includes(query)) &&
      (species === "all" || pet.species.toLowerCase() === species) &&
      (status === "all" || pet.status === status);
  });
  $("resultsLine").textContent = `${filtered.length} little ${filtered.length === 1 ? "friend" : "friends"} found${state.usingDemoData ? " · sample preview" : ""}`;
  $("emptyState").classList.toggle("hidden", filtered.length !== 0);
  petGrid.innerHTML = filtered.map((pet) => {
    const available = pet.status === "available";
    const ageText = pet.age === null || pet.age === undefined ? "Age not listed" : `${pet.age} ${Number(pet.age) === 1 ? "year" : "years"} old`;
    const safeImage = escapeHtml(pet.image_url || "");
    return `<article class="pet-card">
      <div class="pet-image-wrap">
        <img class="pet-image" src="${safeImage}" alt="${escapeHtml(pet.name)} the ${escapeHtml(pet.species)}" loading="lazy"
          onerror="this.onerror=null;this.src='https://placehold.co/700x500/ffedf4/9b476b?text=Little+Paw';">
        <span class="pet-tag">${escapeHtml(titleCase(pet.species))}</span>
        <span class="pet-status ${escapeHtml(pet.status)}">${escapeHtml(pet.status)}</span>
      </div>
      <div class="pet-info">
        <div class="pet-title-row"><h3>${escapeHtml(pet.name)}</h3><span class="pet-age">${escapeHtml(ageText)}</span></div>
        <p class="pet-breed">${escapeHtml(pet.breed || "Lovely companion")}</p>
        <p class="pet-description">${escapeHtml(pet.description || "A lovely friend looking for a caring home.")}</p>
        <div class="pet-card-footer"><small>Ready for love? ♡</small><button class="adopt-button" data-adopt="${escapeHtml(pet.id)}" ${available ? "" : "disabled"}>${available ? "Meet & adopt ♡" : "Not available"}</button></div>
      </div>
    </article>`;
  }).join("");
}
async function loadPets() {
  try {
    const result = await apiRequest("/pets");
    const pets = Array.isArray(result) ? result : result.pets;
    if (Array.isArray(pets)) {
      state.pets = pets;
      state.usingDemoData = false;
    }
  } catch (error) {
    state.pets = [...samplePets];
    state.usingDemoData = true;
    console.info("Using sample pets. Start the backend and configure Supabase to load database pets.");
  }
  renderPets();
}
function openAdoptionDialog(pet) {
  if (!pet || pet.status !== "available") return;
  $("petId").value = pet.id;
  $("dialogPetSummary").innerHTML = `<img src="${escapeHtml(pet.image_url || "")}" alt=""><div><h3>${escapeHtml(pet.name)}</h3><p>${escapeHtml(titleCase(pet.species))} · ${escapeHtml(pet.breed || "Lovely companion")}</p></div>`;
  $("adoptionForm").reset();
  $("petId").value = pet.id;
  showMessage($("formMessage"), "");
  if (typeof dialog.showModal === "function") dialog.showModal();
  else showToast("Your browser does not support this adoption form. Please try a recent browser.");
}
petGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-adopt]");
  if (!button) return;
  const pet = state.pets.find((item) => String(item.id) === button.dataset.adopt);
  openAdoptionDialog(pet);
});
$("dialogClose").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
$("searchInput").addEventListener("input", renderPets);
$("speciesFilter").addEventListener("change", renderPets);
$("statusFilter").addEventListener("change", renderPets);

$("adoptionForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const payload = {
    pet_id: $("petId").value,
    applicant_name: $("applicantName").value.trim(),
    email: $("applicantEmail").value.trim(),
    phone: $("applicantPhone").value.trim(),
    reason: $("applicantReason").value.trim()
  };
  if (payload.applicant_name.length < 2 || payload.reason.length < 10) {
    showMessage($("formMessage"), "Please enter your name and a reason of at least 10 characters.", "error");
    return;
  }
  const button = $("submitRequest");
  button.disabled = true;
  button.textContent = "Sending...";
  try {
    if (state.usingDemoData) {
      showMessage($("formMessage"), "Demo mode: the backend is not connected, so this request was not saved. Start the backend and configure Supabase to submit it.", "error");
      return;
    }
    await apiRequest("/adoption-requests", { method: "POST", body: JSON.stringify(payload) });
    showMessage($("formMessage"), "Request submitted! The adoption team can review it soon. ♡", "success");
    form.reset();
    showToast("Your adoption request was submitted ♡");
    setTimeout(() => dialog.close(), 1400);
  } catch (error) {
    showMessage($("formMessage"), error.message || "Could not submit the request. Please try again.", "error");
  } finally {
    button.disabled = false;
    button.textContent = "Send adoption request ♡";
  }
});

$("adminKeyForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  state.adminKey = $("adminKey").value.trim();
  await loadAdminRequests();
});
async function loadAdminRequests() {
  const container = $("adminRequests");
  showMessage($("adminMessage"), "Loading requests...");
  container.innerHTML = "";
  try {
    const result = await apiRequest("/adoption-requests", { headers: { "x-admin-key": state.adminKey } });
    const requests = Array.isArray(result) ? result : result.requests;
    showMessage($("adminMessage"), `${requests.length} request(s) loaded.`, "success");
    if (!requests.length) {
      container.textContent = "No adoption requests yet.";
      return;
    }
    container.innerHTML = requests.map((request) => `<article class="admin-request">
      <div><strong>${escapeHtml(request.applicant_name)}</strong><p>${escapeHtml(request.email)} · ${escapeHtml(request.phone)}</p><p>Pet: ${escapeHtml(request.pet_name || request.pet_id)} · ${escapeHtml(request.reason)}</p><p>Status: ${escapeHtml(request.status)}</p></div>
      <div class="admin-actions"><select aria-label="Status for request ${escapeHtml(request.id)}" data-status-id="${escapeHtml(request.id)}"><option value="pending" ${request.status === "pending" ? "selected" : ""}>Pending</option><option value="approved" ${request.status === "approved" ? "selected" : ""}>Approved</option><option value="rejected" ${request.status === "rejected" ? "selected" : ""}>Rejected</option></select><button type="button" data-update-id="${escapeHtml(request.id)}">Update</button><button type="button" data-delete-id="${escapeHtml(request.id)}">Delete</button></div>
    </article>`).join("");
  } catch (error) {
    showMessage($("adminMessage"), `${error.message}. Check the backend and ADMIN_API_KEY.`, "error");
  }
}
$("adminRequests").addEventListener("click", async (event) => {
  const updateButton = event.target.closest("[data-update-id]");
  const deleteButton = event.target.closest("[data-delete-id]");
  try {
    if (updateButton) {
      const id = updateButton.dataset.updateId;
      const select = $("adminRequests").querySelector(`[data-status-id="${CSS.escape(id)}"]`);
      await apiRequest(`/adoption-requests/${encodeURIComponent(id)}`, {
        method: "PATCH", headers: { "x-admin-key": state.adminKey },
        body: JSON.stringify({ status: select.value })
      });
      showToast("Request status updated.");
      await loadAdminRequests();
    } else if (deleteButton) {
      if (!confirm("Delete this adoption request? This cannot be undone.")) return;
      await apiRequest(`/adoption-requests/${encodeURIComponent(deleteButton.dataset.deleteId)}`, {
        method: "DELETE", headers: { "x-admin-key": state.adminKey }
      });
      showToast("Request deleted.");
      await loadAdminRequests();
    }
  } catch (error) {
    showMessage($("adminMessage"), error.message || "Could not update the request.", "error");
  }
});
$("menuToggle").addEventListener("click", () => {
  const open = $("navLinks").classList.toggle("open");
  $("menuToggle").setAttribute("aria-expanded", String(open));
});
$("navLinks").addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    $("navLinks").classList.remove("open");
    $("menuToggle").setAttribute("aria-expanded", "false");
  }
});
$("year").textContent = new Date().getFullYear();
loadPets();
