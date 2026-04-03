# rag/chunker.py

def create_chunks(article):
    chunks = []

    title = article["title"]
    headings = article["headings"]
    paragraphs = article["content"]

    current_heading = ""

    for para in paragraphs:
        if para in headings:
            current_heading = para
            continue

        chunk = f"""
Title: {title}
Section: {current_heading}
Content: {para}
"""
        chunks.append(chunk.strip())

    return chunks