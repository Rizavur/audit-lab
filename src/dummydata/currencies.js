export const CURRENCIES = [
  {
    name: "United States Dollars",
    label: "USD",
    maxRate: 1.4,
    minRate: 1.25,
    accounts: [],
  },
  {
    name: "Indonesian Rupiah",
    label: "IDR",
    maxRate: 0.000099,
    minRate: 0.000085,
    accounts: [
      {
        name: "CIMB",
        amt: 107930844.67,
      },
      {
        name: "Mandiri",
        amt: 53965422.34,
      },
    ],
  },
  {
    name: "Malaysian Ringgit",
    label: "MYR",
    maxRate: 0.4,
    minRate: 0.25,
    accounts: [],
  },
];
