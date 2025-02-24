// /mockdata/nanniesData.ts
export interface Mummy {
    id: string;
    name: string;
    photo: string;
    phonenumber: number;
    location?: string;
    budgetrange: string;
    lookingfor: string;
    availablefor?: string;
    pitchednannies: number;
    rating: number;
    ratingphoto: string;
    lastseen?: string;
    suspenionfor?: string;
  }

// Data for Available Nannies
export const activeMummies: Mummy[] = [
  {
    id: "1",
    name: "John Kamau",
    photo: "/admin-assets/profile1.svg",
    phonenumber: +25423456789, 
    location: "Molo, Nakuru",
    lookingfor: "Child care",
    budgetrange: "6k-9k",
    availablefor: "Special Needs",
    rating: 4.0, 
    ratingphoto: "/admin-assets/rating icon.svg",
    pitchednannies: 5,
    
  },
  
];
  
export const activeMummiesColumns = [
  { header: "Name", accessor: "name" },
  { header: "Phone No", accessor: "phonenumber" },
  { header: "Location", accessor: "location" },
  { header: "Looking For", accessor: "lookingfor" },
  { header: "Rating", accessor: "rating" },
  { header: "Budget Range", accessor: "budgetrange" },
 { header: "Pitched nannies", accessor: "pitchednannis" },

];
  

export const suspendedMummies: Mummy[] = [
  {
    id: "1",
    name: "John Kamau",
    photo: "/admin-assets/profile1.svg",
    phonenumber: +25423456789,
    lookingfor: "Child care",
    budgetrange: "6k-9k",
    pitchednannies: 5,
    suspenionfor:"Violence accusation",
    rating: 4.0, 
    ratingphoto: "/admin-assets/rating icon.svg",
    lastseen: "Dec 30,2024 05:48",
    
    
  },
  
];
  
export const suspendedMummiesColumns = [
  { header: "Name", accessor: "name" },
  { header: "Phone No", accessor: "phonenumber" },
  { header: "Looking For", accessor: "lookingfor" },
  { header: "Rating", accessor: "rating" },
  { header: "Budget Range", accessor: "budgetrange" },
  { header: "Pitched nannies", accessor: "pitchednannies" },
  { header: "Last Seen", accessor: "lastseen" },
  { header: "Suspension for", accessor: "suspensionfor" },
  
];
