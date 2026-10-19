// HTML Elements
const contactModal = document.getElementById("contactModal");
const contactForm = document.getElementById("contactForm");

const addContactBtn = document.getElementById("addContactBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");

const contactsList = document.getElementById("contactsList");
const favoritesList = document.getElementById("favoritesList");
const emergencyList = document.getElementById("emergencyList");

const searchInput = document.getElementById("searchInput");

const totalCount = document.getElementById("totalCount");
const favoriteCount = document.getElementById("favoriteCount");
const emergencyCount = document.getElementById("emergencyCount");
const contactsSubtitle = document.getElementById("contactsSubtitle");

const modalTitle = document.getElementById("modalTitle");

// Form Inputs
const contactName = document.getElementById("contactName");
const contactPhone = document.getElementById("contactPhone");
const contactEmail = document.getElementById("contactEmail");
const contactAddress = document.getElementById("contactAddress");
const contactGroup = document.getElementById("contactGroup");

const isFavorite = document.getElementById("isFavorite");
const isEmergency = document.getElementById("isEmergency");

// LocalStorage
let contacts = JSON.parse(localStorage.getItem("contacts")) || [];
let editingId = null;


// Save Contacts
function saveContacts() {
    localStorage.setItem("contacts", JSON.stringify(contacts));
}


// Open Modal
function openModal(contact = null) {
    contactForm.reset();
    editingId = contact ? contact.id : null;

    modalTitle.textContent = contact
        ? "Edit Contact"
        : "Add New Contact";

    if (contact) {
        contactName.value = contact.name;
        contactPhone.value = contact.phone;
        contactEmail.value = contact.email;
        contactAddress.value = contact.address;
        contactGroup.value = contact.group;
        isFavorite.checked = contact.favorite;
        isEmergency.checked = contact.emergency;
    }

    contactModal.classList.add("active");
    document.body.style.overflow = "hidden";
    contactName.focus();
}


// Close Modal
function closeModal() {
    contactModal.classList.remove("active");
    document.body.style.overflow = "";
    contactForm.reset();
    editingId = null;
}


// Modal Buttons
addContactBtn.addEventListener("click", () => openModal());

closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

contactModal.addEventListener("click", function (event) {
    if (event.target === contactModal) {
        closeModal();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeModal();
    }
});


// Validation
function validateContact(name, phone, email) {
    const namePattern = /^[a-zA-Z\u0600-\u06FF\s'-]{2,60}$/;
    const phonePattern = /^\+?[0-9\s()-]{7,20}$/;

    if (!namePattern.test(name.trim())) {
        Swal.fire({
            icon: "error",
            title: "Invalid Name",
            text: "Please enter a valid name."
        });

        return false;
    }

    if (!phonePattern.test(phone.trim())) {
        Swal.fire({
            icon: "error",
            title: "Invalid Phone",
            text: "Please enter a valid phone number."
        });

        return false;
    }

    if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return false;
    }

    return true;
}


// Add / Update Contact
contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = contactName.value.trim();
    const phone = contactPhone.value.trim();
    const email = contactEmail.value.trim();
    const address = contactAddress.value.trim();
    const group = contactGroup.value;

    if (!validateContact(name, phone, email)) {
        return;
    }

    const contactData = {
        id: editingId || Date.now().toString(),
        name: name,
        phone: phone,
        email: email,
        address: address,
        group: group,
        favorite: isFavorite.checked,
        emergency: isEmergency.checked
    };

    if (editingId) {
        const index = contacts.findIndex(
            contact => contact.id === editingId
        );

        if (index !== -1) {
            contacts[index] = contactData;
        }
    } else {
        contacts.push(contactData);
    }

    saveContacts();
    renderContacts();
    closeModal();

    Swal.fire({
        icon: "success",
        title: editingId ? "Contact Updated!" : "Contact Added!",
        text: editingId
            ? "Contact updated successfully."
            : "Contact added successfully.",
        timer: 1800,
        showConfirmButton: false
    });
});


// Create Contact Card
function createContactCard(contact) {
    const card = document.createElement("div");
    card.className = "contact-card";

    const firstLetter = contact.name.charAt(0).toUpperCase();

    card.innerHTML = `
        <div class="contact-top">
            <div class="contact-avatar">${firstLetter}</div>

            <div class="contact-heading">
                <h3>${escapeHTML(contact.name)}</h3>
                <p>${escapeHTML(contact.group)}</p>
            </div>
        </div>

        <div class="contact-badges">
            ${contact.favorite
                ? '<span class="badge"><i class="fa-solid fa-star"></i> Favorite</span>'
                : ''
            }

            ${contact.emergency
                ? '<span class="badge emergency-badge"><i class="fa-solid fa-heart-pulse"></i> Emergency</span>'
                : ''
            }
        </div>

        <div class="contact-details">
            <div class="contact-detail">
                <i class="fa-solid fa-phone"></i>
                <a href="tel:${escapeHTML(contact.phone)}">
                    ${escapeHTML(contact.phone)}
                </a>
            </div>

            <div class="contact-detail">
                <i class="fa-solid fa-envelope"></i>
                <a href="mailto:${escapeHTML(contact.email)}">
                    ${escapeHTML(contact.email)}
                </a>
            </div>

            ${contact.address
                ? `<div class="contact-detail">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>${escapeHTML(contact.address)}</span>
                </div>`
                : ''
            }
        </div>

        <div class="contact-actions">
            <a class="call-action" href="tel:${escapeHTML(contact.phone)}" aria-label="Call">
                <i class="fa-solid fa-phone"></i>
            </a>

            <a class="email-action" href="mailto:${escapeHTML(contact.email)}" aria-label="Email">
                <i class="fa-solid fa-envelope"></i>
            </a>

            <button class="favorite-action ${contact.favorite ? 'active' : ''}"
                data-action="favorite" data-id="${contact.id}"
                aria-label="Toggle favorite">
                <i class="fa-solid fa-star"></i>
            </button>

            <button class="edit-action" data-action="edit"
                data-id="${contact.id}" aria-label="Edit contact">
                <i class="fa-solid fa-pen"></i>
            </button>

            <button class="delete-action" data-action="delete"
                data-id="${contact.id}" aria-label="Delete contact">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;

    return card;
}


// Prevent HTML Injection
function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}


// Render Main Contacts
function renderContacts() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredContacts = contacts.filter(contact => {
        return (
            contact.name.toLowerCase().includes(searchTerm) ||
            contact.phone.toLowerCase().includes(searchTerm) ||
            contact.email.toLowerCase().includes(searchTerm)
        );
    });

    contactsList.innerHTML = "";

    if (filteredContacts.length === 0) {
        contactsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fa-solid fa-address-book"></i>
                </div>

                <h3>No contacts found</h3>
                <p>Click "Add Contact" to get started</p>
            </div>
        `;
    } else {
        filteredContacts.forEach(contact => {
            contactsList.appendChild(createContactCard(contact));
        });
    }

    renderExtraSection(
        favoritesList,
        contacts.filter(contact => contact.favorite),
        "No favorites yet"
    );

    renderExtraSection(
        emergencyList,
        contacts.filter(contact => contact.emergency),
        "No emergency contacts"
    );

    updateStatistics();
}


// Render Favorites and Emergency
function renderExtraSection(container, items, emptyMessage) {
    container.innerHTML = "";

    if (items.length === 0) {
        const message = document.createElement("p");
        message.className = "section-empty";
        message.textContent = emptyMessage;
        container.appendChild(message);
        return;
    }

    items.forEach(contact => {
        container.appendChild(createContactCard(contact));
    });
}


// Update Statistics
function updateStatistics() {
    totalCount.textContent = contacts.length;

    favoriteCount.textContent = contacts.filter(
        contact => contact.favorite
    ).length;

    emergencyCount.textContent = contacts.filter(
        contact => contact.emergency
    ).length;

    contactsSubtitle.textContent =
        `Manage and organize your ${contacts.length} contacts`;
}


// Contact Actions
document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-action]");

    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const id = button.dataset.id;

    const contact = contacts.find(
        item => String(item.id) === String(id)
    );

    if (!contact) {
        return;
    }

    if (action === "edit") {
        openModal(contact);
    }

    if (action === "favorite") {
        contact.favorite = !contact.favorite;

        saveContacts();
        renderContacts();
    }

    if (action === "delete") {
        deleteContact(id);
    }
});


// Delete Contact
async function deleteContact(id) {
    const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#702cf5",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
        contacts = contacts.filter(
            contact => String(contact.id) !== String(id)
        );

        saveContacts();
        renderContacts();

        Swal.fire({
            title: "Deleted!",
            text: "Contact deleted successfully.",
            icon: "success",
            timer: 1600,
            showConfirmButton: false
        });
    }
}


// Search
searchInput.addEventListener("input", renderContacts);


// Initial Render
renderContacts();
console.log("ContactHub JavaScript is working!");