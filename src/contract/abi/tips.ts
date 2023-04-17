export const tips = [
  { inputs: [], name: 'ErrCallerNotCharacterOwner', type: 'error' },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint8', name: 'version', type: 'uint8' },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'fromCharacterId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'toCharacterId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'TipCharacter',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'fromCharacterId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'toCharacterId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'toNoteId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'TipCharacterForNote',
    type: 'event',
  },
  {
    inputs: [],
    name: 'ERC1820_REGISTRY',
    outputs: [
      { internalType: 'contract IERC1820Registry', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'TOKENS_RECIPIENT_INTERFACE_HASH',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getToken',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getWeb3Entry',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'web3Entry_', type: 'address' },
      { internalType: 'address', name: 'token_', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'bytes', name: 'userData', type: 'bytes' },
      { internalType: 'bytes', name: 'operatorData', type: 'bytes' },
    ],
    name: 'tokensReceived',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
export type Tips = typeof tips