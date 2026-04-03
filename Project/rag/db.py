# rag/db.py

from chromadb import PersistentClient
from sentence_transformers import SentenceTransformer
import uuid
from rag.chunker import create_chunks

# ✅ Persistent DB
client = PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection(name="ottverse")

model = SentenceTransformer("all-MiniLM-L6-v2")


def insert_articles(articles):
    all_chunks = []
    all_embeddings = []
    all_metadatas = []
    all_ids = []

    for article in articles:
        chunks = create_chunks(article)

        for chunk in chunks:
            embedding = model.encode(chunk)

            all_chunks.append(chunk)
            all_embeddings.append(embedding.tolist())
            all_metadatas.append({
                "url": article["url"],
                "title": article["title"]
            })
            all_ids.append(str(uuid.uuid4()))

    collection.add(
        documents=all_chunks,
        embeddings=all_embeddings,
        metadatas=all_metadatas,
        ids=all_ids
    )

    print("✅ Data inserted into ChromaDB")