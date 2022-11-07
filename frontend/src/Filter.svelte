<script lang="ts">
    export let display;
    export let completed;
    export let getTasksToDisplay: () => void;
</script>

<!-- By date -->
<select bind:value={display} on:change={getTasksToDisplay}>
    <option value="unassigned">Unassigned</option>
    <option value="today">Today</option>
    <option value="upcoming">Upcoming</option>
    <option value="all">All</option>
</select>

<!-- Toggle completed -->
<label for="completedToggle">Toogle completed</label>
<input
    type="checkbox"
    id="completedToggle"
    bind:checked={completed}
    on:change={getTasksToDisplay}
/>
