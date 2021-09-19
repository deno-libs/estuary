import type { Pin, PinList, DataFromCID, Content, Deal, Transfer } from './types.ts'
import { createRequest } from './request.ts'

class Client {
  apiKey: string
  request: ReturnType<typeof createRequest>
  constructor(apiKey: string) {
    this.apiKey = apiKey

    this.request = createRequest({ apiKey })
  }
}

export class PinningClient extends Client {
  constructor(apiKey: string) {
    super(apiKey)
  }
  async listPins(): Promise<PinList> {
    return await this.request({ url: '/pinning/pins' })
  }
  async addPin({ name, cid }: { name: string; cid: string }): Promise<Pin> {
    return await this.request({
      url: '/pinning/pins',
      options: { body: JSON.stringify({ name, cid }), method: 'POST' }
    })
  }
  async pinById(id: number | string): Promise<Pin> {
    return await this.request({ url: `/pinning/pins/${id}` })
  }
  async removePin(id: number | string) {
    return await this.request({ url: `/pinning/pins/${id}`, options: { method: 'DELETE' } })
  }
}

export class ContentClient extends Client {
  constructor(apiKey: string) {
    super(apiKey)
  }
  async add(file: Blob) {
    const body = new FormData()
    body.append('append', file)
    return await this.request({ url: `/content/add`, options: { method: 'POST', body } })
  }
  async addFromIPFS({ name, root }: { name: string; root: string }): Promise<Pin> {
    return await this.request({
      url: `/content/add-ipfs`,
      options: { method: 'POST', body: JSON.stringify({ name, root }) }
    })
  }
  async dataByCID(cid: string): Promise<DataFromCID> {
    return await this.request({
      url: `/content/by-cid/${cid}`
    })
  }
  async stats({ offset = 0, limit = 500 }: { offset?: number; limit?: number }): Promise<
    {
      id: number
      cid: Record<string, string>
      file: string
      bwUsed: number
      totalRequests: number
      offloaded: boolean
      aggregatedFiles: number
    }[]
  > {
    return await this.request({
      url: `/content/stats?offset=${offset}&limit=${limit}`
    })
  }
  async deals(): Promise<Content[]> {
    return await this.request({
      url: `/content/deals`
    })
  }
  async dealStatusById(id: number): Promise<{
    content: Content
    deals: {
      deal: Deal
      transfer: Transfer
      onChainState: any
    }[]
    failuresCount: number
  }> {
    return await this.request({
      url: `/content/status/${id}`
    })
  }
}

export class PublicClient extends Client {
  constructor(apiKey: string) {
    super(apiKey)
  }
  async getPublicStats(): Promise<{
    totalStorage: number
    totalFiles: number
    dealsOnChain: number
  }> {
    return await this.request({
      url: `/public/stats`
    })
  }
  async getDealsOnChain(): Promise<
    {
      time: string
      dealsOnChain: number
      dealsOnChainBytes: number
      dealsAttempted: number
      dealsSealed: number
      dealsSealedBytes: number
      dealsFailed: number
    }[]
  > {
    return await this.request({
      url: '/public/metrics/deals-on-chain'
    })
  }
  async queryMiner(miner: string): Promise<{
    miner: string
    price: string
    verifiedPrice: string
    minPieceSize: number
    maxPieceSize: number
  }> {
    return await this.request({
      url: `/public/miners/storage/query/${miner}`
    })
  }
  async getMinerFailures(miner: string): Promise<
    Record<
      string,
      {
        ID: number
        CreatedAt: string
        UpdatedAt: string
        DeletedAt: null
        miner: string
        phase: string
        message: string
        content: number
        minerVersion: string
      }
    >
  > {
    return await this.request({
      url: `/public/miners/failures/${miner}`
    })
  }
  async getMinerDeals(miner: string): Promise<
    Record<
      string,
      {
        id: number
        CreatedAt: string
        UpdatedAt: string
        content: number
        propCid: string
        miner: string
        dealId: number
        failed: boolean
        verified: boolean
        failedAt: string
        dtChan: string
        transferStarted: string
        transferFinished: string
        onChainAt: string
        sealedAt: string
        contentCid: string
      }
    >
  > {
    return await this.request({
      url: `/public/miners/deals/${miner}`
    })
  }
}

export class Estuary extends Client {
  pins: PinningClient
  content: ContentClient
  public: PublicClient
  constructor(apiKey: string) {
    super(apiKey)
    this.pins = new PinningClient(this.apiKey)
    this.content = new ContentClient(this.apiKey)
    this.public = new PublicClient(this.apiKey)
  }
}

const client = new Estuary('EST21a4fb54-7a20-4760-8e4e-8761bd427cf5ARY')

client.public.queryMiner('f0135078').then((x) => console.log(JSON.stringify(x, null, 2)))
