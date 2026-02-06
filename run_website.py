#!/usr/bin/env python3
"""
DocuMind AI - Professional Document Intelligence Platform
Startup script for the commercial website
"""

import os
import sys
import subprocess
from pathlib import Path

def check_environment():
    """Check if the environment is properly set up"""
    print("Checking environment setup...")
    
    # Check if .env file exists
    env_file = Path(".env")
    if not env_file.exists():
        print("ERROR: .env file not found!")
        print("Please create a .env file with your Cohere API key:")
        print("   COHERE_API_KEY=your_api_key_here")
        print("   DATA_DIR=data")
        return False
    
    # Check if Cohere API key is set
    from dotenv import load_dotenv
    load_dotenv()
    
    if not os.getenv("COHERE_API_KEY"):
        print("ERROR: COHERE_API_KEY not found in .env file!")
        print("Please add your Cohere API key to the .env file")
        return False
    
    print("Environment setup complete")
    return True

def install_dependencies():
    """Install required dependencies"""
    print("Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError:
        print("Failed to install dependencies")
        return False

def start_server():
    """Start the FastAPI server"""
    print("Starting DocuMind AI server...")
    print("Website will be available at: http://localhost:8000")
    print("API documentation at: http://localhost:8000/docs")
    print("\nFeatures available:")
    print("   - Professional web interface")
    print("   - Document upload (PDF, DOCX, TXT)")
    print("   - AI-powered Q&A")
    print("   - Source citations")
    print("   - Chat history")
    print("   - Responsive design")
    print("\nPress Ctrl+C to stop the server\n")
    
    try:
        # Change to backend directory and start the server
        os.chdir("backend")
        subprocess.run([sys.executable, "main.py"])
    except KeyboardInterrupt:
        print("\nServer stopped. Thank you for using DocuMind AI!")
    except Exception as e:
        print(f"Error starting server: {e}")

def main():
    """Main startup function"""
    print("DocuMind AI - Professional Document Intelligence Platform")
    print("=" * 60)
    
    # Check environment
    if not check_environment():
        return
    
    # Install dependencies
    if not install_dependencies():
        return
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()
