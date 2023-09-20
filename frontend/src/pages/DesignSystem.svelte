<script>
    import Scaffold from "../components/Scafold.svelte";
    import Dialog from "../components/Dialog.svelte";
    let dialog;
</script>

<Scaffold title="Oolong design system">
    <div id="grid-container">
        <div id="typography" class="grid-item">
            <h2>Typography</h2>
            <ul>
                <li>Major third ratio (base size 16px)</li>
                <li><a href="https://fonts.google.com/specimen/Lora">Lora serif font</a></li>
                <li>Heading weight 500</li>
                <li>Paragraph weight 400</li>
            </ul>
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <p>Paragraph</p>
        </div>
        <div id="colours" class="grid-item">
            <a href="https://realtimecolors.com/?colors=060906-ffffff-334d35-d4e2d6-5e8560"><h2>Colour palette</h2></a>
            <div id="primaryColour">
                <div class="colourSquare" style="background-color: var(--primary-colour)"></div>
                Primary colour
            </div>
            <div id="secondaryColour">
                <div class="colourSquare" style="background-color: var(--secondary-colour)"></div>
                Secondary colour
            </div>
            <div id="backgroundColour">
                <div class="colourSquare" style="background-color: var(--background-colour)"></div>
                Background colour
            </div>
            <div id="textColour">
                <div class="colourSquare" style="background-color: var(--text-colour)"></div>
                Text colour
            </div>
        </div>
        <div id="spacing" class="grid-item">
            <h2>Spacing</h2>
        </div>
    </div>
    <h2>Components</h2>
    <h3>Card</h3>
    <div class="card">
        <!-- boilerplate lipsum text -->
        <h2>Card</h2>
        <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget ultricies aliquam, nunc
            sapien
            aliquet nunc, vitae aliquam nunc nisl vitae velit. Donec euismod, nisl eget ultricies aliquam, nunc sapien
            aliquet nunc, vitae aliquam nunc nisl vitae velit.
        </p>
    </div>
    <h3>Buttons and tags</h3>
    <div id="buttons">
        Only hover on non-touch devices
        <button>Primary</button>
        <button class="secondary-button">Secondary</button>
        <button class="disabled-button">Disabled</button>
        <!-- TODO: Icon button -->
    </div>
    <div id="tags">
        <span class="tag">Tag</span>
        <span class="tag">Tag</span>
        <span class="tag">Tag</span>
    </div>
    <h3>Inputs and forms</h3>
    <form style="max-width: 500px">
        <input type="text" placeholder="Name">
        <input type="email" placeholder="Email">
        <input type="password" placeholder="Password">
        <select>
            <option value="volvo">Volvo</option>
            <option value="saab">Saab</option>
        </select>
        <input type="checkbox">
    </form>
    <h3>Dialog</h3>
    <button on:click={() => dialog.showModal()}>Open me!</button>
    <Dialog bind:dialog={dialog} title="Dialog title" actions="">
        Dialog component
    </Dialog>

    <!-- Use the scaffold component to create a new page as it creates the correct structure for the navbar and footer. -->

</Scaffold>



<style>
.colourSquare {
    width: 5rem;
    height: 5rem;
    border: black 1px solid;
}

#grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* Auto size columns to fit content */
    gap: 20px; /* Adjust the gap as needed */
}

.grid-item {
    padding: 20px;
}
</style>