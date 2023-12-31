import { type Abi, type ExtractAbiFunctionNames } from 'abitype'
import {
  type Account,
  type Address,
  type Chain,
  type ReadContractParameters,
  type WriteContractParameters,
} from 'viem'

/**
 * The result of a call to a transaction / get function.
 */
export type Result<T, HasTxHash extends boolean = false> = {
  data: T
} & (HasTxHash extends true ? { transactionHash: Address } : {})

export type ReadOverrides<
  TAbi extends Abi,
  TFunctionName extends ExtractAbiFunctionNames<TAbi, 'pure' | 'view'>,
> = Omit<
  ReadContractParameters<TAbi, TFunctionName>,
  'abi' | 'address' | 'args' | 'functionName'
>
export type WriteOverrides<
  TAbi extends Abi,
  TFunctionName extends ExtractAbiFunctionNames<TAbi, 'nonpayable' | 'payable'>,
> = Omit<
  WriteContractParameters<TAbi, TFunctionName, Chain, Account>,
  'abi' | 'address' | 'args' | 'functionName'
>
