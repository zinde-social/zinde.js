import '../utils/fetch'
import type {
  BaseMetadata,
  Metadata,
  NoteMetadata,
  ProfileMetadata,
} from '../types/metadata'
import { IpfsResponse } from '../types/ipfs'

export class Ipfs {
  static async uploadJson(json: any) {
    const res = await fetch('https://ipfs-relay.crossbell.io/json', {
      method: 'POST',
      body: JSON.stringify(json),
    }).then((res) => res.json())

    return res as IpfsResponse
  }

  static async metadataToUri(metadata: Metadata) {
    const res = await this.uploadJson(metadata)

    if (!res?.url?.startsWith('ipfs://')) {
      throw new Error('upload to IPFS failed')
    }

    return res.url
  }

  static async uriToMetadata<T extends Metadata>(uri: string) {
    if (uri.startsWith('ipfs://')) {
      // to cf-ipfs endpoint
      uri = uri.replace('ipfs://', 'https://cf-ipfs.com/ipfs/')
    }

    let res
    try {
      res = await fetch(uri).then((res) => res.text())
      res = JSON.parse(res)
      return res as T
    } catch (e) {
      throw new Error(
        `Failed to fetch metadata from uri: ${uri}. Response: ` + res,
      )
    }
  }

  static async parseMetadataOrUri<T = NoteMetadata>(
    type: 'note',
    metadataOrUri: T | string,
    retrieveMetadataIfNeeded?: false,
  ): Promise<{ uri: string }>
  static async parseMetadataOrUri<T = NoteMetadata>(
    type: 'note',
    metadataOrUri: T | string,
    retrieveMetadataIfNeeded: true,
  ): Promise<{ metadata: NoteMetadata; uri: string }>
  static async parseMetadataOrUri<T = ProfileMetadata>(
    type: 'profile',
    metadataOrUri: T | string,
    retrieveMetadataIfNeeded?: false,
  ): Promise<{ uri: string }>
  static async parseMetadataOrUri<T = ProfileMetadata>(
    type: 'profile',
    metadataOrUri: T | string,
    retrieveMetadataIfNeeded: true,
  ): Promise<{ metadata: ProfileMetadata; uri: string }>
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
