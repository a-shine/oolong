<script lang="ts">
  import { push } from "svelte-spa-router";

  let scope: string = "today";

  // dispatch change scope with new scope value
  const changeTaskViewScope = () => {
    push(`/tasks/${scope}`);
  };
</script>

<div class="bar-item">
  <select
    name="task-scope"
    id="task-select"
    bind:value={scope}
    on:change={changeTaskViewScope}
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

<style>
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
