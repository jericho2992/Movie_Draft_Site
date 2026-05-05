// Netlify function: starts the Apify run and returns runId + datasetId to the client.
// Polling and data processing happen client-side in your Svelte component.
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
      'Jackass 5', 'The Furious', 'The Sheep Detectives', 'Tales from Earthsea','CatVideoFest 2026'
    ];

    // Kick off the Apify actor run
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

    // Return runId + datasetId — client will poll and fetch the data itself
    return {
      statusCode: 200,
      body: JSON.stringify({
        runId: runData.data.id,
        datasetId: runData.data.defaultDatasetId
      })
    };

  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
}
