<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";

  let scope: string = "today";
  let showCompleted: boolean = false;

  const dispatch = createEventDispatcher();

  // dispatch change scope with new scope value
  const changeScope = (event) => {
    dispatch("changeScope", [scope, showCompleted]);
  };

  const toggleCompleted = (event) => {
    console.log(event.target.checked);
    dispatch("toggleCompleted", [scope, showCompleted]);
  };
</script>

<div id="container" class="bg-primary">
  <div class="bar-item">
    <select
      name="task-scope"
      id="task-select"
      bind:value={scope}
      on:change={changeScope}
    >
      <option value="unassigned">Unassigned</option>
      <option value="today">Today</option>
      <option value="upcoming">Upcoming</option>
      <option value="all">All</option>
    </select>
  </div>

  <div id="right-side">
    <div class="bar-item">
      <!-- Toggle completed checkbox with label -->
      <label for="toggle-completed">Show completed</label>
      <input
        type="checkbox"
        id="toggle-completed"
        name="toggle-completed"
        bind:checked={showCompleted}
        on:change={toggleCompleted}
      />
    </div>
  </div>
</div>

<style>
  #container {
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
  }

  /* push to the right of the container */
  #right-side {
    margin-left: auto;
  }

  .bar-item {
    margin: 0 10px;
  }

  /* make select element transparent */
  select {
    background-color: transparent;
    border: none;
    cursor: pointer;
  }

  /* rounded hover on select */
  select:hover {
    border-radius: 5px;
    background-color: var(--primary-100);
  }
</style>
