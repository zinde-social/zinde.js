import { type BigNumberish, ethers } from 'ethers'
import { BaseContract } from './base'
import { autoSwitchMainnet } from '../decorators'
import { NIL_ADDRESS } from '../utils'
import type {
  CallOverrides,
  Character,
  Overrides,
  Result,
} from '../../types/contract'

export class LinkContract extends BaseContract {
  /**
   * This links a character to another character with a given link type.
   * @category Link
   * @param fromCharacterId - The character ID of the character that is linking to another character. Must be your own character, otherwise it will be rejected.
   * @param toCharacterId - The character ID of the character you want to link to.
   * @param linkType - The type of link.
   * @param data - The data to be passed to the link module if the character has one.
   * @returns The linklist id and the transaction hash of the transaction that was sent to the blockchain.
   */
  @autoSwitchMainnet()
  async linkCharacter(
    fromCharacterId: BigNumberish,
    toCharacterId: BigNumberish,
    linkType: string,
    data?: string,
    overrides: Overrides = {},
  ): Promise<Result<number, true>> | never {
    const tx = await this.contract.linkCharacter(
      {
        fromCharacterId: fromCharacterId,
        toCharacterId: toCharacterId,
        linkType: ethers.utils.formatBytes32String(linkType),
        data: data ?? NIL_ADDRESS,
      },
      overrides,
    )

    const receipt = await tx.wait()

    const parser = this.parseLog(receipt.logs, 'linkCharacter')

    return {
      data: parser.args.linklistId.toNumber(),
      transactionHash: receipt.transactionHash,
    }
  }

  /**
   * This links a character to multiple characters with a given link type in batch.
   *
   * This could be considered a bulk version of {@link linkCharacter} & {@link createThenLinkCharacter}
   *
   * @category Link
   * @param fromCharacterId - The character ID of the character that is linking to another character. Must be your own character, otherwise it will be rejected.
   * @param toCharacterIds - The character IDs of the character you want to link to.
   * @param toAddresses - The addresses of the characters you want to link to (who don't have a character). See more on {@link createThenLinkCharacter}
   * @param linkType - The type of link.
   * @param data - The data to be passed to the link module if the character has one. It should has the same length as `toCharacterIds`.
   * @returns The linklist id and the transaction hash of the transaction that was sent to the blockchain.
   */
  @autoSwitchMainnet()
  async linkCharactersInBatch(
    fromCharacterId: BigNumberish,
    toCharacterIds: BigNumberish[],
    toAddresses: string[],
    linkType: string,
    data?: string[],
    overrides: Overrides = {},
  ): Promise<Result<number, true>> | never {
    toAddresses.forEach((address) => {
      this.validateAddress(address)
    })

    const tx = await this.peripheryContract.linkCharactersInBatch(
      {
        fromCharacterId: fromCharacterId,
        toCharacterIds,
        toAddresses,
        linkType: ethers.utils.formatBytes32String(linkType),
        data: data ?? toCharacterIds.map(() => NIL_ADDRESS),
      },
      overrides,
    )

    const receipt = await tx.wait()

    const log = this.parseLog(receipt.logs, 'linkCharacter', {
      throwOnMultipleLogsFound: false,
    })

    return {
      data: log.args.linklistId.toNumber(),
      transactionHash: receipt.transactionHash,
    }
  }

  /**
   * This gets the linklist id of a {@link linkCharacter} transaction.
   * @category Link
   * @param txHash - The transaction hash of the transaction you want to get the linklist id of.
   * @returns The linklist id of the transaction.
   */
  async getLinklistIdByTransaction(
    txHash: string,
  ): Promise<Result<number>> | never {
    const receipt = await this.contract.provider.getTransactionReceipt(txHash)

    const parser = this.parseLog(receipt.logs, 'linkCharacter')

    return {
      data: parser.args.linklistId.toNumber(),
    }
  }

  /**
   * This creates a character for an target address and links the fromCharacter to it.
   *
   * This should be only called when the target address doesn't have any character.
   * When called on an address that already has a character, this will fail.
   * When called, this will create a new character for the target address
   * and set the new character as the primary character for this address.
   * The new character's handle will be set to the address of the target address.
   *
   * @category Link
   * @param fromCharacterId - The character ID of the character that is creating the new character. Must be your own character, otherwise it will be rejected.
   * @param toAddress - The address of the character you want to link to.
   * @param linkType - The type of link you want to create. This is a string.
   * @returns The transaction hash of the transaction that was sent to the blockchain, the toCharacterId and linklistId.
   */
  @autoSwitchMainnet()
  async createThenLinkCharacter(
    fromCharacterId: BigNumberish,
    toAddress: string,
    linkType: string,
    overrides: Overrides = {},
  ):
    | Promise<Result<{ toCharacterId: number; linklistId: number }, true>>
    | never {
    this.validateAddress(toAddress)

    const tx = await this.contract.createThenLinkCharacter(
      {
        fromCharacterId: fromCharacterId,
        to: toAddress,
        linkType: ethers.utils.formatBytes32String(linkType),
      },
      overrides,
    )

    const receipt = await tx.wait()

    const createCharacterParser = this.parseLog(receipt.logs, 'createCharacter')
    const linkCharacterParser = this.parseLog(receipt.logs, 'linkCharacter')

    return {
      data: {
        toCharacterId: createCharacterParser.args.characterId.toNumber(),
        linklistId: linkCharacterParser.args.linklistId.toNumber(),
      },
      transactionHash: receipt.transactionHash,
    }
  }

  /**
   * This removes a link from a character to another character.
   * @category Link
   * @param fromCharacterId - The character ID of the character that is linking to another character.
   * @param toCharacterId - The character you want to link to.
   * @param linkType - The type of link.
   * @returns The transaction hash of the transaction that was sent to the blockchain.
   */
  @autoSwitchMainnet()
  async unlinkCharacter(
    fromCharacterId: BigNumberish,
    toCharacterId: BigNumberish,
    linkType: string,
    overrides: Overrides = {},
  ): Promise<Result<undefined, true>> | never {
    const tx = await this.contract.unlinkCharacter(
      {
        fromCharacterId: fromCharacterId,
        toCharacterId: toCharacterId,
        linkType: ethers.utils.formatBytes32String(linkType),
      },
      overrides,
    )
    const receipt = await tx.wait()
    return {
      data: undefined,
      transactionHash: receipt.transactionHash,
    }
  }

  /**
   * This returns the *attached* linked character ID of a character with a given link type.
   * @category Link
   * @param fromCharacterId - The character ID of the character you want to get the linked characters from.
   * @param linkType - The type of link you want to get.
   * @returns An array of character ids that are linked to the character id passed in.
   */
  async getLinkingCharacterIds(
    fromCharacterId: BigNumberish,
    linkType: string,
    overrides: CallOverrides = {},
  ): Promise<Result<number[]>> | never {
    const linkList = await this.peripheryContract.getLinkingCharacterIds(
      fromCharacterId,
      ethers.utils.formatBytes32String(linkType),
      overrides,
    )
    return {
      data: linkList.map((link) => link.toNumber()),
    }
  }

  /**
   * This returns the *attached* linked character of a character with a given link type.
   * @category Link
   * @param fromCharacterId - The character ID of the character you want to get the linked characters from.
   * @param linkType - The type of link you want to get.
   * @returns An array of character that are linked to the character id passed in.
   */
  async getLinkingCharacters(
    fromCharacterId: BigNumberish,
    linkType: string,
    overrides: CallOverrides = {},
  ): Promise<Result<Character[]>> | never {
    const ids = await this.peripheryContract.getLinkingCharacterIds(
      fromCharacterId,
      ethers.utils.formatBytes32String(linkType),
      overrides,
    )
    const characters = await Promise.all(
      /// @ts-ignore
      ids.map((ids) => this.getCharacter(ids.toNumber())),
    )
    return {
      data: characters.map((character) => character.data),
    }
  }

  /** link address */

  /**
   * This links a character to an address with a given link type.
   * @category Link
   * @param fromCharacterId - The character ID of the character that is linking to the address.
   * @param toAddress - The address of the character you want to link to.
   * @param linkType - The type of link.
   * @param data - The data to be passed to the link module if the address has one.
   * @returns The transaction hash of the transaction that was sent to the blockchain, and the linklistId.
   */
  @autoSwitchMainnet()
  async linkAddress(
    fromCharacterId: string,
    toAddress: string,
    linkType: string,
    data: string = NIL_ADDRESS,
    overrides: Overrides = {},
  ): Promise<Result<number, true>> | never {
    const tx = await this.contract.linkAddress(
      {
        fromCharacterId,
        ethAddress: toAddress,
        linkType: ethers.utils.formatBytes32String(linkType),
        data,
      },
      overrides,
    )

    const receipt = await tx.wait()

    const parser = this.parseLog(receipt.logs, 'linkAddress')

    return {
      data: parser.args.linklistId.toNumber(),
      transactionHash: receipt.transactionHash,
    }
  }

  /**
   * This removes a link from a character to an address.
   * @category Link
   * @param fromCharacterId - The character ID of the character that is linking to another character.
   * @param toAddress - The address you want to unlink from.
   * @param linkType - The type of link.
   * @returns The transaction hash of the transaction that was sent to the blockchain.
   */
  @autoSwitchMainnet()
  async unlinkAddress(
    fromCharacterId: BigNumberish,
    toAddress: string,
    linkType: string,
    overrides: Overrides = {},
  ): Promise<Result<undefined, true>> | never {
    const tx = await this.contract.unlinkAddress(
      {
        fromCharacterId: fromCharacterId,
        ethAddress: toAddress,
        linkType: ethers.utils.formatBytes32String(linkType),
      },
      overrides,
    )
    const receipt = await tx.wait()
    return {
      data: undefined,
      transactionHash: receipt.transactionHash,
    }
  }

  /** link any */

  /**
   * This links a character to any uri with a given link type.
   * @category Link
   * @param fromCharacterId - The character ID of the character that is linking to the address.
   * @param toUri - The uri of the character you want to link to.
   * @param linkType - The type of link.
   * @param data - The data to be passed to the link module if the address has one.
   * @returns The transaction hash of the transaction that was sent to the blockchain, and the linklistId.
   */
  @autoSwitchMainnet()
  async linkAnyUri(
    fromCharacterId: string,
    toUri: string,
    linkType: string,
    data: string = NIL_ADDRESS,
    overrides: Overrides = {},
  ): Promise<Result<number, true>> | never {
    const tx = await this.contract.linkAnyUri(
      {
        fromCharacterId,
        toUri,
        linkType: ethers.utils.formatBytes32String(linkType),
        data,
      },
      overrides,
    )

    const receipt = await tx.wait()

    const parser = this.parseLog(receipt.logs, 'linkAnyUri')

    return {
      data: parser.args.linklistId.toNumber(),
      transactionHash: receipt.transactionHash,
    }
  }

  /**
   * This removes a link from a character to an uri.
   * @category Link
   * @param fromCharacterId - The character ID of the character that is linking to another character.
   * @param toUri - The uri you want to unlink from.
   * @param linkType - The type of link.
   * @returns The transaction hash of the transaction that was sent to the blockchain.
   */
  @autoSwitchMainnet()
  async unlinkAnyUri(
    fromCharacterId: BigNumberish,
    toUri: string,
    linkType: string,
    overrides: Overrides = {},
  ): Promise<Result<undefined, true>> | never {
    const tx = await this.contract.unlinkAnyUri(
      {
        fromCharacterId,
        toUri,
        linkType: ethers.utils.formatBytes32String(linkType),
      },
      overrides,
    )
    const receipt = await tx.wait()
    return {
      data: undefined,
      transactionHash: receipt.transactionHash,
    }
  }

  /** link ERC721 token */

  /**
   * This links a character to any uri with a given link type.
   * @category Link
   * @param fromCharacterId - The character ID of the character that is linking to the address.
   * @param toContractAddress - The address of the ERC721 contract.
   * @param toTokenId - The token id of the ERC721 token.
   * @param linkType - The type of link.
   * @param data - The data to be passed to the link module if the address has one.
   * @returns The transaction hash of the transaction that was sent to the blockchain, and the linklistId.
   */
  @autoSwitchMainnet()
  async linkErc721(
    fromCharacterId: string,
    toContractAddress: string,
    toTokenId: BigNumberish,
    linkType: string,
    data: string = NIL_ADDRESS,
    overrides: Overrides = {},
  ): Promise<Result<number, true>> | never {
    const tx = await this.contract.linkERC721(
      {
        fromCharacterId,
        tokenAddress: toContractAddress,
        tokenId: toTokenId,
        linkType: ethers.utils.formatBytes32String(linkType),
        data,
      },
      overrides,
    )

    const receipt = await tx.wait()

    const parser = this.parseLog(receipt.logs, 'linkAnyUri')

    return {
      data: parser.args.linklistId.toNumber(),
      transactionHash: receipt.transactionHash,
    }
  }

  /**
   * This removes a link from a character to an Erc721 token.
   * @category Link
   * @param fromCharacterId - The character ID of the character that is linking to another character.
   * @param toContractAddress - The address of the ERC721 contract.
   * @param toTokenId - The token id of the ERC721 token.
   * @param linkType - The type of link.
   * @returns The transaction hash of the transaction that was sent to the blockchain.
   */
  @autoSwitchMainnet()
  async unlinkErc721(
    fromCharacterId: BigNumberish,
    toContractAddress: string,
    toTokenId: BigNumberish,
    linkType: string,
    overrides: Overrides = {},
  ): Promise<Result<undefined, true>> | never {
    const tx = await this.contract.unlinkERC721(
      {
        fromCharacterId,
        tokenAddress: toContractAddress,
        tokenId: toTokenId,
        linkType: ethers.utils.formatBytes32String(linkType),
      },
      overrides,
    )
    const receipt = await tx.wait()
    return {
      data: undefined,
      transactionHash: receipt.transactionHash,
    }
  }

  /** link note */

  /**
   * This links a character to another note with a given link type.
   * @category Link
   * @param fromCharacterId - The character ID of the character that is linking to another note. Must be your own character, otherwise it will be rejected.
   * @param toCharacterId - The character ID of the character you want to link to.
   * @param toNoteId - The note ID of the note you want to link to.
   * @param linkType - The type of link.
   * @param data - The data to be passed to the link module if the character has one.
   * @returns The linklist id and the transaction hash of the transaction that was sent to the blockchain.
   */
  @autoSwitchMainnet()
  async linkNote(
    fromCharacterId: BigNumberish,
    toCharacterId: BigNumberish,
    toNoteId: BigNumberish,
    linkType: string,
    data?: string,
    overrides: Overrides = {},
  ): Promise<Result<number, true>> | never {
    const tx = await this.contract.linkNote(
      {
        fromCharacterId: fromCharacterId,
        toCharacterId: toCharacterId,
        toNoteId: toNoteId,
        linkType: ethers.utils.formatBytes32String(linkType),
        data: data ?? NIL_ADDRESS,
      },
      overrides,
    )

    const receipt = await tx.wait()

    const parser = this.parseLog(receipt.logs, 'linkNote')

    return {
      data: parser.args.linklistId.toNumber(),
      transactionHash: receipt.transactionHash,
    }
  }

  /**
   * This removes a link from a character to another note.
   * @category Link
   * @param fromCharacterId - The character ID of the character that is linking to another note.
   * @param toCharacterId - The character you want to unlink to.
   * @param toNoteId - The note ID of the note you want to unlink to.
   * @param linkType - The type of link.
   * @returns The transaction hash of the transaction that was sent to the blockchain.
   */
  @autoSwitchMainnet()
  async unlinkNote(
    fromCharacterId: BigNumberish,
    toCharacterId: BigNumberish,
    toNoteId: BigNumberish,
    linkType: string,
    overrides: Overrides = {},
  ): Promise<Result<undefined, true>> | never {
    const tx = await this.contract.unlinkNote(
      {
        fromCharacterId: fromCharacterId,
        toCharacterId: toCharacterId,
        toNoteId: toNoteId,
        linkType: ethers.utils.formatBytes32String(linkType),
      },
      overrides,
    )

    const receipt = await tx.wait()

    return {
      data: undefined,
      transactionHash: receipt.transactionHash,
    }
  }

  /** link linklist */

  /**
   * This links a character to a linklist with a given link type.
   * @category Link
   * @param fromCharacterId - The character ID of the character that is linking to another note. Must be your own character, otherwise it will be rejected.
   * @param toLinklistId - The linklist ID of the linklist you want to link to.
   * @param linkType - The type of link.
   * @param data - The data to be passed to the link module if the character has one.
   * @returns The linklist id and the transaction hash of the transaction that was sent to the blockchain.
   */
  @autoSwitchMainnet()
  async linkLinklist(
    fromCharacterId: BigNumberish,
    toLinkListId: BigNumberish,
    linkType: string,
    data: string = NIL_ADDRESS,
    overrides: Overrides = {},
  ): Promise<Result<number, true>> | never {
    const tx = await this.contract.linkLinklist(
      {
        fromCharacterId,
        toLinkListId,
        linkType: ethers.utils.formatBytes32String(linkType),
        data,
      },
      overrides,
    )

    const receipt = await tx.wait()

    const parser = this.parseLog(receipt.logs, 'linkNote')

    return {
      data: parser.args.linklistId.toNumber(),
      transactionHash: receipt.transactionHash,
    }
  }

  /**
   * This removes a link from a character to a linklist.
   * @category Link
   * @param fromCharacterId - The character ID of the character that is linking to another note.
   * @param toLinklistId - The linklist ID of the linklist you want to unlink to.
   * @param linkType - The type of link.
   * @returns The transaction hash of the transaction that was sent to the blockchain.
   */
  @autoSwitchMainnet()
  async unlinkLinklist(
    fromCharacterId: BigNumberish,
    toLinklistId: BigNumberish,
    linkType: string,
    overrides: Overrides = {},
  ): Promise<Result<undefined, true>> | never {
    const tx = await this.contract.unlinkLinklist(
      {
        fromCharacterId,
        toLinkListId: toLinklistId,
        linkType: ethers.utils.formatBytes32String(linkType),
      },
      overrides,
    )

    const receipt = await tx.wait()

    return {
      data: undefined,
      transactionHash: receipt.transactionHash,
    }
  }

  /** linklist uri */

  // TODO: next version
  // async setLinklistUri(
  //   fromCharacterId: string,
  //   uri: string, // Name: Atlas's follow links
  // ): Promise<Result<undefined>> | never {
  //   const tx = await this.contract.setLinklistUri(fromCharacterId, uri)
  //   const receipt = await tx.wait()
  //   return {
  //     data: undefined,
  //     transactionHash: receipt.transactionHash,
  //   }
  // }

  // TODO: next version
  // async getLinklistUri(
  //   fromCharacterId: string,
  //   linkType: string,
  // ): Promise<Result<string>> | never {
  //   const uri = await this.contract.getLinklistUri(fromCharacterId, linkType)
  //   return {
  //     data: uri,
  //     transactionHash: undefined,
  //   }
  // }
}
