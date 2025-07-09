from pymongo import MongoClient

# Connect to MongoDB (Update this if using MongoDB Atlas)
client = MongoClient("mongodb://localhost:27017/")

# Select Database and Collection
db = client["image_db"]
collection = db["image_features"]

print("Connected to MongoDB!")

import torch
import torchvision.transforms as transforms
import torchvision.models as models
import numpy as np
import cv2
import os
from tqdm import tqdm

# Path to Image Dataset
IMAGE_DIR = r"C:\Users\falgunip\Downloads\test_photos\test_photos"



# Load Pre-trained EfficientNet
model = models.efficientnet_b0(pretrained=True)
model = torch.nn.Sequential(*(list(model.children())[:-1]))  # Remove classification layer
model.eval()

# Image Preprocessing
transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Function to extract image embeddings
def extract_features(image_path):
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = transform(img).unsqueeze(0)  # Add batch dimension
    with torch.no_grad():
        features = model(img)
    return features.squeeze().numpy().flatten()  # Convert to 1D array



# Process and Store Images in MongoDB
for filename in tqdm(os.listdir(IMAGE_DIR)):
    if filename.endswith((".jpg", ".png", ".jpeg")):
        image_path = os.path.join(IMAGE_DIR, filename)
        embedding = extract_features(image_path).tolist()  # Convert to list for MongoDB storage

        # Store in MongoDB
        collection.insert_one({
            "image_path": image_path,
            "embedding": embedding
        })

print("✅ All image embeddings stored in MongoDB!")
