export async function handler(event, context) {
  console.log('running');

  try {
    const api_token = process.env.APIFY_KEY;

    const movieTitles = [
      'Masters of the Universe', 'Moana', 'Scary Movie 6', 'Super Troopers 3',
      'Mortal Kombat II', 'Paw Patrol: The Dino Movie', 'Insidious: Out of the Further',
      'Mutiny', 'Animal Friends', 'The Invite', 'I Love Boosters', 'Toy Story 5',
      'Minions & Monsters', 'Backrooms', 'I Want Your Sex', 'The Odyssey', 'Evil Dead Burn',
      'Hokum', 'End of Oak Street', 'Stop! That! Train!', 'In the Grey', 'The Breadwinner',
      'Rose of Nevada', 'Six: The Musical Live!', 'Two Pianos', 'Girls Like Girls',
      'Influenced', 'Supergirl: Woman of Tomorrow',
      'Billie Eilish: Hit Me Hard and Soft - The Tour Live in 3D',
      'Star Wars: The Mandalorian and Grogu', 'Animal Farm',
      'Mobile Suit Gundam Hathaway: The Sorcery of Nymph Circe', 'Is God Is',
      'Power Ballad', 'Spider-Man: Brand New Day', 'Disclosure Day',
      'Teenage Sex and Death at Camp Miasma', 'Train to Busan', 'The Devil Wears Prada 2',
      'Jackass 5', 'The Furious', 'The Sheep Detectives', 'Tales from Earthsea'
    ];

    const players = [
      ['Tim', ['The Odyssey', 'The End of Oak Street', 'Hokum', 'Evil Dead Burn', 'Stop! That! Train!', 'In the Grey', 'The Breadwinner', 'Rose of Nevada', 'Six: The Musical Live!', 'Two Pianos', 'Girls Like Girls', 'Influenced']],
      ['Jax', ['The Devil Wears Prada 2', 'Jackass 5', 'UNTITLED REPLACE', 'The Furious', 'The Sheep Detectives', 'Tales from Earthsea']],
      ['Ryan', ['Supergirl', 'Billie Eilish: Hit Me Hard and Soft - The Tour Live in 3D', 'Star Wars: The Mandalorian and Grogu', 'CatVidFest 2026', 'Animal Farm', 'Mobile Suit Gundam Hathaway: The Sorcery of Nymph Circe', 'Is God Is', 'Power Ballad']],
      ['Kelly', ['Spider-Man: Brand New Day', 'Disclosure Day', 'Teenage Sex and Death at Camp Miasma', 'Train to Busan']],
      ['Kat', ['Toy Story 5', 'Minions & Monsters', 'Backrooms', 'I Want Your Sex']],
      ['Dave', ['Masters of the Universe', 'Moana', 'Scary Movie', 'Super Troopers 3', 'Mortal Kombat II', 'PAW Patrol: The Dino Movie', 'Insidious: Out of the Further', 'Mutiny', 'The Invite', 'UFC Freedom 250', 'I Love Boosters']]
    ];

    // --- 1. Kick off the Apify actor run ---
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/trovevault~movie-box-office-tracker/runs?token=${api_token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movies: movieTitles })
      }
    );

    if (!runRes.ok) {
      throw new Error(`Apify run failed: ${runRes.status} ${await runRes.text()}`);
    }

    const runData = await runRes.json();
    const runId = runData.data.id;

    // --- 2. Poll until the run finishes ---
    let status = runData.data.status;
    while (status !== 'SUCCEEDED' && status !== 'FAILED' && status !== 'ABORTED') {
      await new Promise(r => setTimeout(r, 3000)); // wait 3s between polls
      const pollRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${api_token}`
      );
      const pollData = await pollRes.json();
      status = pollData.data.status;
    }

    if (status !== 'SUCCEEDED') {
      throw new Error(`Apify run ended with status: ${status}`);
    }

    // --- 3. Fetch the dataset ---
    const runDetailsRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${api_token}`
    );
    const runDetails = await runDetailsRes.json();
    const datasetId = runDetails.data.defaultDatasetId;

    const datasetRes = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${api_token}&clean=true`
    );

    if (!datasetRes.ok) {
      throw new Error(`Failed to fetch dataset: ${datasetRes.status}`);
    }

    const items = await datasetRes.json();

    // --- 4. Reduce to needed fields (replaces pandas) ---
    const reduced = items.map(item => ({
      title: item.title,
      year: item.year,
      domesticGross: item.domesticGross
    }));

    // --- 5. Build per-player output ---
    const output = players.map(([name, movieList]) => {
      const rows = reduced
        .filter(item => movieList.includes(item.title))
        .map((item, i) => [item.title, item.year, item.domesticGross]);

      return {
        name,
        headers: ['title', 'year', 'Domestic Gross'],
        rows
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify(output)
    };

  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
}