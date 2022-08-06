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

let pomodoro_list = ref<Pomodoro[]>([]);

const task = ref("");

const DEFAULT_TIMER = 30 * 60 * 1000;

const timer = ref(DEFAULT_TIMER);

//
// computed
//

const accomplished = computed(() => {
    let accomplished: Record<string, number> = {};
    for (let pomodoro of pomodoro_list.value) {
        // filter older than a week old
        if (moment().subtract('1', 'week').isBefore(pomodoro.end_date)) {
            // the array is sorted from new to old, 
            return;
        }

        const task = pomodoro.task;
        if(accomplished[task] == null) {
            accomplished[task] = 0;
        } else {
            accomplished[task] += 1;
        }
    }
});

//
// load previous pomodoro from storage
//

let pomodoro_json: string | null = window.localStorage.getItem(POMODORO_STORAGE_KEY);

if (pomodoro_json == null) {
  window.localStorage.setItem(POMODORO_STORAGE_KEY, JSON.stringify(pomodoro_list.value));
} else {
  pomodoro_list.value = JSON.parse(pomodoro_json);
}

//
// interaction
// 

function startPomodoro() {
    console.log("yo");
    console.assert(phase.value == Phase.StartAPomodoro);

    task.value =  document.querySelector<HTMLInputElement>("#task")!.value;

    phase.value = Phase.InPomodoro;
}

const countdown = ref();

function reset() {
    console.assert(phase.value == Phase.InPomodoro);

countdown.value.end();
    timer.value = DEFAULT_TIMER;
    console.log(timer.value);

console.log("Try to abort");
    countdown.value.abort(); 
    timer.value = DEFAULT_TIMER;
    countdown.value.start(); 
//phase.value = Phase.StartAPomodoro;
//phase.value = Phase.InPomodoro;

}

function endPomodoro() {
    console.assert(phase.value == Phase.InPomodoro);

    phase.value = Phase.EndingPomodoro;
}

function finalizePomodoro() {
    console.assert(phase.value == Phase.EndingPomodoro);

    // add in front of the list
    pomodoro_list.value.unshift({
        end_date: moment(),
        task: task.value,
    });

    window.localStorage.setItem(POMODORO_STORAGE_KEY, JSON.stringify(pomodoro_list.value));

    phase.value = Phase.StartAPomodoro;
}
</script>

<template>
  <div class="w-96 shadow-md rounded-3xl px-8 pt-6 pb-8 mb-4" style="background-color: #ffffff">
    <h1 class="text-xl text-center font-bold my-2">pomodoro</h1>

    <!-- not in pomodoro -->
    <div v-if="phase == Phase.StartAPomodoro">

        <div class="flex p-4 text-sm text-yellow-700 bg-yellow-100 rounded-lg dark:bg-yellow-700 dark:text-yellow-300" role="alert">
            <svg aria-hidden="true" class="inline flex-shrink-0 mr-3 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
            <span class="sr-only">Info</span>
            <div>
            A pomodoro is 30min of focused work. If you get distracted during these 30min, reset the timer and start over.
            </div>
        </div>

        <form>
            <div class="mb-6">
                <label for="task" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Your task</label>
                <input type="text" id="task" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="the task you want to focus on" required>
            </div>

            <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" @click="startPomodoro" @end="endPomodoro">Start</button>
        </form>

        pomodoros accomplished in the last week:

        <ul>
            <li v-for="task in accomplished">{ task }</li>
        </ul>
    </div>

    <!-- in pomodoro -->
    <div v-if="phase == Phase.InPomodoro">

      <div class="flex p-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-700 dark:text-green-300 mb-5" role="alert">
        <svg aria-hidden="true" class="inline flex-shrink-0 mr-3 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
        <span class="sr-only">Info</span>
        <div>
          focus on <strong>{{ task }}</strong>
        </div>
      </div>

        <vue-countdown ref="countdown" :time="timer" v-slot="{ days, hours, minutes, seconds }">
            Time Remaining：{{ minutes }} minutes ({{ seconds }}).
         </vue-countdown>

        <button type="button" @click="reset">reset</button>

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
