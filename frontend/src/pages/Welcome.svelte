<script lang="ts">
    import {pushWrapper as push} from "../lib/navigatorWrapper";
</script>

<div class="flex flex-h-center flex-v-center" style="height: 100%">
        <img alt="Oolong logo" src="littleOolong_v0.7.png" width="250"/>
        <h1>Oolong</h1>

        <button class="fl-btn" on:click={() => push("/login")}>Go to Login</button>

        <!-- Place div at the bottom of the page -->
        <div style="position: absolute; bottom: 0; width: 100%; text-align: center; padding-bottom: 5px">
            <button class="link-button" on:click={() => push("/design-system")}>Oolong design system</button>
        </div>
</div>


<style>
    .flex {
        display: flex;
        flex-direction: column;
    }

    .flex-v-center {
        display: flex;
        align-items: center;
    }

    .flex-h-center {
        display: flex;
        justify-content: center;
    }
</style>
