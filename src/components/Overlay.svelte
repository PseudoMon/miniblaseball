<script>
    import { onMount, onDestroy } from 'svelte'
    import { useNavigate } from 'svelte-navigator'
    import PlayerInfo from './PlayerInfo.svelte'

    export let player

    const navigate = useNavigate()

    function clickAnywhere(e) {
        // Close the overlay (i.e. navigate to the main page) if the space outside the modal panel (i.e. the overlay underneath) is clicked

        if (e.target.classList.contains('overlay')) {
            navigate('/')
        }
    }

    onMount(() => {
        console.log(player)
        document.body.style.overflowY = 'hidden'
    })

    onDestroy(() => {
        document.body.style.overflowY = ''
    })
</script>

<div class="overlay" on:click="{ clickAnywhere }">
    <PlayerInfo player="{ player }"/>
</div>

<style>
    .overlay {
        display: block;
        line-height: 1.4em;
        font-size: 18px;
        text-align: left;

        position: fixed;
        z-index: 20;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow-y: auto;

        background-color: rgba(0,0,0,0.6);
    }
</style>