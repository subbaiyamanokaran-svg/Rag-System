import os
from dotenv import load_dotenv
load_dotenv()

COHERE_API_KEY = os.getenv(Yourapikeyhere)
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 100
VECTORSTORE_DIR = "vectorstore"
DATA_DIR = "path_to_data_folder"
DATA_DIR = os.getenv("DATA_DIR", "data")
