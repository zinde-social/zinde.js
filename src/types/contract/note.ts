import { NoteMetadata } from '../metadata'
import { LinkItem, LinkItemType } from './link'

export type Note<T extends LinkItem | undefined = undefined> = {
  /** The character id of the address who owns the note.  */
  characterId: number
  /** The id of this note. Each id is unique under one character. */
  noteId: number

  /** The content URI of this note. */
  contentUri: string
  /** The metadata content of this note. */
  metadata?: NoteMetadata

  /** The bytes32 representation of the link if there is one. */
  linkItemType: string
  /** The type of the link if there is one. */
  linkItemTypeString?: LinkItemType

  linkItem: T

  /**
   * The primary key (id) of the linking target. It's keccak256 encoded.
   * You may need to use `contract.getLinkingXXX(linkKey)` to get the target.
   **/
  linkKey: string
  /** The link module address of the note. */
  linkModule: string

  /** NFT contract address if this is a minted NFT note. */
  contractAddress: string
  /** The mint module address of the note */
  mintModule: string

  /** Whether or not this note has been deleted. */
  deleted: boolean
  /** Whether or not this note has been locked. I.e., not able to be edited. */
  locked: boolean
}

export type PostNoteOptions = {
  /** If locked, the note will be not able to be edited. */
  locked?: boolean
}