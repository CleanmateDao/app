// ABI for Cleanup contract (individual cleanup instance)
export const CleanupABI = [
  {
    inputs: [],
    name: "applyToCleanup",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "participant", type: "address" }],
    name: "acceptParticipant",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "participant", type: "address" }],
    name: "rejectParticipant",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum ICleanup.CleanupStatus",
        name: "newStatus",
        type: "uint8",
      },
    ],
    name: "updateCleanupStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "publishCleanup",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpublishCleanup",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "string[]", name: "ipfsHashes", type: "string[]" },
          { internalType: "string[]", name: "mimetypes", type: "string[]" },
        ],
        internalType: "struct Params.SubmitProofOfWorkParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "submitProofOfWork",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getParticipants",
    outputs: [
      {
        components: [
          { internalType: "address", name: "participantAddress", type: "address" },
          {
            internalType: "enum ICleanup.ParticipantStatus",
            name: "status",
            type: "uint8",
          },
          { internalType: "uint256", name: "appliedAt", type: "uint256" },
        ],
        internalType: "struct ICleanup.Participant[]",
        name: "participantList",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getProofMedia",
    outputs: [
      {
        components: [
          { internalType: "string", name: "ipfsHash", type: "string" },
          { internalType: "string", name: "mimetype", type: "string" },
          { internalType: "uint256", name: "uploadedAt", type: "uint256" },
        ],
        internalType: "struct ICleanup.ProofMedia[]",
        name: "media",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "cleanupData",
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
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "hasApplied",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

