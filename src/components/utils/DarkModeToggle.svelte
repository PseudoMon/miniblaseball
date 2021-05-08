<script>
    import { onMount, createEventDispatcher } from 'svelte'
    let toggler

    const dispatch = createEventDispatcher()

    function onToggle(e) {
        toggler.checked = !toggler.checked

        dispatch('toggle')
    }

    onMount(() => {
        if (window.localStorage.getItem('darkmode')) {
            toggler.checked = true
        }
    })
</script>

<div class="theme-toggle-container">
    <input id="theme-toggle" type="checkbox" bind:this={ toggler }>
    <span class="light">Light</span>
    <div class="toggle" on:click={ onToggle }>
        <span></span>
    </div>
    <span class="dark">Dark</span>
</div>

<style>
    .theme-toggle-container {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.8em;
        font-weight: 600;
    }

    input[type="checkbox"] {
        position: absolute;
        display: none;
    }

    .toggle {
        display: inline-block;
        font-size: 20px;
        height: 1em;
        width: 2em;
        border-radius: 1em;

        margin: 0 0.5em;

        background-color: var(--color-text);

        transition: all 300ms;
        cursor: pointer;
    }

    .toggle span {
        display: block;
        height: 1em;
        width: 1em;
        border-radius: 1em;
        margin-left: -2px;

        background-color: #fff;
        box-shadow: 0 0.1em 0.1em rgba(0,0,0,0.3);

        transition: all 300ms;
    }

    input:checked ~ .toggle span {
        transform: translateX(1.2em);
    }

    .light {
        opacity: 1;
    }

    input:checked ~ .light {
        opacity: 0.6;
    }

    .dark {
        opacity: 0.6;
    }

    input:checked ~ .dark {
        opacity: 1;
    }
</style>