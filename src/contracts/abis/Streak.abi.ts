// ABI for Streak contract
export const StreakABI = [
  {
    inputs: [],
    name: "joinStreak",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "string", name: "metadata", type: "string" },
          {
            internalType: "string[]",
            name: "ipfsHashes",
            type: "string[]",
          },
          {
            internalType: "string[]",
            name: "mimetypes",
            type: "string[]",
          },
        ],
        internalType: "struct Params.SubmitStreakParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "submit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "submissionId", type: "uint256" }],
    name: "getSubmission",
    outputs: [
      {
        components: [
          { internalType: "address", name: "user", type: "address" },
          {
            internalType: "uint256",
            name: "submissionId",
            type: "uint256",
          },
          { internalType: "string", name: "metadata", type: "string" },
          {
            internalType: "string[]",
            name: "ipfsHashes",
            type: "string[]",
          },
          {
            internalType: "string[]",
            name: "mimetypes",
            type: "string[]",
          },
          {
            internalType: "uint8",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "submittedAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "reviewedAt",
            type: "uint256",
          },
        ],
        internalType: "struct IStreak.Submission",
        name: "submission",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserSubmissions",
    outputs: [{ internalType: "uint256[]", name: "submissionIds", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getStreakerCode",
    outputs: [{ internalType: "string", name: "code", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSubmissions",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: true, internalType: "uint256", name: "submissionId", type: "uint256" },
      { indexed: false, internalType: "string", name: "metadata", type: "string" },
    ],
    name: "StreakSubmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: true, internalType: "uint256", name: "submissionId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "StreakApproved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: true, internalType: "uint256", name: "submissionId", type: "uint256" },
      { indexed: false, internalType: "string", name: "reason", type: "string" },
    ],
    name: "StreakRejected",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "string", name: "streakerCode", type: "string" },
    ],
    name: "StreakerJoined",
    type: "event",
  },
] as const;

