import os
import json
from datetime import datetime

class ChatMemory:
    def __init__(self):
        self.chat_history = []

    def add_message(self, role, content):
        self.chat_history.append({"role": role, "content": content})

    def get_history(self):
        return self.chat_history

    def clear(self):
        self.chat_history = []

    def to_markdown(self):
        return "\n\n".join(
            [f"**{m['role'].capitalize()}**: {m['content']}" for m in self.chat_history]
        )

    def save_to_file(self, folder="chat_logs"):
        os.makedirs(folder, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = os.path.join(folder, f"chat_{timestamp}.json")
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(self.chat_history, f, indent=2)
        return filepath

    def load_from_file(self, filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            self.chat_history = json.load(f)
