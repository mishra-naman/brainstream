# main.py

import json
from rag.db import insert_articles
from rag.query import query_chroma

# Load scraped data
# with open(r"C:\Users\Kartik\Downloads\asset\Scraping\Project\data\ottverse_final.json", "r", encoding="utf-8") as f:
#     articles = json.load(f)

# # Step 1: Insert into DB
# insert_articles(articles)

# Step 2: Test query
query = "Define Video Transcoding and it's uses"

results = query_chroma(query)

print("\nTop Results:")
for r in results[0]:
    print("\n", r)