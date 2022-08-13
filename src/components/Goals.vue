<script setup lang="ts">
import { assert } from 'console';
import moment from 'moment';
import { Ref, ref, reactive, computed } from 'vue';

//
// constants
//

const GOALS_STORAGE_KEY = "goals_v3";
const PREV_GOALS_STORAGE_KEY = "prev_goals_v3";
const GOALS_DATE_STORAGE_KEY = "goals_dates_v2";

//
// data structures
//

// the displayed submodule
enum Phase {
  // the normal form that you can edit throughout your sprint
  DuringTheWeek,
  // the menu where you reflect on what you accomplished
  DoneOrNot,
}

interface Goal {
  description: string;
  pomodoro: boolean;
  done: boolean;
}

interface PreviousGoal {
  goal: Goal;
  notes: string;
}

//
// init refs
//

let start_date = ref(moment());
let now = ref(moment().format('MMMM Do'));
let end_date = ref(moment(start_date.value).add(1, 'week'));

const phase = ref(Phase.DuringTheWeek);

const goals = ref<Goal[]>([])

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

let date_json: string | null = window.localStorage.getItem(GOALS_DATE_STORAGE_KEY);

if (date_json == null) {
  window.localStorage.setItem(GOALS_DATE_STORAGE_KEY, JSON.stringify([start_date.value, end_date.value]));
} else {
  let [start, end] = JSON.parse(date_json);
  start_date.value = moment(start);
  end_date.value = moment(end);
  console.assert(start_date.value.isBefore(end_date.value));

  // change phase if we're done
  if (end_date.value.isBefore(moment())) {
    phase.value = Phase.DoneOrNot;
  }
}

//
// load current goals from localstorage
//

let goals_json = window.localStorage.getItem(GOALS_STORAGE_KEY);
if (goals_json) {
  goals.value = JSON.parse(goals_json);
} else {
  window.localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals.value));
}

//
// Bilan phase DuringTheWeek
//

// function to add a goal
function addGoal(pomodoro: boolean) {
  console.assert(phase.value == Phase.DuringTheWeek);

  // get the input from the form
  let formField = document.querySelector<HTMLInputElement>('#goal')!;
  let goal: string = formField.value;

  // do nothing if the form is empty
  if (goal == "") {
    return;
  }

  // reset the form
  formField.value = "";

  // add the goal
  addGoalInner(goal, pomodoro);
}

function addGoalInner(goal: string, pomodoro: boolean) {
  console.assert(phase.value == Phase.DuringTheWeek);

  // create the goal
  goals.value.push({
    description: goal,
    pomodoro: pomodoro ,
    done: false
  });

  // save to localstorage
  window.localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals.value));
}

function deleteGoal(idx: number) {
  console.assert(phase.value == Phase.DuringTheWeek);

  // delete from array
  goals.value.splice(idx, 1);

  // save to storage
  window.localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals.value));
}

function updateGoal() {
    console.assert(phase.value == Phase.DuringTheWeek);

    const goals_el = document.querySelectorAll('#goals_list li')!;

    goals_el.forEach((el, idx) => {
        const check = el.querySelector<HTMLInputElement>("input[type='checkbox']")!.checked;
        console.log(idx, check);
        goals.value[idx].done = check;
    });

    window.localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals.value));
}

function endEarly() {
  console.assert(phase.value == Phase.DuringTheWeek);

  end_date.value = moment();

    window.localStorage.setItem(GOALS_DATE_STORAGE_KEY, JSON.stringify([start_date.value, end_date.value]));

}

// skip 1 day
function skipDay() {
  end_date.value.subtract(1, 'day');

  window.localStorage.setItem(GOALS_DATE_STORAGE_KEY, JSON.stringify([start_date.value, end_date.value]));
}

//
// Bilan phase DoneOrNot
//

// logic to handle clicking on "save result of week"
function saveBilan() {
  console.assert(phase.value == Phase.DoneOrNot);

  // build `previous` (goal, done)
  let goals_list = document.querySelectorAll("#goals_list_res li");

  let previous: PreviousGoal[] = [];
  goals_list.forEach((item, index) => {
    let goal = goals.value[index];
    goal.done = item.querySelector("input")!.checked;
    let notes = document.querySelector<HTMLInputElement>("#notes-goal-" + index)!.value;
    let previous_goal = {
      goal: goal,
      notes: notes,
    };
    previous.push(previous_goal);
  });

  // get array from storage
  let prev_goals_json = window.localStorage.getItem(PREV_GOALS_STORAGE_KEY);
  let prev_goals = [];
  if (prev_goals_json) {
    prev_goals = JSON.parse(prev_goals_json);
  }

  // append to array
  prev_goals.push({
    start_date: start_date.value,
    end_date: moment(),
    result: previous,
  });

  console.log("recording finished sprint", prev_goals)

  // store in storage
  window.localStorage.setItem(PREV_GOALS_STORAGE_KEY, JSON.stringify(prev_goals));

  // reset goals
  goals_list.forEach((el) => el.remove());
  goals.value = [];

  // save to storage
  window.localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals.value));

  // reset the sprint
  start_date.value = moment();
  end_date.value = moment(start_date.value).add(1, 'week');

  // store the new sprint
  window.localStorage.setItem(GOALS_DATE_STORAGE_KEY, JSON.stringify([start_date.value, end_date.value]));

  // update phase
  phase.value = Phase.DuringTheWeek;
}

//
// debug
//

function createGoals() {
  console.assert(phase.value == Phase.DuringTheWeek);

  addGoalInner("goal number 1", false);
  addGoalInner("goal number 2", false);
}

function restart() {
  console.assert(phase.value == Phase.DuringTheWeek);

  start_date = ref(moment());
  end_date = ref(moment(start_date.value).add(1, 'week'));

  window.localStorage.setItem(GOALS_DATE_STORAGE_KEY, JSON.stringify([start_date.value, end_date.value]));
}

</script>

<template>
  <div class="w-96 shadow-md rounded-3xl px-8 pt-6 pb-8 mb-4" style="background-color: #ffffff">
    <h1 class="text-xl text-center font-bold my-2">accomplishable goals (<small><span v-if="countdown[0]">ended</span><span v-else>ending</span> {{ countdown[1] }}</small>)</h1>

    <!-- end of the week -->
    <div v-if="phase == Phase.DoneOrNot">

      <div class="flex p-4 text-sm text-yellow-700 bg-yellow-100 rounded-lg dark:bg-yellow-700 dark:text-yellow-300" role="alert">
        <svg aria-hidden="true" class="inline flex-shrink-0 mr-3 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
        <span class="sr-only">Info</span>
        <div>
          You reached the end of a week. It is time to reflect. For each goal, toggle the switch if you think you successfuly accomplished what you set for. You can also write some notes.
        </div>
      </div>

      <ul id="goals_list_res" class="my-5">
        <li v-for="(goal, idx) in goals">
          <label :for="'toggle-goal-' + idx" class="inline-flex relative items-center mb-4 cursor-pointer">
          <input type="checkbox" :checked="goal.done" value="" :id="'toggle-goal-' + idx" class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>

            <img src="@/assets/tomato.png" v-if="goal.pomodoro" class="ml-2">

          <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">

            {{ goal.description }} 
         
          </span>

          </label>

              <input :id="'notes-goal-' + idx" type="text" class="mb-5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" :placeholder="'notes on ' + goal" required>


          </li>
        </ul>

      <button type="button" class="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2" @click="saveBilan">Save week reflection</button>
    </div>

    <!-- during the week -->
    <div v-if="phase == Phase.DuringTheWeek">

      <div class="flex p-4 text-sm text-gray-700 bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-300" role="alert">
        <svg aria-hidden="true" class="inline flex-shrink-0 mr-3 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
        <span class="sr-only">Info</span>
        <div>
          <strong>Enter the goals</strong> you want to tune (do more or less of) for the <strong>next week</strong>.<br>
          (You can continue modifying this list until the week ends.) Tip: try to set a goal in terms of numbers of pomodoro.
        </div>
      </div>

        <ul id="goals_list" class="my-5">
          <li v-for="(goal, idx) in goals" class="group">
            <div class="flex items-center mb-4">
                <input @click="updateGoal" :checked="goal.done" :id="'goal-checkbox-' + idx" type="checkbox" value="" class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" >

                <img src="@/assets/tomato.png" v-if="goal.pomodoro" class="ml-2">
                
                <label :for="'goal-checkbox-'+idx" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"> {{ goal.description }} </label>

                

                 <button @click="deleteGoal(idx)" class="hidden group-hover:inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M6.707 4.879A3 3 0 018.828 4H15a3 3 0 013 3v6a3 3 0 01-3 3H8.828a3 3 0 01-2.12-.879l-4.415-4.414a1 1 0 010-1.414l4.414-4.414zm4 2.414a1 1 0 00-1.414 1.414L10.586 10l-1.293 1.293a1 1 0 101.414 1.414L12 11.414l1.293 1.293a1 1 0 001.414-1.414L13.414 10l1.293-1.293a1 1 0 00-1.414-1.414L12 8.586l-1.293-1.293z" clip-rule="evenodd" />
                  </svg>
                </button>
            </div>             
          </li>
        </ul>

      <form>
    <div class="mb-4">
      <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="goal" type="text" placeholder="add a new goal" autocomplete="off">
    </div>

    <button type="button" class="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2" @click="addGoal(false)">add goal</button>

<button type="button" class="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2" @click="addGoal(true)">add pomodoro goal</button>

  </form>
  </div>

<!--
  <hr class="m-5">
  <button type="button" class="mr-5 py-2 px-3 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" @click="createGoals">create goals</button>

  <button type="button" class="mr-5 py-2 px-3 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" @click="endEarly">end early</button>

  <button type="button" class="mr-5 py-2 px-3 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" @click="skipDay">skip 1 day</button>

    <button type="button" class="mr-5 py-2 px-3 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" @click="restart">restart</button>

  <button type="button" class="mr-5 py-2 px-3 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" @click="">configure</button>
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
