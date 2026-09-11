export const INDIAN_DISTRICTS: Record<string, string[]> = {
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Kota", "Udaipur", "Bikaner", "Ajmer", "Alwar", 
    "Bhilwara", "Sikar", "Bharatpur", "Pali", "Sri Ganganagar", "Barmer", 
    "Chittorgarh", "Jhunjhunu", "Nagaur", "Tonk", "Banswara", "Dausa"
  ],
  "Madhya Pradesh": [
    "Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", 
    "Satna", "Ratlam", "Rewa", "Katni", "Singrauli", "Burhanpur", "Khandwa", 
    "Morena", "Bhind", "Chhindwara", "Guna", "Shivpuri", "Vidisha"
  ],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur Nagar", "Varanasi", "Prayagraj", "Agra", "Meerut", 
    "Ghaziabad", "Noida (Gautam Buddha Nagar)", "Bareilly", "Aligarh", 
    "Moradabad", "Saharanpur", "Gorakhpur", "Ayodhya", "Jhansi", "Mathura"
  ],
  "Bihar": [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", 
    "Bihar Sharif", "Arrah", "Begusarai", "Katihar", "Munger", "Chhapra", 
    "Samastipur", "Saharsa", "Sasaram", "Hajipur", "Dehri", "Bettiah"
  ],
  "Maharashtra": [
    "Mumbai City", "Mumbai Suburban", "Pune", "Nagpur", "Thane", "Nashik", 
    "Aurangabad (Chhatrapati Sambhajinagar)", "Solapur", "Amravati", "Kolhapur", 
    "Navi Mumbai", "Nanded", "Sangli", "Jalgaon", "Akola", "Latur"
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", 
    "Junagadh", "Gandhinagar", "Anand", "Navsari", "Morbi", "Bharuch"
  ],
  "Delhi": [
    "New Delhi", "Central Delhi", "North Delhi", "South Delhi", "East Delhi", 
    "West Delhi", "North East Delhi", "North West Delhi", "South East Delhi", 
    "South West Delhi", "Shahdara"
  ],
  "Haryana": [
    "Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", 
    "Hisar", "Karnal", "Sonipat", "Panchkula", "Bhiwani", "Sirsa"
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali (SAS Nagar)", 
    "Hoshiarpur", "Pathankot", "Moga", "Batala"
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "North 24 Parganas", "South 24 Parganas", "Hooghly", 
    "Darjeeling", "Siliguri", "Asansol", "Durgapur", "Malda", "Murshidabad"
  ],
  "Karnataka": [
    "Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Hubballi-Dharwad", "Mangaluru", 
    "Belagavi", "Kalaburagi", "Davanagere", "Ballari", "Vijayapura", "Shivamogga"
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", 
    "Tiruppur", "Vellore", "Erode", "Thoothukudi", "Dindigul", "Thanjavur"
  ],
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kakinada", 
    "Rajahmundry", "Tirupati", "Kadapa", "Anantapur", "Eluru", "Ongole"
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", 
    "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet"
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", 
    "Giridih", "Ramgarh", "Medininagar"
  ],
  "Chhattisgarh": [
    "Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Jagdalpur", 
    "Ambikapur", "Durg", "Dhamtari"
  ],
  "Odisha": [
    "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", 
    "Balasore", "Bhadrak", "Baripada"
  ],
  "Assam": [
    "Guwahati (Kamrup Metro)", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", 
    "Tinsukia", "Tezpur", "Bongaigaon"
  ],
  "Kerala": [
    "Thiruvananthapuram", "Kochi (Ernakulam)", "Kozhikode", "Kollam", "Thrissur", 
    "Kannur", "Alappuzha", "Kottayam", "Palakkad", "Malappuram"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh", "Kashipur", 
    "Rudrapur", "Nainital", "Almora"
  ],
  "Himachal Pradesh": [
    "Shimla", "Dharamshala", "Mandi", "Solan", "Kullu", "Hamirpur", "Bilaspur", "Una"
  ],
  "Goa": [
    "North Goa", "South Goa", "Panaji", "Margao", "Vasco da Gama", "Mapusa"
  ]
};

export const getAllIndianStates = (): string[] => {
  return Object.keys(INDIAN_DISTRICTS);
};

export const getDistrictsForState = (stateName: string): string[] => {
  return INDIAN_DISTRICTS[stateName] || ["Main District", "Central District", "District HQ"];
};
