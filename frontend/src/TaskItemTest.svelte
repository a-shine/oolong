<script lang="ts">
    let taskText = "Task title";
    let taskDate = "Task date";
</script>

<div id="task-item">
    <div id="done-checkbox">
        <input type="checkbox" id="task-checkbox" name="task-checkbox" />
    </div>
    <div id="task-info">
        <div id="task-text">
            {taskText}
        </div>
        <div id="task-details">
            <span class="detail-tag">{taskDate}</span>
        </div>
    </div>
</div>

<style>
    #task-item {
        width: 100%;
        height: 50px;
        display: flex;
        align-items: center;
    }

    #done-checkbox {
        margin-right: 5px;
    }

    /* Fill the remaining space of the task-item */
    #task-info {
        width: 100%;
        overflow: hidden;
    }

    /* Fill remaining width of task-item */
    #task-text {
        width: 100%;

        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Little coloured tag with rounded edges */
    #task-details {
        width: 100%;
    }

    .detail-tag {
        /* small text */
        font-size: 0.7rem;

        margin-right: 2.5px;
        padding: 1px 2.5px;

        border-radius: 5px;
        background-color: var(--accent);
    }
</style>
