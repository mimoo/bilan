<script setup lang="ts">
import moment from 'moment';
import { Ref, ref, reactive, computed } from 'vue';

//
// constants
//

const HABITS_STORAGE_KEY = "habits2";
const PREV_HABITS_STORAGE_KEY = "prev_habits";
const DATE_STORAGE_KEY = "dates2";

//
// data structures
//

enum Trend {
  More,
  Less
}

//
// init refs
//

let start_date = ref(moment());
let now = ref(moment().format('MMMM Do'));
let end_date = ref(moment(start_date.value).add(1, 'week'));

const bilanNeeded = ref(false);

const habits = ref<[string, Trend][]>([])

//
// computed
//

const start_date_str = computed(() => {
  console.log(start_date.value);
  return start_date.value.format('MMMM Do');
});

const end_date_str = computed(() => {
  return end_date.value.format('MMMM Do');
});

const countdown = computed(() => {
  const ended = end_date.value.isBefore(moment());
  const countdown = moment().to(end_date.value);
  return [ended, countdown];
});

//
// load sprint from storage
//

let local_date: string | null = window.localStorage.getItem(DATE_STORAGE_KEY);

if (local_date != null) {
  start_date.value = moment(JSON.parse(local_date));
  end_date.value = moment(start_date.value).add(1, 'week');

  console.log("retrieved start date from localstorage");
  console.log(start_date.value);

  if (end_date.value.isBefore(now.value)) {
    bilanNeeded.value = true;
  }

} else {
  window.localStorage.setItem(DATE_STORAGE_KEY, JSON.stringify(start_date.value));
  console.log("created localstorage for start date");
}

//
// load habits from localstorage
//

let habits_local = window.localStorage.getItem(HABITS_STORAGE_KEY);
if (habits_local) {
  JSON.parse(habits_local).forEach(([habit, trend]: [string, Trend]) => {
    habits.value.push([habit, trend]);
  })
  console.log("retrieved habits from localstorage");
} else {
  window.localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits.value));
  console.log("created localstorage for habits");
}

//
// interactions with habits
//

// function to add a habit
function addHabit(trend: Trend) {
  // get the input from the form
  let formField = document.querySelector<HTMLInputElement>('#habit')!;
  let habit: string = formField.value;

  // reset the form
  formField.value = "";

  // add the habit
  addHabitInner(habit, trend);
}

function addHabitInner(habit: string, trend: Trend) {
    // create the habit
  habits.value.push([habit, trend]);

  // save to localstorage
  window.localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits.value));
}

function deleteHabit(idx: number) {
  // delete from array
  habits.value.splice(idx, 1);

  // save to storage
  window.localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits.value));
}

//
// interactions with date
//

function endEarly() {
  bilanNeeded.value = !bilanNeeded.value;
}

//
// Bilan
//

// logic to handle clicking on "save result of week"
function saveBilan() {
  // build `previous` (habit, trend, done)
  let habits_list = document.querySelectorAll("#habits_list_res li");

  let previous: [string, Trend, boolean][] = [];
  habits_list.forEach((item, index) => {
    let [habit, trend] = habits.value[index];
    let done = item.querySelector("input")!.checked;
    previous.push([habit, trend, done]);
  });

  // records in storage
  saveBilanInner(start_date.value, previous);
}

// records the previous sprint result in storage
function saveBilanInner(start_date: moment.Moment, previous: [string, Trend, boolean][]) {
  // get array from storage
  let prev_habits_json = window.localStorage.getItem(PREV_HABITS_STORAGE_KEY);

  // append to array
  let prev_habits = [];
  if (prev_habits_json) {
    prev_habits.push({
      start_date: start_date,
      end_date: moment(),
      result: previous,
    });
  } 

  // store in storage
  window.localStorage.setItem(PREV_HABITS_STORAGE_KEY, JSON.stringify(prev_habits));
}

//
// debug
//

function createHabits() {
  addHabitInner("create muscles", Trend.More);
  addHabitInner("chewing", Trend.More);
  addHabitInner("work on side-projects (bilan, noname)", Trend.More);
  addHabitInner("slacking", Trend.Less);
  addHabitInner("read papers", Trend.More);
}

</script>

<template>
  <div class="basis-1/3 shadow-md rounded-3xl px-8 pt-6 pb-8 mb-4" style="background-color: #ffffff">
    <h1 class="text-xl text-center font-bold my-2">habit tuning (<small><span v-if="countdown[0]">ended</span><span v-else>ending</span> {{ countdown[1] }}</small>)</h1>

    <!-- end of the week -->
    <div v-if="bilanNeeded">

      <div class="flex p-4 text-sm text-yellow-700 bg-yellow-100 rounded-lg dark:bg-yellow-700 dark:text-yellow-300" role="alert">
        <svg aria-hidden="true" class="inline flex-shrink-0 mr-3 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
        <span class="sr-only">Info</span>
        <div>
          You reached the end of a week. It is time to reflect. For each habit, check the box if you think you successfuly made some progress towards the desired trend.
        </div>
      </div>

      <ul id="habits_list_res" class="my-5">
        <li v-for="([habit, trend], idx) in habits">
          <label :for="'toggle-' + idx" class="inline-flex relative items-center mb-4 cursor-pointer">
          <input type="checkbox" value="" :id="'toggle-' + idx" class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">

            {{ habit }} 

             <span v-if="trend == Trend.More">
              <svg class="w-6 h-6 inline-block" fill="green" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"></path></svg>
            </span>
            <span v-else>
              <svg class="w-6 h-6 inline-block" fill="red" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd"></path></svg>
            </span>
          
          </span>
          </label>

          </li>
        </ul>

      <button type="button" class="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2" v-on:click="saveBilan">Save week reflection</button>


    </div>

    <!-- during the week -->
    <div v-else>

      <div class="flex p-4 text-sm text-gray-700 bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-300" role="alert">
        <svg aria-hidden="true" class="inline flex-shrink-0 mr-3 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
        <span class="sr-only">Info</span>
        <div>
          Enter the habits you want to tune (do more or less of) for the next week.
        </div>
      </div>


        <ul id="habits_list" class="my-5">
          <li v-for="([habit, trend], idx) in habits">
            <span v-if="trend == Trend.More">
              <svg class="w-6 h-6 inline-block" fill="green" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"></path></svg>
            </span>
            <span v-else>
              <svg class="w-6 h-6 inline-block" fill="red" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd"></path></svg>
            </span>
            
            {{ habit }}  
            
              <button v-on:click="deleteHabit(idx)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M6.707 4.879A3 3 0 018.828 4H15a3 3 0 013 3v6a3 3 0 01-3 3H8.828a3 3 0 01-2.12-.879l-4.415-4.414a1 1 0 010-1.414l4.414-4.414zm4 2.414a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L13.414 10l1.293-1.293a1 1 0 00-1.414-1.414L12 8.586l-1.293-1.293z" clip-rule="evenodd" />
              </svg></button>
          </li>
        </ul>

      <form>
    <div class="mb-4">
      <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="habit" type="text" placeholder="add a new habit">
    </div>

    <div class="flex items-center justify-between">
      <button type="button" class="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2" v-on:click="addHabit(Trend.More)">I want to do more</button>

    <button type="button" class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2" v-on:click="addHabit(Trend.Less)">I want to do less</button>


    </div>
  </form>
  </div>

  <!-- debug -->
  <hr class="m-5">

  <button type="button" class="mr-5 py-2 px-3 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" v-on:click="createHabits">create habits</button>

  <button type="button" class="mr-5 py-2 px-3 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" v-on:click="endEarly">end early</button>

  <button type="button" class="mr-5 py-2 px-3 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" v-on:click="">configure</button>

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
