// ===== AUTH HANDLER =====

// Simulate a DB with localStorage (replace later with Supabase)
const STORAGE_KEY = "foodcare_users";
const SESSION_KEY = "foodcare_session";

// Save new user (from signup page)
function registerUser(user) {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  users.push(user);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// signin user
function signinUser(email, password) {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return true;
  }
  return false;
}

// Get currently logged in user
function getLoggedInUser() {
  return JSON.parse(localStorage.getItem(SESSION_KEY));
}

// Update user profile
function updateUser(updatedUser) {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const index = users.findIndex(u => u.email === updatedUser.email);
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
  }
}

// Logout
function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "signin.html";
}
