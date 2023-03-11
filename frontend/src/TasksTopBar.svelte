<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";

  let scope: string = "today";
  let showCompleted: boolean = false;

  const dispatch = createEventDispatcher();

  // dispatch change scope with new scope value
  const changeScope = () => {
    dispatch("changeScope", [scope, showCompleted]);
  };

  const toggleCompleted = () => {
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
      <optgroup label="Timeline">
        <option value="unassigned">Unassigned</option>
        <option value="today">Today</option>
        <!-- have an option on this page to see completed tasks of today to show progress -->
        <option value="upcoming">Upcoming</option>
      </optgroup>
      <optgroup label="All">
        <option value="all">Incomplete</option>
        <option value="completed">Completed</option>
      </optgroup>
      <!-- return all completed in order of most recently completed and do it by day -->
      <!-- <optgroup label="Project">
      </optgroup> -->
    </select>
  </div>

  <div id="right-side">
    <div class="bar-item">
      <!-- Toggle completed checkbox with label -->
      {#if scope === "today"}
        <label for="toggle-completed">Show completed</label>
        <input
          type="checkbox"
          id="toggle-completed"
          name="toggle-completed"
          bind:checked={showCompleted}
          on:change={toggleCompleted}
        />
      {/if}
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
