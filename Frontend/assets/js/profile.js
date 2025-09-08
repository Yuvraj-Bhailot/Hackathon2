// ===== PROFILE PAGE HANDLER =====
document.addEventListener("DOMContentLoaded", () => {
  const user = getLoggedInUser();
  if (!user) {
    console.warn("No user session found. Redirecting to signin...");
    window.location.href = "signin.html";
    return;
  }

  // Prefill profile form
  document.getElementById("userType").value = user.type || "Donor";
  document.getElementById("fullName").value = user.fullName || "";
  document.getElementById("email").value = user.email || "";
  document.getElementById("phone").value = user.phone || "";
  document.getElementById("address").value = user.address || "";

  // Show NGO-only fields if needed
  if (user.type === "NGO") {
    const ngoSection = document.querySelector(".ngo-only");
    if (ngoSection) {
      ngoSection.classList.remove("hidden");
      document.getElementById("orgName").value = user.orgName || "";
    }
  }

  // Save changes
  document.getElementById("profileForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const updatedUser = {
      ...user,
      fullName: document.getElementById("fullName").value,
      phone: document.getElementById("phone").value,
      address: document.getElementById("address").value,
    };

    if (user.type === "NGO") {
      updatedUser.orgName = document.getElementById("orgName").value;
    }

    updateUser(updatedUser);
    alert("✅ Profile updated successfully!");
  });

  // Logout button
  document.getElementById("logoutBtn").addEventListener("click", () => {
    logoutUser();
  });
});
