from pymongo import MongoClient
import numpy as np
from numpy.linalg import norm
import cv2
from numpy.linalg import norm
import torch
import torchvision.transforms as transforms
import torchvision.models as models
import os
# 🔹 Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["image_db"]
collection = db["image_features"]
# 🔹 Load Pre-trained EfficientNet Model
model = models.efficientnet_b0(pretrained=True)
model = torch.nn.Sequential(*(list(model.children())[:-1]))  # Remove last layer
model.eval()

# 🔹 Image Preprocessing Function
transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def extract_features(image_path):
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = transform(img).unsqueeze(0)  # Add batch dimension
    with torch.no_grad():
        features = model(img)
    return features.squeeze().numpy().flatten()  # Convert to 1D array


# 🔹 Cosine Similarity Function
def cosine_similarity(vec1, vec2):
    return np.dot(vec1, vec2) / (norm(vec1) * norm(vec2))

# 🔹 Function to Check Accuracy using Precision & Recall
def evaluate_accuracy(query_image_path, ground_truth_images, top_k=5):
    query_embedding = extract_features(query_image_path)  # Extract feature embedding
    all_images = list(collection.find())  # Get all stored embeddings

    # Compute similarity for all images
    similarities = [(img["image_path"], cosine_similarity(query_embedding, np.array(img["embedding"])))
                    for img in all_images]

    # Sort results by similarity (Descending)
    similarities.sort(key=lambda x: x[1], reverse=True)

    # Retrieve top-k similar images
    retrieved_images = [img[0] for img in similarities[:top_k]]

    # Compute Precision & Recall
    relevant_retrieved = len(set(retrieved_images) & set(ground_truth_images))
    total_retrieved = len(retrieved_images)
    total_relevant = len(ground_truth_images)

    precision = relevant_retrieved / total_retrieved if total_retrieved > 0 else 0
    recall = relevant_retrieved / total_relevant if total_relevant > 0 else 0

    return precision, recall

# 🔹 Run a Test for Accuracy
query_image = "path_to_query_image.jpg"
ground_truth = ["path_to_ground_truth1.jpg", "path_to_ground_truth2.jpg", "path_to_ground_truth3.jpg"]

precision, recall = evaluate_accuracy(query_image, ground_truth)

print(f"🎯 Precision: {precision:.4f}, 🔥 Recall: {recall:.4f}")
