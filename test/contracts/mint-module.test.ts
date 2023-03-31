import { BigNumber } from 'ethers'
import { expect, describe, test } from 'vitest'
import { Contract } from '../../src'

const contract = new Contract()

describe('mind-module', () => {
  test('decodeModuleInitData', async () => {
    const result = await contract.decodeModuleInitData(
      '0x328610484ba1faae0fcdee44990d199cd84c8608',
      '0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000c560eb6fd0c2eb80df50e5e06715295ae1205049000000000000000000000000c8b960d09c0078c18dcbe7eb9ab9d816bcca89440000000000000000000000002a06a05f456b53e3b0cd3ca3bf68ce76f3ce84ad00000000000000000000000008d66b34054a174841e2361bd4746ff9f4905cc20000000000000000000000003b617bf6bdc01e09dfa99dce760299706e0412ca0000000000000000000000000fefed77bb715e96f1c35c1a4e0d349563d6f6c0000000000000000000000000d3e8ce4841ed658ec8dcb99b7a74befc377253ea000000000000000000000000c3830172ef4e76e2a35f2b540579fd4507a77cb70000000000000000000000003b6d02a24df681ffdf621d35d70aba7adaac07c10000000000000000000000000827e5665b1db2bed70ceae6f9e94d2996fb06c8',
    )
    expect(result).toBeInstanceOf(Array)
    expect(result).toHaveLength(2)
    expect(result[0].value).toBeInstanceOf(Array)
    expect(result[1].value).toBeInstanceOf(BigNumber)
  })
})
