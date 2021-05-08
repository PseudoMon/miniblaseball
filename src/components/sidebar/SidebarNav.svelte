<script>
    import { createEventDispatcher } from 'svelte'
    export let selectedScreen

    const dispatch = createEventDispatcher()

    function openScreen(screen) {
        dispatch('selectscreen', {
            screen
        })
    }
</script>

<ul class="sidebar-nav">
    <li 
        class="{ selectedScreen === 'filter' ? 'active' : '' }"
        on:click="{ () => openScreen('filter') }">
        Sort & Filter
    </li>
    <li 
        class="{ selectedScreen === 'about' ? 'active' : '' }"
        on:click="{ () => openScreen('about') }">
        About
    </li>
</ul>

<style>
.sidebar-nav {
    list-style-type: none;
    padding-left: 0;

    display: flex;
    justify-content: center;
}

.sidebar-nav li {
    display: block;
    text-align: center;
    padding: 0.4em;
    margin: 0 0.5em;

    text-transform: uppercase;
    flex-grow: 1;
    border-radius: 0.5em;
    font-weight: 600;

    cursor: pointer;
}

.sidebar-nav li:hover {
    background-color: var(--color-soft);
}

.sidebar-nav li.active {
    border: solid var(--color-text);
    background-color: var(--color-text);
    color: var(--color-bg);
}
</style>