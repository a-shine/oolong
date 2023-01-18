<script>
    import TaskItemTest from "./TaskItemTest.svelte";
</script>

<div id="container" class="bg-primary">
    <div class="bar-item">
        <select name="task-scope" id="task-select">
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
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
            />
        </div>
    </div>
</div>

<div style="max-width: 650px;"><TaskItemTest /></div>

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
