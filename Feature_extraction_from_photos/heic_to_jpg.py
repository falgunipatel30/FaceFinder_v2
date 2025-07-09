import os
import cv2
import torch
import numpy as np
from numpy.linalg import norm
from pymongo import MongoClient
import torchvision.transforms as transforms
import torchvision.models as models
from tqdm import tqdm
#from pillow_heif import register_heif_opener
from PIL import Image
import shutil

# 🔹 Register HEIC Support in PIL
from pillow_heif import register_heif_opener
register_heif_opener()


# 🔹 Connect to MongoDB
client = MongoClient("mongodb+srv://siddhantLM:root123@cluster0.xnqyg.mongodb.net/photo-gallery")
db = client["image_db"]
collection = db["image_features"]

# 🔹 Load Pre-trained EfficientNet Model
model = models.efficientnet_b0(pretrained=True)
model = torch.nn.Sequential(*(list(model.children())[:-1]))  # Remove last layer
model.eval()

# 🔹 Image Preprocessing Function
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])
# 🔹 Function to Normalize Embeddings
def normalize_vector(vector):
    return vector / np.linalg.norm(vector)


# 🔹 Function to Extract Image Features (Supports HEIC)
def extract_features(image_path):
    if image_path.lower().endswith(".heic"):
        image = Image.open(image_path)
        image = image.convert("RGB")  # Convert HEIC to RGB
    else:
        img = cv2.imread(image_path)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        image = Image.fromarray(img)

    img_tensor = transform(image).unsqueeze(0)  # Add batch dimension
    with torch.no_grad():
        features = model(img_tensor)

    return normalize_vector(features.squeeze().numpy().flatten())  # Normalize and return

# 🔹 Store Image Embeddings in MongoDB
def store_images_in_mongo(image_dir):
    for filename in tqdm(os.listdir(image_dir)):
        if filename.lower().endswith((".jpg", ".png", ".jpeg", ".heic")):
            image_path = os.path.join(image_dir, filename)
            embedding = extract_features(image_path).tolist()  # Convert to list for MongoDB storage

            # Store in MongoDB
            collection.insert_one({
                "image_path": image_path,
                "embedding": embedding
            })

    print("✅ All image embeddings (including HEIC) stored in MongoDB!")

# 🔹 Cosine Similarity Function
def cosine_similarity(vec1, vec2):
    return np.dot(vec1, vec2) / (norm(vec1) * norm(vec2))

# 🔹 Search for ALL Images Sorted by Similarity
def search_all_images(user_input_image):
    query_embedding = extract_features(user_input_image)  # Support HEIC

    # Retrieve all stored image embeddings from MongoDB
    all_images = list(collection.find())

    # Compute cosine similarity for ALL images
    similarities = [
        (img["image_path"], cosine_similarity(query_embedding, np.array(img["embedding"])))
        for img in all_images
    ]

    # Sort by similarity (from highest to lowest)
    similarities.sort(key=lambda x: x[1], reverse=True)
    
    return similarities  # Return all images sorted by similarity

# 🔹 Create a Folder and Copy Similar Images
def save_similar_images(results):
    output_folder = "similar_images"
    os.makedirs(output_folder, exist_ok=True)  # Create folder if it doesn't exist

    for img_path, similarity in results:
        filename = os.path.basename(img_path)
        dest_path = os.path.join(output_folder, filename)

        shutil.copy(img_path, dest_path)  # Copy the image to the new folder
        # print(f"✅ Copied {img_path} -> {dest_path}")

   

    
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

# 🔹 Open Images in Windows
def open_images_in_windows(results):
    for img_path, similarity in results:
        os.startfile(img_path)  # Opens the image using the default image viewer

def check_similarity_distribution(query_image_path, top_k=5):
    query_embedding = extract_features(query_image_path)
    all_images = list(collection.find())

    similarities = [(img["image_path"], cosine_similarity(query_embedding, np.array(img["embedding"])))
                    for img in all_images]

    similarities.sort(key=lambda x: x[1], reverse=True)

    # Extract similarity scores
    similarity_scores = [sim[1] for sim in similarities[:top_k]]

    avg_similarity = np.mean(similarity_scores)
    print(f"📊 Average Cosine Similarity: {avg_similarity:.4f}")

    return similarity_scores




# 🔹 Run Everything
if __name__ == "__main__":
    IMAGE_DIR = r"C:\Users\falgunip\Downloads\Ooty_photos\Ooty_photos"  # Replace with your dataset folder
    store_images_in_mongo(IMAGE_DIR) 

    user_image = r"C:\Users\falgunip\Downloads\Ooty_photos\Ooty_photos\aditi_fal.heic"  # Can be HEIC or JPG/PNG
    results = search_all_images(user_image)  # Find similar images

    print("\n🔍 All Images Sorted by Similarity:")
    for img_path, similarity in results:
        print(f"📸 Image: {img_path}, 🎯 Similarity: {similarity:.4f}")

    #open_images_in_windows(results)
    # 🔹 Run a Test for Accuracy
    query_image =  r"C:\Users\falgunip\Downloads\Ooty_photos\Ooty_photos\aditi_fal.heic"
    ground_truth = [r"C:\Users\falgunip\Downloads\Ooty_photos\Ooty_photos\IMG_0669.HEIC", 
                    r"C:\Users\falgunip\Downloads\Ooty_photos\Ooty_photos\IMG_0910.HEIC", 
                    r"C:\Users\falgunip\Downloads\Ooty_photos\Ooty_photos\IMG_0910.HEIC"]

    precision, recall = evaluate_accuracy(query_image, ground_truth)

    print(f"🎯 Precision: {precision:.4f}, 🔥 Recall: {recall:.4f}")
    save_similar_images(results)
    # 🔹 Run a Test for Similarity Distribution
    similarity_scores = check_similarity_distribution(query_image)
    print("🔍 Cosine Similarity Scores:", similarity_scores)
