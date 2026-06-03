export const LEAVE_REQUESTS = [
  {
    id: 1, empId: "DEV501", name: "Rahul Anthony", initials: "RA",
    leaveType: "Sick leave", date: "May 3 – May 7", duration: "5 days", status: "pending",
  },
  {
    id: 2, empId: "PRO561", name: "Kavin Diyopal", initials: "KD",
    leaveType: "Casual leave", date: "May 12 – May 13", duration: "2 days", status: "pending",
  },
  {
    id: 3, empId: "DES402", name: "Priya Nair", initials: "PN",
    leaveType: "Annual leave", date: "Jun 1 – Jun 5", duration: "5 days", status: "pending",
  },
  {
    id: 4, empId: "HR102", name: "Amit Patel", initials: "AP",
    leaveType: "Sick leave", date: "May 20 – May 21", duration: "2 days", status: "pending",
  },
  {
    id: 5, empId: "ENG904", name: "Vijay Kumar", initials: "VK",
    leaveType: "Casual leave", date: "May 25", duration: "1 day", status: "pending",
  },
];

export const LEAVE_BALANCES = [
  {
    id: 1, empId: "DEV501", dept: "Engineering", name: "Rahul Anthony", initials: "RA",
    casual: { used: 8, total: 12 }, sick: { used: 4, total: 10 }, earned: { used: 15, total: 20 },
  },
  {
    id: 2, empId: "PRO561", dept: "Product", name: "Kavin Diyopal", initials: "KD",
    casual: { used: 10, total: 12 }, sick: { used: 2, total: 10 }, earned: { used: 18, total: 20 },
  },
  {
    id: 3, empId: "DES402", dept: "Design", name: "Priya Nair", initials: "PN",
    casual: { used: 3, total: 12 }, sick: { used: 1, total: 10 }, earned: { used: 5, total: 20 },
  },
  {
    id: 4, empId: "HR102", dept: "HR", name: "Amit Patel", initials: "AP",
    casual: { used: 11, total: 12 }, sick: { used: 9, total: 10 }, earned: { used: 19, total: 20 },
  },
  {
    id: 5, empId: "ENG904", dept: "Engineering", name: "Vijay Kumar", initials: "VK",
    casual: { used: 2, total: 12 }, sick: { used: 0, total: 10 }, earned: { used: 2, total: 20 },
  },
];