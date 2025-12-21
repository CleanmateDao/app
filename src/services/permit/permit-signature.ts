import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/contracts/config';

const PERMIT_TYPEHASH = ethers.keccak256(
  ethers.toUtf8Bytes(
    'Permit(address owner,uint256 amount,uint256 deadline,uint256 nonce)'
  )
);

const EIP712_DOMAIN_TYPEHASH = ethers.keccak256(
  ethers.toUtf8Bytes(
    'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
  )
);

export interface PermitSignature {
  deadline: number;
  v: number;
  r: string;
  s: string;
}

/**
 * Build EIP-712 domain separator for RewardsManager
 */
function buildDomainSeparator(chainId: number, contractAddress: string): string {
  const nameHash = ethers.keccak256(ethers.toUtf8Bytes('RewardsManager'));
  const versionHash = ethers.keccak256(ethers.toUtf8Bytes('1'));
  
  const domainSeparator = ethers.solidityPackedKeccak256(
    ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
    [
      EIP712_DOMAIN_TYPEHASH,
      nameHash,
      versionHash,
      chainId,
      contractAddress,
    ]
  );

  return domainSeparator;
}

/**
 * Get nonce from contract (needs to be called separately)
 */
export async function getNonce(
  provider: ethers.Provider,
  userAddress: string
): Promise<bigint> {
  if (!CONTRACT_ADDRESSES.REWARDS_MANAGER) {
    throw new Error('REWARDS_MANAGER address not configured');
  }

  const abi = [
    'function nonces(address) view returns (uint256)',
  ];
  
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.REWARDS_MANAGER,
    abi,
    provider
  );

  return await contract.nonces(userAddress);
}

/**
 * Sign permit for claiming rewards
 */
export async function signPermit(
  signer: ethers.Signer,
  userAddress: string,
  amount: string,
  deadline: number,
  nonce: bigint,
  chainId: number = 100010 // VeChain testnet default
): Promise<PermitSignature> {
  if (!CONTRACT_ADDRESSES.REWARDS_MANAGER) {
    throw new Error('REWARDS_MANAGER address not configured');
  }

  const domainSeparator = buildDomainSeparator(
    chainId,
    CONTRACT_ADDRESSES.REWARDS_MANAGER
  );

  // Build permit struct hash
  const structHash = ethers.solidityPackedKeccak256(
    ['bytes32', 'address', 'uint256', 'uint256', 'uint256'],
    [PERMIT_TYPEHASH, userAddress, amount, deadline, nonce]
  );

  // Build final hash for EIP-712 signature
  const messageHash = ethers.solidityPackedKeccak256(
    ['bytes2', 'bytes32', 'bytes32'],
    ['0x1901', domainSeparator, structHash]
  );

  // Sign the message
  const signature = await signer.signMessage(ethers.getBytes(messageHash));
  const sig = ethers.Signature.from(signature);

  return {
    deadline,
    v: sig.v,
    r: sig.r,
    s: sig.s,
  };
}

