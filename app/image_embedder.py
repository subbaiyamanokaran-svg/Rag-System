# app/image_embedder.py
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import torch

class ImageEmbedder:
    def __init__(self):
        self.model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        self.processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

    def embed_image(self, image: Image.Image) -> list:
        inputs = self.processor(images=image, return_tensors="pt")
        outputs = self.model.get_image_features(**inputs)
        return outputs[0].detach().numpy().tolist()
