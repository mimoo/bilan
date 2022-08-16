<script setup lang="ts">
import draggable from 'vuedraggable'
import { Ref, ref, reactive, computed } from 'vue';

import Habits from './components/Habits.vue'
import Motto from './components/Motto.vue'
import Memory from './components/Memory.vue'
import Goals from './components/Goals.vue'
import Pomodoro from './components/Pomodoro.vue'

//
// constants
//

const LAYOUT_KEY = "layout_v1";

//
// Refs
//

let layout = ref([
  [ { name: "habits" } ],
  [
    { name: "motto" }, 
    { name: "pomodoro" }
  ],
  [ { name: "memory" } ],
  [ { name: "goals" } ]
]);

//
// Local storage
//

let layout_json: string | null = window.localStorage.getItem(LAYOUT_KEY);

if (layout_json == null) {
  window.localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout.value));
} else {
  layout.value = JSON.parse(layout_json);
}

//
// Functions
//

function nameToComponent(name: string) {
  switch (name) {
    case "habits": return Habits;
    case "motto": return Motto;
    case "memory": return Memory;
    case "goals": return Goals;
    case "pomodoro": return Pomodoro;
  }
}

function updateLayout() {
  window.localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout.value));
}

</script>

<template>
  <header>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg shadow-md py-2 bg-white relative flex items-center w-full justify-between">
      <div class="px-6 w-full flex flex-wrap items-center justify-between">
        <div class="flex items-center">
          <button
            class="navbar-toggler border-0 py-3 lg:hidden leading-none text-xl bg-transparent text-gray-600 hover:text-gray-700 focus:text-gray-700 transition-shadow duration-150 ease-in-out mr-2"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContentY"
            aria-controls="navbarSupportedContentY"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              class="w-5"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
            >
              <path
                fill="currentColor"
                d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"
              ></path>
            </svg>
          </button>
        </div>
        <div class="navbar-collapse collapse grow items-center" id="navbarSupportedContentY">

          <ul class="navbar-nav mr-auto lg:flex lg:flex-row">
            <li class="nav-item">
              <h1 class="nav-link block pr-2 lg:px-2 py-2 text-gray-600 hover:text-gray-700 focus:text-gray-700 transition duration-150 ease-in-out font-bold">Bilan</h1>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <!-- Navbar -->

  </header>

  <!-- active modules (TODO: enforce limit?) -->

  <div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 m-10 gap-4">

<!--
    <div v-for="column in layout">
      <div v-for="module in column">
        <component :is="module"></component>
      </div>
    </div>
-->

    <div v-for="column in layout">
      <draggable
        class="list-group"
        :list="column"
        group="modules"
        @change="updateLayout"
        itemKey="name"
      >
        <template #item="{ element, index }">
          <div class="list-group-item">
            <!-- {{ element.name }} -->
            <component :is="nameToComponent(element.name)"></component>
            </div>
        </template>
      </draggable>
    </div>

    <!--
    <div>
      <Habits />
    </div>

    <div>
      <Motto />
      <Pomodoro />
    </div>
    
    <div>
      <Memory />
    </div>

    <div>
      <Goals />
    </div>
    -->
  </div>

</template>

<style>
#app {
  @apply antialiased text-default m-16;
  margin:0;
}
</style>
