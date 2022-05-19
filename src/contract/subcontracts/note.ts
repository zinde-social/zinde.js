import { ethers } from 'ethers'
import { BaseContract } from './base'
import { Result, Note, NoteMetadata } from '../../types'
import { Ipfs } from '../../ipfs'
import { NIL_ADDRESS } from '../utils'

export class NoteContract extends BaseContract {
  /**
   * This creates a new note.
   * @category Note
   * @param profileId - The profile ID of the owner who post this note. Must be your own profile, otherwise it will be rejected.
   * @param metadataOrUri - The metadata or URI of the content you want to post.
   * @returns The id of the new note.
   */
  async postNote(
    profileId: string,
    metadataOrUri: NoteMetadata | string,
  ): Promise<Result<{ noteId: string }, true>> | never {
    const { uri } = await Ipfs.parseMetadataOrUri('note', metadataOrUri)

    const tx = await this.contract.postNote({
      profileId: profileId,
      contentUri: uri,
      linkModule: NIL_ADDRESS, // TODO:
      linkModuleInitData: NIL_ADDRESS,
      mintModule: NIL_ADDRESS,
      mintModuleInitData: NIL_ADDRESS,
    })

    const receipt = await tx.wait()

    const log = this.parseLog(receipt.logs, 'postNote')

    return {
      data: {
        noteId: log.args.noteId.toNumber().toString(),
      },
      transactionHash: receipt.transactionHash,
    }
  }

  /**
   * This returns the info of a note.
   * @category Note
   * @param profileId - The profile ID of the address who owns the note.
   * @param noteId - The id of the note you want to get the info for.
   * @returns The info of the note.
   */
  async getNote(
    profileId: string,
    noteId: string,
  ): Promise<Result<Note>> | never {
    const data = await this.contract.getNote(profileId, noteId)

    const linkItemTypeString = ethers.utils.parseBytes32String(
      data.linkItemType,
    )
    const linkItemType =
      linkItemTypeString === ''
        ? undefined
        : (linkItemTypeString as Note['linkItemType'])

    const metadata = data.contentUri
      ? await Ipfs.uriToMetadata<NoteMetadata>(data.contentUri)
      : undefined

    return {
      data: {
        profileId: profileId,
        noteId: noteId,
        contentUri: data.contentUri,
        metadata,
        linkItemTypeBytes32: data.linkItemType,
        linkItemType: linkItemType,
        linkKey: data.linkKey,
        linkModule: data.linkModule,
        mintNFT: data.mintNFT,
        mintModule: data.mintModule,
        deleted: data.deleted,
      },
    }
  }

  /**
   * This mints a note as an NFT.
   * @category Note
   * @param profileId - The profile ID of the address who owns the note.
   * @param noteId - The id of the note you want to get the info for.
   * @param toAddress
   * @returns
   */
  async mintNote(
    profileId: string,
    noteId: string,
    toAddress: string,
  ): Promise<Result<undefined, true>> | never {
    const tx = await this.contract.mintNote({
      profileId: profileId,
      noteId: noteId,
      to: toAddress,
      mintModuleData: NIL_ADDRESS,
    })

    const receipt = await tx.wait()

    return {
      data: undefined,
      transactionHash: receipt.transactionHash,
    }
  }
}
