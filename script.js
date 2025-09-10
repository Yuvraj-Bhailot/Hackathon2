// Sample donation data
const donationData = [
  {
    restaurant: "Good Eats Diner",
    ngo: "Helping Hands NGO",
    foodItem: "Sandwiches",
    quantity: "50 boxes",
    date: "2024-06-10",
    status: "Delivered"
  },
  {
    restaurant: "Fresh Bites Cafe",
    ngo: "Food for All",
    foodItem: "Salads",
    quantity: "30 bowls",
    date: "2024-06-12",
    status: "Pending"
  },
  {
    restaurant: "Baker's Delight",
    ngo: "Hope Shelter",
    foodItem: "Pastries",
    quantity: "20 packs",
    date: "2024-06-08",
    status: "Delivered"
  }
];

// Function to render the donation data into the table
function renderDonations() {
  const tbody = document.getElementById('donation-table-body');
  tbody.innerHTML = ''; // Clear existing rows

  donationData.forEach(donation => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${donation.restaurant}</td>
      <td>${donation.ngo}</td>
      <td>${donation.foodItem}</td>
      <td>${donation.quantity}</td>
      <td>${donation.date}</td>
      <td class="status-${donation.status.toLowerCase()}">${donation.status}</td>
    `;

    tbody.appendChild(tr);
  });
}

// Call render on page load
renderDonations();
