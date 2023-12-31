<script setup lang="ts">
import { createContract, createIndexer } from 'crossbell'
import { onErrorCaptured, ref } from 'vue'
import { useDark, useEventListener, useLocalStorage } from '@vueuse/core'
import { type Address } from 'abitype'

useDark()
useEventListener(window, 'error', (event) => showResult(event))
useEventListener(window, 'unhandledrejection', (event) =>
  showResult(event.reason.toString()),
)
onErrorCaptured((err) => {
  showResult(err)
})

const metamask = window.ethereum
const contract = createContract(metamask)

const indexer = createIndexer()

const address = useLocalStorage<Address>('address', '0x')
const characterId = useLocalStorage('characterId', '')
const handle = useLocalStorage('handle', '')
const result = ref('')
const loading = ref(false)

async function connect() {
  await showResult(contract.walletClient.requestAddresses())
}

async function showResult(p: any) {
  loading.value = true
  try {
    result.value = JSON.stringify(
      await p,
      (key: string, value: any) =>
        typeof value === 'bigint' ? value.toString() : value,
      2,
    )
  } catch (err: any) {
    result.value = err
  } finally {
    loading.value = false
  }
}

function balance() {
  showResult(
    contract.csb.getBalance({
      owner: address.value,
    }),
  )
}

function transfer() {
  showResult(
    contract.csb.transfer({
      toAddress: address.value,
      amount: 0,
    }),
  )
}

function getPrimaryHandle() {
  showResult(
    contract.character.getPrimaryId({
      address: address.value,
    }),
  )
}

function getCharacterByHandle() {
  showResult(
    contract.character.getByHandle({
      handle: handle.value,
    }),
  )
}

function getCharacter() {
  showResult(
    contract.character.get({
      characterId: characterId.value,
    }),
  )
}

function setPrimaryCharacterId() {
  showResult(
    contract.character.setPrimaryId({
      characterId: +characterId.value,
    }),
  )
}

function getCharacters() {
  showResult(indexer.character.getMany(address.value))
}

function getNotes() {
  showResult(indexer.note.getMany({ characterId: characterId.value }))
}
function getFeeds() {
  showResult(indexer.feed.getManyByCharacter(characterId.value))
}
</script>

<template>
  <h1 text="3xl" py4 text-center font-mono>Crossbell.js Demo</h1>
  <hr />
  <div flex="~ gap2 wrap" font-mono mb2>
    <input v-model="address" type="text" placeholder="address" />
    <input v-model="characterId" type="text" placeholder="characterId" />
    <input v-model="handle" type="text" placeholder="handle" />
  </div>
  <fieldset flex="~ gap2 wrap" border p2 mb2>
    <legend>Contract</legend>
    <button @click="connect">connect</button>
    <button @click="balance">balance</button>
    <button @click="transfer">transfer</button>
    <button @click="getPrimaryHandle">getPrimaryHandle</button>
    <button @click="getCharacter">getCharacter</button>
    <button @click="getCharacterByHandle">getCharacterByHandle</button>
    <button @click="setPrimaryCharacterId">setPrimaryCharacterId</button>
  </fieldset>
  <fieldset flex="~ gap2 wrap" border p2>
    <legend>Indexer</legend>
    <button @click="getCharacters">getCharacters</button>
    <button @click="getNotes">getNotes</button>
    <button @click="getFeeds">getFeeds</button>
  </fieldset>
  <pre whitespace-pre-wrap break-words bg="gray/80" p4 my4 rounded-4>{{
    loading ? 'Loading...' : result
  }}</pre>
</template>
