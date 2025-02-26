


//
// /mockdata/offersData.ts

// Interfaces for each offer type
export interface AcceptedOffer {
  id: string;
  name: string;
  photo: string;
  servicesNeeded: string;
  workLocation: string;
  latestOffer: string;
  acceptanceDate: string;
  rating: number;
  ratingphoto: string;
}

export interface PendingOffer {
  id: string;
  name: string;
  photo: string;
  servicesNeeded: string;
  workLocation: string;
  latestOffer: string;
  lastInteraction: string;
}

export interface DeclinedOffer {
  id: string;
  name: string;
  photo: string;
  servicesNeeded: string;
  workLocation: string;
  latestOffer: string;
  date: string;
  declinedBy: string;
}

// Accepted Offers Mock Data & Columns
export const acceptedOffers: AcceptedOffer[] = [
  {
    id: "1",
    name: "Catherine Njeri",
    photo: "/admin-assets/profile1.svg",
    servicesNeeded: "Elderly Care",
    workLocation: "Molo, Nakuru",
    latestOffer: "Ksh 20,000",
    acceptanceDate: "Feb 2 2025, 08:46 am",
    rating: 4.0,
    ratingphoto: "/admin-assets/rating icon.svg",
  },
  // Add more accepted offers as needed
];

export const acceptedOffersColumns = [
  { header: "Name", accessor: "name" },
  { header: "Services Needed", accessor: "servicesNeeded" },
  { header: "Work Location", accessor: "workLocation" },
  { header: "Latest Offer", accessor: "latestOffer" },
  { header: "Acceptance Date", accessor: "acceptanceDate" },
  { header: "Rating", accessor: "rating" },
];

// Pending Offers Mock Data & Columns
export const pendingOffers: PendingOffer[] = [
  {
    id: "1",
    name: "Grace Muthiani",  // Use name directly
    photo: "/admin-assets/profile1.svg", // Use photo directly
    servicesNeeded: "Elderly Care",
    workLocation: "Molo, Nakuru",
    latestOffer: "Ksh 18,000",
    lastInteraction: "6 hours ago",
  },
  // Add more pending offers as needed
];

export const pendingOffersColumns = [
  { header: "Name", accessor: "name" }, // Access name directly
  { header: "Services Needed", accessor: "servicesNeeded" },
  { header: "Work Location", accessor: "workLocation" },
  { header: "Latest Offer", accessor: "latestOffer" },
  { header: "Last Interaction", accessor: "lastInteraction" },
];

// Declined Offers Mock Data & Columns
export const declinedOffers: DeclinedOffer[] = [
  {
    id: "1",
    name: "Grace Muthiani", // Use name directly
    photo: "/admin-assets/profile1.svg", // Use photo directly
    servicesNeeded: "Elderly Care",
    workLocation: "Molo, Nakuru",
    latestOffer: "Ksh 20,000",
    date: "Feb 2 2025, 08:34 am",
    declinedBy: "Nanny",
  },
  // Add more declined offers as needed
];

export const declinedOffersColumns = [
  { header: "Name", accessor: "name" }, // Access name directly
  { header: "Services Needed", accessor: "servicesNeeded" },
  { header: "Work Location", accessor: "workLocation" },
  { header: "Latest Offer", accessor: "latestOffer" },
  { header: "Date", accessor: "date" },
  { header: "Declined By", accessor: "declinedBy" },
];
export type Offer = AcceptedOffer | PendingOffer | DeclinedOffer;
