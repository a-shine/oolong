<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";

  export let scope: string;
  let showCompleted: boolean = false;

  const dispatch = createEventDispatcher();

  // dispatch change scope with new scope value
  const changeScope = () => {
    dispatch("changeScope", [scope, showCompleted]);
  };

  onMount(() => {
    dispatch("changeScope", [scope, showCompleted]);
  });
</script>

<div id="container" class="bg-primary">
  <div class="bar-item">
    <select
      name="task-scope"
      id="task-select"
      bind:value={scope}
      on:change={changeScope}
    >
      <optgroup label="Timeline">
        <option value="unassigned">Unassigned</option>
        <option value="today">Today</option>
        <!-- have an option on this page to see completed tasks of today to show progress -->
        <option value="upcoming">Upcoming</option>
      </optgroup>
      <optgroup label="All">
        <option value="completed">Completed</option>
      </optgroup>
      <!-- return all completed in order of most recently completed and do it by day -->
      <!-- <optgroup label="Project">
      </optgroup> -->
    </select>
  </div>

  <div id="right-side" />
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

  /* 
  Make select element transparent as it is on coloured top bar and slightly 
  larger
  */
  select {
    background-color: transparent;
    font-size: 1rem;
    outline: none;
  }

  select:hover {
    background-color: var(--primary-focus-color);
  }
</style>
