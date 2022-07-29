<script setup lang="ts"
>
import { watch, ref, reactive, computed } from 'vue';

//
// constants
//

const MOTO_STORAGE_KEY = "moto_v1";

//
// init
//

let moto = ref("");

//
// load moto from storage
//

let moto_storage: string | null = window.localStorage.getItem(MOTO_STORAGE_KEY);
if (moto_storage == null) {
      window.localStorage.setItem(MOTO_STORAGE_KEY, "");
} else {
    moto.value = moto_storage;
}

//
// modify moto
//

//watch(moto, async (newMoto, oldMoto) => {
//    window.localStorage.setItem(MOTO_STORAGE_KEY, newMoto);
//})

function onInput(e: any) {
    const newMoto = e.target.innerText;
    window.localStorage.setItem(MOTO_STORAGE_KEY, newMoto);
}
</script>

<template>
  <div class="basis-1/3 shadow-md rounded-3xl px-8 pt-6 pb-8 mb-4" style="background-color: #ffffff">
    <h1 class="text-xl text-center font-bold my-2">moto</h1>

    <div class="uppercase input-box whitespace-pre-wrap text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 caret-black" contenteditable="true" @input="onInput">{{moto}}</div>


  </div>
</template>