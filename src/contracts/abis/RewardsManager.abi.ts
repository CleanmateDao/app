// ABI for RewardsManager contract
export const RewardsManagerABI = [
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "cleanup", type: "address" },
          { internalType: "address[]", name: "participants", type: "address[]" },
          { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
        ],
        internalType: "struct Params.DistributeRewardsParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "distributeRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "string", name: "proof", type: "string" },
        ],
        internalType: "struct Params.ClaimRewardsParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "claimRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAvailableFunds",
    outputs: [{ internalType: "uint256", name: "funds", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "rewards",
    outputs: [
      { internalType: "uint256", name: "pending", type: "uint256" },
      { internalType: "uint256", name: "claimed", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

