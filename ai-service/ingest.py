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

    # Go through each anime folder
    for anime_name in os.listdir(DOCUMENTS_DIR):

        anime_path = os.path.join(DOCUMENTS_DIR, anime_name)

        if not os.path.isdir(anime_path):
            continue

        # Go through episode files
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

    # Split documents into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    chunks = splitter.split_documents(documents)

    print(f"Loaded episode documents: {len(documents)}")
    print(f"Created chunks: {len(chunks)}")

    # Create embeddings
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    # Create FAISS vectorstore
    vectorstore = FAISS.from_documents(
        chunks,
        embeddings
    )

    vectorstore.save_local(VECTORSTORE_DIR)

    print("Episode-aware FAISS vectorstore created successfully.")

    # Show metadata
    for chunk in chunks:
        print(
            f"Anime: {chunk.metadata['anime']} | "
            f"Episode: {chunk.metadata['episode']}"
        )


if __name__ == "__main__":
    ingest_documents()