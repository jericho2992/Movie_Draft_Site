<script>
    import { onMount } from 'svelte';
    import MovieTable from "$lib/MovieTable.svelte";

    let tables = $state([]); 
    let loading = $state(true);

    onMount(async () => {
        try {
            // Netlify automatically routes this to your Python script
            const response = await fetch('/.netlify/functions/get-movies');
            tables = await response.json();
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            loading = false;
        }
    });
</script>

<main>
    <h1>Movies Draft Tracker</h1>
    {#if loading}
        <p>Fetching latest box office numbers...</p>
    {:else}
        <div class='tables-section-wrapper'>
            {#each tables as table}
                <div class='table-wrapper'>
                    <MovieTable name={table.name} headers={table.headers} rows={table.rows} />
                </div>
            {/each}
        </div>
    {/if}
</main>
<style>
    main {
        margin: 0;
        padding: 2em;
        height: 100vh;
        width: 100vw;
        background-image: linear-gradient(rgb(128,16,0), rgb(255,128,0), rgb(255,200,0), rgb(255,128,0),rgb(128,16,0));
    }
    h1 {
        margin: 0;
        text-align: center;
    }
    .table-wrapper {
        margin: 2em;
    }
    .tables-section-wrapper{
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        font-size: 1.8vh;
    }
</style>
