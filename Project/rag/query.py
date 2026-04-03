# rag/query.py

from rag.db import collection, model

def query_chroma(query, top_k=1):
    query_embedding = model.encode(query).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    return results["documents"]