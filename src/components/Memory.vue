<script setup lang="ts">
import { assert } from 'console';
import moment from 'moment';
import { Ref, ref, reactive, computed } from 'vue';

//
// constants
//

const MEMORY_STORAGE_KEY = "memory_v5";
const MEMORY_END_STORAGE_KEY = "memory_date_v3";

//
// data structures
//

// the displayed submodule
enum Phase {
  LetsWait,
  LetsRemember,
}

//
// init
//

const phase = ref(Phase.LetsWait);

let end_date = ref(moment());

//
// computed
//

const countdown = computed(() => {
  const ended = end_date.value.isBefore(moment());
  const countdown = moment().to(end_date.value);
  return [ended, countdown];
});

//
// load sprint from storage
//

let date_json: string | null = window.localStorage.getItem(MEMORY_END_STORAGE_KEY);

if (date_json == null) {
  window.localStorage.setItem(MEMORY_END_STORAGE_KEY, JSON.stringify(end_date.value));

  phase.value = Phase.LetsRemember;
} else {
  end_date.value = moment(JSON.parse(date_json));

  if (end_date.value.isBefore(moment())) {
    phase.value = Phase.LetsRemember;
  }
}

//
// LetsRemember phase
//

function remembered(now: moment.Moment) {
    console.assert(phase.value == Phase.LetsRemember);

    // retrieve past data
    let past_memories = [];
    let past_memories_json = window.localStorage.getItem(MEMORY_STORAGE_KEY);
    if (past_memories_json != null) {
        past_memories = JSON.parse(past_memories_json);
        console.log("retrieved past memories:", past_memories);
    }

    // collect the data
    let days = document.querySelectorAll<HTMLInputElement>(".memory_to_collect");
    
    days.forEach((input_el, idx) => {
        const day = moment(JSON.parse(input_el.getAttribute("data")!));
        past_memories.push({
            date: day,
            note: input_el.value,
        })
    });

    // store the data
    console.log("storing past memories", past_memories);
    window.localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(past_memories));

    // reset end date
    end_date.value = moment().add(1, 'week');

    window.localStorage.setItem(MEMORY_END_STORAGE_KEY, JSON.stringify(end_date.value));

    // change phase
    phase.value = Phase.LetsWait;
}

function getDays() : [string, moment.Moment][] {
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    let shifted: [string, moment.Moment][] = [];

    let start = moment().subtract(1, 'week').weekday();

    for (let i = 0; i <7; i++) {
        let day_idx = (start + i) % 7;
        let day = moment(start).add(i, 'days');
        shifted.push([days[day_idx], day]);
    }

    return shifted;
}

//
// debug
// 

function reset() {
    console.assert(phase.value == Phase.LetsWait);

    end_date.value = moment();

    window.localStorage.setItem(MEMORY_END_STORAGE_KEY, JSON.stringify(end_date.value));
    
    phase.value = Phase.LetsRemember;
}
</script>

<template>
  <div class="w-96 shadow-md rounded-3xl px-8 pt-6 pb-8 mb-4" style="background-color: #ffffff">
    <h1 class="text-xl text-center font-bold my-2">
            <img src="@/assets/memory.png" class="ml-2 inline-block w-5">
            memory (<small><span v-if="countdown[0]">ended</span><span v-else>ending</span> {{ countdown[1] }}</small>)</h1>

    <!-- lets wait -->
    <div v-if="phase == Phase.LetsWait">
      <div class="flex p-4 text-sm text-yellow-700 bg-yellow-100 rounded-lg dark:bg-yellow-700 dark:text-yellow-300" role="alert">
        <svg aria-hidden="true" class="inline flex-shrink-0 mr-3 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
        <span class="sr-only">Info</span>
        <div>
          Let's wait for a week before asking you to do this again :)
        </div>
      </div>
    </div>

    <!-- lets remember -->
    <div v-if="phase == Phase.LetsRemember">

      <div class="flex p-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-700 dark:text-green-300" role="alert">
        <svg aria-hidden="true" class="inline flex-shrink-0 mr-3 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
        <span class="sr-only">Info</span>
        <div>
          Let's do two things here: let's try to write a short sentence to <strong>resume each day</strong> of your previous week, as well as remember things you're <strong>grateful</strong> for.
        </div>
      </div>

        <div class="my-6" v-for="([day, eee], idx) in getDays()">
            <label :for="'note-memory-' + idx" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">{{day}} <span v-if="idx==0">(last)</span></label>

            <input type="text" :id="'note-memory-' + idx" class="memory_to_collect bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" :placeholder="'notes for ' + day" :data="JSON.stringify(eee)"  autocomplete="off" required>
        </div>

        <div class="my-6" >
            <label for="note-memory-last" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Today</label>

            <input type="text" id="note-memory-last" aria-label="disabled input" class="mb-6 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" value="no note required for today" disabled>

        </div>

        <button type="button" class="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2" @click="remembered(moment())">Save</button>


    </div>

  <!-- debug 
  <hr class="m-5">

  <button type="button" class="mr-5 py-2 px-3 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" @click="reset">reset</button>

  -->
  </div>
</template>

<style scoped>
p {
  @apply my-4;
}

a {
  @apply text-link;
}

code {
  @apply bg-code py-0.5 px-1 text-code text-sm;
}
</style>
