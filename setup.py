# setup.py
from setuptools import setup, find_packages

setup(
    name="rag_system",
    version="0.1",
    packages=find_packages(),  # Automatically detects the `app` package
    install_requires=[
        "openai",
        "langchain",
        "faiss-cpu",
        "streamlit",
        "python-dotenv",
        "tiktoken"
    ],
)
