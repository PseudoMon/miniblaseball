<script>
    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher()

    function onChangeSort(e) {
        dispatch('changeSort', { sortType: e.target.value })
    }
</script>

<h2>Sort by</h2>

<form class="sort-control" on:change={ onChangeSort }>
    <label>
        <input type="radio" name="sortby" value="latest" checked>
        Latest drawn 
    </label>

    <label>
        <input type="radio" name="sortby" value="original">
        First drawn
    </label>

    <label>
        <input type="radio" name="sortby" value="alphabetical">
        Alphabetical
    </label>

    <label>
        <input type="radio" name="sortby" value="currentteam">
        Current team
    </label>
</form>

<style>
    label {
        display: block;
        margin: 0.2em 0;
    }
</style>