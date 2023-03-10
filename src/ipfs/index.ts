import isIpfs from 'is-ipfs'
import retry from 'async-retry'
import '../utils/fetch'
import type {
  BaseMetadata,
  Metadata,
  NoteMetadata,
  CharacterMetadata,
} from '../types/metadata'
import { IpfsResponse } from '../types/ipfs'
import { Logger } from '../utils/logger'
import { ipfsFetch, isIpfsUrl } from '@crossbell/ipfs-fetch'

export class Ipfs {
  static async uploadJson(json: any) {
    return await retry(
      async () => {
        const res = await fetch('https://ipfs-relay.crossbell.io/json', {
          method: 'POST',
          body: JSON.stringify(json),
        }).then((res) => res.json())

        return res as IpfsResponse
      },
      { retries: 3 },
    )
  }

  static uploadFile(file: File | Blob): Promise<IpfsResponse> {
    return retry(
      async () => {
        const formData = new FormData()

        formData.append('file', file)

        const res = await fetch('https://ipfs-relay.crossbell.io/upload', {
          method: 'post',
          body: formData,
        })

        return await res.json()
      },
      { retries: 3 },
    )
  }

  static async metadataToUri(metadata: Metadata) {
    const res = await this.uploadJson(metadata)

    if (!res?.url?.startsWith('ipfs://')) {
      throw new Error('upload to IPFS failed')
    }

    return res.url
  }

  static async uriToMetadata<T extends Metadata>(uri: string) {
    if (isIpfsUrl(uri)) {
      if (!isIpfs.url(uri)) {
        Logger.error('Wrong IPFS url: ' + uri)
        return
      }
      // to cf-ipfs endpoint
      const res = await ipfsFetch(uri).then((res) => res.text())
      try {
        const json = JSON.parse(res)
        return json as T
      } catch (e) {
        throw new Error('Failed to parse metadata from uri: ' + uri)
      }
    }

    let res
    try {
      res = await fetch(uri).then((res) => res.text())
      res = JSON.parse(res)
      return res as T
    } catch (e) {
      throw new Error(
        `Failed to fetch metadata from uri: ${uri} . Response: ` + res,
      )
    }
  }

  static async parseMetadataOrUri<T = NoteMetadata>(
    type: 'note',
    metadataOrUri: NoteMetadata | string,
    retrieveMetadataIfNeeded?: false,
  ): Promise<{ uri: string }>
  static async parseMetadataOrUri<T = NoteMetadata>(
    type: 'note',
    metadataOrUri: NoteMetadata | string,
    retrieveMetadataIfNeeded: true,
  ): Promise<{ metadata: NoteMetadata; uri: string }>
  static async parseMetadataOrUri<T = CharacterMetadata>(
    type: 'character',
    metadataOrUri: CharacterMetadata | string,
    retrieveMetadataIfNeeded?: false,
  ): Promise<{ uri: string }>
  static async parseMetadataOrUri<T = CharacterMetadata>(
    type: 'character',
    metadataOrUri: CharacterMetadata | string,
    retrieveMetadataIfNeeded: true,
  ): Promise<{ metadata: CharacterMetadata; uri: string }>
  static async parseMetadataOrUri<T extends Metadata>(
    type: BaseMetadata['type'],
    metadataOrUri: T | string,
    retrieveMetadataIfNeeded: boolean = false,
  ): Promise<{ metadata?: T; uri: string }> {
    if (metadataOrUri === '') {
      return { uri: '', metadata: undefined }
    }

    let uri
    let metadata: T | undefined
    if (typeof metadataOrUri === 'string') {
      uri = metadataOrUri
      metadata = retrieveMetadataIfNeeded
        ? await Ipfs.uriToMetadata<T>(uri)
        : undefined
    } else {
      metadata = metadataOrUri
      if (!metadata.type) {
        metadata.type = type
      }
      uri = await Ipfs.metadataToUri(metadata)
    }

    return {
      metadata,
      uri,
    }
  }
}
