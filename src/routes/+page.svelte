<script>
    import { onMount } from 'svelte';
    import MovieTable from "$lib/MovieTable.svelte";

    const players = [
        ['Tim', ['The Odyssey', 'The End of Oak Street', 'Hokum', 'Evil Dead Burn', 'Stop! That! Train!', 'In the Grey', 'The Breadwinner', 'Rose of Nevada', 'Six: The Musical Live!', 'Two Pianos', 'Girls Like Girls', 'Influenced']],
        ['Jax', ['The Devil Wears Prada 2', 'Jackass 5', 'UNTITLED REPLACE', 'The Furious', 'The Sheep Detectives', 'Tales from Earthsea']],
        ['Ryan', ['Supergirl', 'Billie Eilish: Hit Me Hard and Soft - The Tour Live in 3D', 'Star Wars: The Mandalorian and Grogu', 'CatVidFest 2026', 'Animal Farm', 'Mobile Suit Gundam Hathaway: The Sorcery of Nymph Circe', 'Is God Is', 'Power Ballad']],
        ['Kelly', ['Spider-Man: Brand New Day', 'Disclosure Day', 'Teenage Sex and Death at Camp Miasma', 'Train to Busan']],
        ['Kat', ['Toy Story 5', 'Minions & Monsters', 'Backrooms', 'I Want Your Sex']],
        ['Dave', ['Masters of the Universe', 'Moana', 'Scary Movie', 'Super Troopers 3', 'Mortal Kombat II', 'PAW Patrol: The Dino Movie', 'Insidious: Out of the Further', 'Mutiny', 'The Invite', 'UFC Freedom 250', 'I Love Boosters']]
    ];

    let tables = $state([]);
    let loading = $state(true);
    let statusMessage = $state('Fetching latest box office numbers...');

    async function pollUntilDone(runId) {
        while (true) {
            await new Promise(r => setTimeout(r, 4000));
            const res = await fetch(`/.netlify/functions/get-movies-status?runId=${runId}`);
            const data = await res.json();
            if (data.status === 'SUCCEEDED') return data.datasetId;
            if (data.status === 'FAILED' || data.status === 'ABORTED') {
                throw new Error(`Apify run ended with status: ${data.status}`);
            }
        }
    }

    onMount(async () => {
        try {
            // Step 1: start the Apify run
            const startRes = await fetch('/.netlify/functions/get-movies');
            const { runId, datasetId } = await startRes.json();

            // Step 2: poll until done
            statusMessage = 'Waiting for data...';
            await pollUntilDone(runId);

            // Step 3: fetch the completed dataset
            statusMessage = 'Loading results...';
            const dataRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?clean=true`);
            const items = await dataRes.json();

            // Step 4: build per-player tables
            tables = players.map(([name, movieList]) => ({
                name,
                headers: ['Title', 'Year', 'Domestic Gross'],
                rows: items
                    .filter(item => movieList.includes(item.title))
                    .map(item => [item.title, item.year, item.domesticGross])
            }));
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
        <p>{statusMessage}</p>
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
        min-height: 100vh;
        min-width: 100vw;
        background-image: linear-gradient(rgb(128,16,0), rgb(255,128,0), rgb(255,200,0), rgb(255,128,0),rgb(128,16,0));
    }
    h1 {
        margin: 0;
        text-align: center;
    }
    .table-wrapper {
        margin: 2em;
    }
    .tables-section-wrapper {
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: center;
        font-size: 1.8vh;
    }
</style>