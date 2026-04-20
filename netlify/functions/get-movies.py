import json
import os
import pandas as pd
from apify_client import ApifyClient

def handler(event, context):
    print('running')
    try:
        # Fetch key from Netlify Environment Variables
        api_token = os.environ.get('APIFY_KEY')
        client = ApifyClient(api_token)

        # Your original movie list
        movie_titles = ['Masters of the Universe', 'Moana', 'Scary Movie 6', 'Super Troopers 3', 'Mortal Kombat II', 'Paw Patrol: The Dino Movie', 'Insidious: Out of the Further', 'Mutiny', 'Animal Friends', 'The Invite', 'I Love Boosters', 'Toy Story 5', 'Minions & Monsters', 'Backrooms', 'I Want Your Sex', 'The Odyssey', 'Evil Dead Burn', 'Hokum', 'End of Oak Street', 'Stop! That! Train!', 'In the Grey', 'The Breadwinner', 'Rose of Nevada', 'Six: The Musical Live!', 'Two Pianos', 'Girls Like Girls', 'Influenced', 'Supergirl: Woman of Tomorrow', 'Billie Eilish: Hit Me Hard and Soft - The Tour Live in 3D', 'Star Wars: The Mandalorian and Grogu', 'Animal Farm', 'Mobile Suit Gundam Hathaway: The Sorcery of Nymph Circe', 'Is God Is', 'Power Ballad', 'Spider-Man: Brand New Day', 'Disclosure Day', 'Teenage Sex and Death at Camp Miasma', 'Train to Busan', 'The Devil Wears Prada 2', 'Jackass 5', 'The Furious', 'The Sheep Detectives', 'Talse from Earthsea']

        # Get data
        run = client.actor('trovevault/movie-box-office-tracker').call(run_input={'movies': movie_titles})
        df = pd.DataFrame(client.dataset(run['defaultDatasetId']).iterate_items())
        reduced_df = df[['title', 'year', 'domesticGross']]

        # Define lists
        players = [
            ['Tim', ['The Odyssey', 'The End of Oak Street','Hokum','Evil Dead Burn', 'Stop! That! Train!','In the Grey','The Breadwinner','Rose of Nevada','Six: The Musical Live!','Two Pianos','Girls Like Girls','Influenced']],
            ['Jax', ['The Devil Wears Prada 2','Jackass 5', 'UNTITLED REPLACE', 'The Furious','The Sheep Detectives','Tales from Earthsea']],
            ['Ryan', ['Supergirl','Billie Eilish: Hit Me Hard and Soft - The Tour Live in 3D','Star Wars: The Mandalorian and Grogu','CatVidFest 2026','Animal Farm','Mobile Suit Gundam Hathaway: The Sorcery of Nymph Circe','Is God Is', 'Power Ballad']],
            ['Kelly', ['Spider-Man: Brand New Day','Disclosure Day','Teenage Sex and Death at Camp Miasma','Train to Busan']],
            ['Kat', ['Toy Story 5', 'Minions & Monsters', 'Backrooms', 'I Want Your Sex']],
            ['Dave', ['Masters of the Universe','Moana','Scary Movie','Super Troopers 3','Mortal Kombat II','PAW Patrol: The Dino Movie','Insidious: Out of the Further','Mutiny','The Invite','UFC Freedom 250','I Love Boosters']]
        ]

        output = []
        for pl in players:
            frame = reduced_df[reduced_df['title'].isin(pl[1])].copy().reset_index(drop=True)
            frame.index += 1
            output.append({
                "name": pl[0],
                "headers": ['title', 'year', 'Domestic Gross'],
                "rows": frame.values.tolist()
            })

        return {
            "statusCode": 200,
            "body": json.dumps(output)
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }