// ABI for UserRegistry contract
export const UserRegistryABI = [
  {
    inputs: [
      {
        components: [
          { internalType: "string", name: "metadata", type: "string" },
          { internalType: "string", name: "email", type: "string" },
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
          { internalType: "string", name: "metadata", type: "string" },
          { internalType: "string", name: "email", type: "string" },
          { internalType: "string", name: "referralCode", type: "string" },
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
    inputs: [{ internalType: "string", name: "referralCode", type: "string" }],
    name: "setReferralCode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "metadata", type: "string" }],
    name: "updateProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "member", type: "address" },
          { internalType: "bool", name: "canEditCleanups", type: "bool" },
          { internalType: "bool", name: "canManageParticipants", type: "bool" },
          { internalType: "bool", name: "canSubmitProof", type: "bool" },
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
    inputs: [{ internalType: "address", name: "member", type: "address" }],
    name: "removeTeamMember",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "member", type: "address" },
          { internalType: "bool", name: "canEditCleanups", type: "bool" },
          { internalType: "bool", name: "canManageParticipants", type: "bool" },
          { internalType: "bool", name: "canSubmitProof", type: "bool" },
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
    inputs: [],
    name: "markKYCPending",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "organizer", type: "address" },
          { internalType: "address", name: "member", type: "address" },
          {
            internalType: "enum IUserRegistry.Permission",
            name: "permission",
            type: "uint8",
          },
        ],
        internalType: "struct Params.HasPermissionParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "hasPermission",
    outputs: [{ internalType: "bool", name: "result", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserProfile",
    outputs: [
      {
        components: [
          { internalType: "string", name: "metadata", type: "string" },
          { internalType: "string", name: "email", type: "string" },
          { internalType: "bool", name: "isEmailVerified", type: "bool" },
          {
            internalType: "enum IUserRegistry.KYCStatus",
            name: "kycStatus",
            type: "uint8",
          },
          { internalType: "string", name: "referralCode", type: "string" },
          { internalType: "address", name: "referredBy", type: "address" },
        ],
        internalType: "struct IUserRegistry.UserProfile",
        name: "profile",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "userExists",
    outputs: [{ internalType: "bool", name: "exists", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "canOrganize",
    outputs: [{ internalType: "bool", name: "can", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "organizer", type: "address" },
      { internalType: "address", name: "member", type: "address" },
    ],
    name: "teamMembers",
    outputs: [
      {
        components: [
          { internalType: "address", name: "memberAddress", type: "address" },
          { internalType: "bool", name: "canEditCleanups", type: "bool" },
          { internalType: "bool", name: "canManageParticipants", type: "bool" },
          { internalType: "bool", name: "canSubmitProof", type: "bool" },
          { internalType: "uint256", name: "addedAt", type: "uint256" },
        ],
        internalType: "struct IUserRegistry.TeamMember",
        name: "memberData",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

