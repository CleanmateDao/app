export const CleanupFactoryABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "cleanupAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "organizer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "metadata",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "date",
        type: "uint256",
      },
    ],
    name: "CleanupCreated",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "string",
            name: "metadata",
            type: "string",
          },
          {
            internalType: "string",
            name: "category",
            type: "string",
          },
          {
            components: [
              {
                internalType: "string",
                name: "address_",
                type: "string",
              },
              {
                internalType: "string",
                name: "city",
                type: "string",
              },
              {
                internalType: "string",
                name: "country",
                type: "string",
              },
              {
                internalType: "int256",
                name: "latitude",
                type: "int256",
              },
              {
                internalType: "int256",
                name: "longitude",
                type: "int256",
              },
            ],
            internalType: "struct ICleanup.Location",
            name: "location",
            type: "tuple",
          },
          {
            internalType: "uint256",
            name: "date",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxParticipants",
            type: "uint256",
          },
        ],
        internalType: "struct Params.CreateCleanupParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "createCleanup",
    outputs: [
      {
        internalType: "address",
        name: "cleanupAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

