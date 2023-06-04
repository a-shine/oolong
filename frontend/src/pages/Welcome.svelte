<script lang="ts">
  import { pushWrapper as push } from "../navigatorWrapper";
</script>

<div class="flex flex-h-center flex-v-center" style="height: 100%">
  <div class="flex flex-h-center flex-v-center">
    <img src="icons/512-512.png" width="250" />
    <h1>Oolong</h1>

    <button class="fl-btn" on:click={() => push("/login")}>Go to Login</button>
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
