// DEPRECATED: This file is no longer used.
// All API calls now go through src/services/api.ts
// Kept for reference only. Can be deleted.

// Mock API utility for dummy data
export const mockApi = {
  // Simulate login
  login: async (email: string, password: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === "admin@globalestates.ng" && password === "Vanguard2026!") {
          resolve({
            success: true,
            user: {
              id: "admin-1",
              name: "Emmanuel Clark",
              role: "Global Administrator",
              email: "admin@globalestates.ng"
            }
          });
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 1000);
    });
  },

  // Simulate 2FA verification
  verify2FA: async (code: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (code.length === 4) {
          resolve({
            success: true,
            token: "mock-jwt-token-" + Date.now()
          });
        } else {
          reject(new Error("Invalid 2FA code"));
        }
      }, 1200);
    });
  },

  // Get dashboard data
  getDashboardData: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalEstates: 24,
          totalResidents: 12532,
          totalStaff: 1234,
          revenue: "₦234,355",
          recentActivity: [
            { id: 1, action: "New resident registered", estate: "Sunset Valley", time: "2 hours ago" },
            { id: 2, action: "Security alert resolved", estate: "Green Park", time: "4 hours ago" },
            { id: 3, action: "Payment received", estate: "Lakeside", time: "1 day ago" },
          ]
        });
      }, 800);
    });
  },

  // Get estates
  getEstates: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: "est-1", name: "Sunset Valley Residences", owner: "John Miller", email: "youremail@gmail.com", phone: "+234 813-587-6754", address: "402, Marble Towers, Kingsway Road", city: "Lagos", tier: "ENTERPRISE", status: "Active", date: "Mar 14, 2026" },
          { id: "est-2", name: "Green Park Estates", owner: "Sarah Johnson", email: "sarahj@gmail.com", phone: "+234 803-123-4567", address: "15, Allen Avenue", city: "Lagos", tier: "STANDARD", status: "Active", date: "Feb 28, 2026" },
          { id: "est-3", name: "Lakeside Gardens", owner: "Michael Brown", email: "michaelb@gmail.com", phone: "+234 706-777-8888", address: "78, Victoria Island", city: "Lagos", tier: "ENTERPRISE", status: "Active", date: "Jan 15, 2026" },
          { id: "est-4", name: "Hillview Apartments", owner: "Emma Wilson", email: "emmaw@gmail.com", phone: "+234 905-555-1122", address: "45, Ikoyi", city: "Lagos", tier: "BASIC", status: "Inactive", date: "Dec 10, 2025" }
        ]);
      }, 500);
    });
  },

  // Get residents
  getResidents: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: "res-1", name: "Emmanuel Chinedu", email: "e.chinedu@gmail.com", phone: "+234 803 123 4567", estate: "Sunset Valley Residences", houseNo: "Block 4A, Flat 12", status: "Active", vehicles: ["Toyota Camry (LND-492-AA)"], familyCount: 3, joinedDate: "Feb 10, 2026" },
          { id: "res-2", name: "Sarah Ojo", email: "sarahojo@gmail.com", phone: "+234 812 998 1234", estate: "Sunset Valley Residences", houseNo: "Villa B4", status: "Active", vehicles: ["Honda Accord (PHC-111-YY)"], familyCount: 4, joinedDate: "Jan 15, 2026" },
          { id: "res-3", name: "John Doe", email: "johndoe@gmail.com", phone: "+234 706 777 8888", estate: "Green Park Estates", houseNo: "Apartment A12", status: "Active", vehicles: ["Toyota Corolla (ABJ-112-XX)"], familyCount: 2, joinedDate: "Mar 02, 2026" },
          { id: "res-4", name: "Emma Eze", email: "emmaeze@gmail.com", phone: "+234 905 555 1122", estate: "Lakeside Gardens", houseNo: "Villa 7B", status: "Active", vehicles: ["Mercedes GLK (KTN-888-MM)"], familyCount: 5, joinedDate: "Apr 11, 2026" }
        ]);
      }, 500);
    });
  },

  // Get staff
  getStaff: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: "st-1", name: "James Willson", role: "Security", assignedTo: "Estate Security", estate: "Sunset Valley Residences", shift: "Morning", status: "Active", gender: "Male", added: "Mar 14, 2026", staffId: "12A1D345", email: "jameswillson@gmail.com", phone: "+234 813 587 6754" },
          { id: "st-2", name: "Adaeze Sarah", role: "Cleaner", assignedTo: "Sarah Ojo (B4)", estate: "Sunset Valley Residences", shift: "Night", status: "Active", gender: "Female", added: "Mar 14, 2026", staffId: "12A1D346", email: "adaezesarah@gmail.com", phone: "+234 803 234 5678" },
          { id: "st-3", name: "Rukayat Miriam", role: "Security", assignedTo: "Estate Security", estate: "Green Park Estates", shift: "Full Time", status: "Active", gender: "Female", added: "Mar 14, 2026", staffId: "12A1D347", email: "rukayatmiriam@gmail.com", phone: "+234 705 987 1122" },
          { id: "st-4", name: "John Uche", role: "Chef", assignedTo: "John Doe (A12)", estate: "Lakeside Gardens", shift: "Daytime", status: "Active", gender: "Male", added: "Mar 14, 2026", staffId: "12A1D348", email: "johnuche@gmail.com", phone: "+234 812 345 6789" }
        ]);
      }, 500);
    });
  }
};