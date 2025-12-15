export const UserRegistryABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "metadata",
        type: "string",
      },
    ],
    name: "UserRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "EmailVerified",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum IUserRegistry.KYCStatus",
        name: "oldStatus",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "enum IUserRegistry.KYCStatus",
        name: "newStatus",
        type: "uint8",
      },
    ],
    name: "KYCStatusUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "UserProfileUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "referralCode",
        type: "string",
      },
    ],
    name: "ReferralCodeSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "referrer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "referralCode",
        type: "string",
      },
    ],
    name: "UserReferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isOrganizer",
        type: "bool",
      },
    ],
    name: "OrganizerStatusUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "organizer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "member",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "canEditCleanups",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "canManageParticipants",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "canSubmitProof",
        type: "bool",
      },
    ],
    name: "TeamMemberAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "organizer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "member",
        type: "address",
      },
    ],
    name: "TeamMemberRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "organizer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "member",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "canEditCleanups",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "canManageParticipants",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "canSubmitProof",
        type: "bool",
      },
    ],
    name: "TeamMemberPermissionsUpdated",
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
            name: "email",
            type: "string",
          },
        ],
        internalType: "struct Params.RegisterUserParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "registerUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
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
            name: "email",
            type: "string",
          },
          {
            internalType: "string",
            name: "referralCode",
            type: "string",
          },
        ],
        internalType: "struct Params.RegisterWithReferralParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "registerWithReferral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "metadata",
        type: "string",
      },
    ],
    name: "updateProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "referralCode",
        type: "string",
      },
    ],
    name: "setReferralCode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "member",
            type: "address",
          },
          {
            internalType: "bool",
            name: "canEditCleanups",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "canManageParticipants",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "canSubmitProof",
            type: "bool",
          },
        ],
        internalType: "struct Params.AddTeamMemberParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "addTeamMember",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "member",
        type: "address",
      },
    ],
    name: "removeTeamMember",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "member",
            type: "address",
          },
          {
            internalType: "bool",
            name: "canEditCleanups",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "canManageParticipants",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "canSubmitProof",
            type: "bool",
          },
        ],
        internalType: "struct Params.UpdateTeamMemberPermissionsParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "updateTeamMemberPermissions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserProfile",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "metadata",
            type: "string",
          },
          {
            internalType: "string",
            name: "email",
            type: "string",
          },
          {
            internalType: "bool",
            name: "isEmailVerified",
            type: "bool",
          },
          {
            internalType: "enum IUserRegistry.KYCStatus",
            name: "kycStatus",
            type: "uint8",
          },
          {
            internalType: "string",
            name: "referralCode",
            type: "string",
          },
          {
            internalType: "address",
            name: "referredBy",
            type: "address",
          },
        ],
        internalType: "struct IUserRegistry.UserProfile",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "userExists",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "canOrganize",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

