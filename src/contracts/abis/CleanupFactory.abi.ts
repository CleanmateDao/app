// ABI for CleanupFactory contract
export const CleanupFactoryABI = [
  {
    inputs: [
      {
        components: [
          { internalType: "string", name: "metadata", type: "string" },
          { internalType: "string", name: "category", type: "string" },
          {
            components: [
              { internalType: "string", name: "address_", type: "string" },
              { internalType: "string", name: "city", type: "string" },
              { internalType: "string", name: "country", type: "string" },
              { internalType: "int256", name: "latitude", type: "int256" },
              { internalType: "int256", name: "longitude", type: "int256" },
            ],
            internalType: "struct ICleanup.Location",
            name: "location",
            type: "tuple",
          },
          { internalType: "uint256", name: "date", type: "uint256" },
          { internalType: "uint256", name: "startTime", type: "uint256" },
          { internalType: "uint256", name: "endTime", type: "uint256" },
          { internalType: "uint256", name: "maxParticipants", type: "uint256" },
        ],
        internalType: "struct Params.CreateCleanupParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "createCleanup",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "cleanupAddress", type: "address" }],
    name: "getCleanup",
    outputs: [
      {
        components: [
          { internalType: "address", name: "id", type: "address" },
          { internalType: "string", name: "metadata", type: "string" },
          { internalType: "string", name: "category", type: "string" },
          {
            internalType: "enum ICleanup.CleanupStatus",
            name: "status",
            type: "uint8",
          },
          {
            components: [
              { internalType: "string", name: "address_", type: "string" },
              { internalType: "string", name: "city", type: "string" },
              { internalType: "string", name: "country", type: "string" },
              { internalType: "int256", name: "latitude", type: "int256" },
              { internalType: "int256", name: "longitude", type: "int256" },
            ],
            internalType: "struct ICleanup.Location",
            name: "location",
            type: "tuple",
          },
          { internalType: "uint256", name: "date", type: "uint256" },
          { internalType: "uint256", name: "startTime", type: "uint256" },
          { internalType: "uint256", name: "endTime", type: "uint256" },
          { internalType: "uint256", name: "maxParticipants", type: "uint256" },
          { internalType: "address", name: "organizer", type: "address" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "uint256", name: "updatedAt", type: "uint256" },
          { internalType: "uint256", name: "rewardAmount", type: "uint256" },
          { internalType: "bool", name: "proofSubmitted", type: "bool" },
          { internalType: "uint256", name: "proofSubmittedAt", type: "uint256" },
        ],
        internalType: "struct ICleanup.CleanupData",
        name: "data",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "cleanupAddress", type: "address" }],
    name: "cleanupExists",
    outputs: [{ internalType: "bool", name: "exists", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

