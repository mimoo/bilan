<script setup lang="ts">
import { assert, time } from 'console';
import moment from 'moment';
import { Ref, ref, reactive, computed } from 'vue';
import VueCountdown from '@chenfengyuan/vue-countdown';


//
// constants
//

const POMODORO_STORAGE_KEY = "pomodor_v1";

//
// data structures
//

// the displayed submodule
enum Phase {
  StartAPomodoro,
  InPomodoro,
  EndingPomodoro,
}

interface Pomodoro {
  end_date: moment.Moment;
  task: string;
}

//
// init
//

const phase = ref(Phase.StartAPomodoro);

const DEFAULT_TIMER = 30 * 60 * 1000;

const timer = ref(DEFAULT_TIMER);

//
// interaction
// 

function startPomodoro() {
    console.assert(phase.value == Phase.StartAPomodoro);

    phase.value = Phase.InPomodoro;
}

const countdown = ref();

function reset() {
  console.assert(phase.value == Phase.InPomodoro);

  countdown.value.end();
  timer.value = DEFAULT_TIMER;
  console.log(timer.value);


  countdown.value.abort(); 
  timer.value = DEFAULT_TIMER;
  countdown.value.start(); 

  phase.value = Phase.StartAPomodoro;
}

function endPomodoro() {
    console.assert(phase.value == Phase.InPomodoro);

    phase.value = Phase.EndingPomodoro;
}

function finalizePomodoro() {
    console.assert(phase.value == Phase.EndingPomodoro);

    phase.value = Phase.StartAPomodoro;
}
</script>

<template>
  <div class="w-96 shadow-md rounded-3xl px-8 pt-6 pb-8 mb-4" style="background-color: #ffffff">
    <h1 class="text-xl text-center font-bold my-2">    
      <img src="@/assets/tomato.png" class="ml-2 inline-block">
      pomodoro
    </h1>

    <!-- not in pomodoro -->
    <div v-if="phase == Phase.StartAPomodoro">

        <div class="flex p-4 text-sm text-yellow-700 bg-yellow-100 rounded-lg dark:bg-yellow-700 dark:text-yellow-300 mb-5" role="alert">
            <svg aria-hidden="true" class="inline flex-shrink-0 mr-3 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
            <span class="sr-only">Info</span>
            <div>
              A pomodoro is 30 minutes of focused work. If you get distracted during these 30 minutes: reset the timer and start over.
            </div>
        </div>

        <form>
            <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" @click="startPomodoro" >Start</button>
        </form>
    </div>

    <!-- in pomodoro -->
    <div v-if="phase == Phase.InPomodoro">
      <div class="mb-5 border p-5 text-center">
        <vue-countdown ref="countdown" :time="timer" v-slot="{ days, hours, minutes, seconds }" @end="endPomodoro">
            {{ minutes }} minutes and {{ seconds }} seconds
         </vue-countdown>
      </div>

        <form>
          <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" @click="reset">reset</button>
        </form>

    </div>

        <!-- ending pomodoro -->
    <div v-if="phase == Phase.EndingPomodoro">
      <p>Did you succeed?</p>
        <form>
          <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 mr-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" @click="finalizePomodoro">yes</button>


          <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" @click="finalizePomodoro">no</button>
        </form>

    </div>

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
