import os
import re

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS


DOCUMENTS_DIR = "documents"
VECTORSTORE_DIR = "vectorstore"


def ingest_documents():
    documents = []

    for anime_name in os.listdir(DOCUMENTS_DIR):

        anime_path = os.path.join(DOCUMENTS_DIR, anime_name)

        if not os.path.isdir(anime_path):
            continue

        for filename in os.listdir(anime_path):

            if not filename.endswith(".txt"):
                continue

            match = re.search(r"ep(\d+)", filename.lower())

            if not match:
                continue

            episode_number = int(match.group(1))

            path = os.path.join(anime_path, filename)

            with open(path, "r", encoding="utf-8") as file:
                content = file.read()

            document = Document(
                page_content=content,
                metadata={
                    "anime": anime_name,
                    "episode": episode_number
                }
            )

            documents.append(document)

    if not documents:
        print("No episode documents found.")
        return

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    chunks = splitter.split_documents(documents)

    print(f"Loaded episode documents: {len(documents)}")
    print(f"Created chunks: {len(chunks)}")

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vectorstore = FAISS.from_documents(
        chunks,
        embeddings
    )

    vectorstore.save_local(VECTORSTORE_DIR)

    print("Multi-anime FAISS vectorstore created successfully.")

    anime_counts = {}

    for chunk in chunks:
        anime = chunk.metadata["anime"]
        anime_counts[anime] = anime_counts.get(anime, 0) + 1

    print("\nIndexed anime:")

    for anime, count in anime_counts.items():
        print(f"{anime}: {count} chunks")


if __name__ == "__main__":
    ingest_documents()