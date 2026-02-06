from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import torch

# Load the BLIP model
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

def generate_caption(pil_image: Image.Image) -> str:
    inputs = processor(images=pil_image, return_tensors="pt")
    with torch.no_grad():
        out = model.generate(**inputs, max_length=100)
    caption = processor.decode(out[0], skip_special_tokens=True)
    return caption
