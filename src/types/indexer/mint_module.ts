import { type Address } from 'viem'
import { type CharacterEntity } from './character'
import { type NoteEntity } from './note'

export type MintModuleTargetItemType = 'Note'

export interface MintModuleEntity {
  targetItemType: MintModuleTargetItemType
  linkValue: string
  contractAddress: Address
  initData: string
  returnData: string
  toCharacterId: number | null
  toCharacter?: CharacterEntity | null
  toNoteId: number | null
  toNote?: NoteEntity | null
  operator: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  transactionHash: string
  blockNumber: number
  logIndex: number
  updatedTransactionHash: string
  updatedBlockNumber: number
  updatedLogIndex: number
}