import os
import cv2
import torch
import shutil
import numpy as np
from numpy.linalg import norm
from pymongo import MongoClient
import torchvision.transforms as transforms
import torchvision.models as models
from tqdm import tqdm
from ultralytics import YOLO
from PIL import Image

# 🔹 Connect to MongoDB
client = MongoClient("mongodb+srv://siddhantLM:root123@cluster0.xnqyg.mongodb.net/photo-gallery")
db = client["face_db"]
collection = db["face_features"]

# 🔹 Load YOLOv8-Face Model (Ensure yolov8n-face.pt is in the correct directory)
model_path = "yolov8n-face.pt"
if not os.path.exists(model_path):
    raise FileNotFoundError(f"❌ Model file '{model_path}' not found! Download from: https://github.com/deepcam-cn/yolov8-face/releases")

yolo_model = YOLO(model_path)

# 🔹 Load Pre-trained EfficientNet-B4 for Feature Extraction
feature_model = models.efficientnet_b4(pretrained=True)
feature_model = torch.nn.Sequential(*(list(feature_model.children())[:-1]))  # Remove last layer
feature_model.eval()

# 🔹 Image Preprocessing Function
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# 🔹 Function to Normalize Embeddings
def normalize_vector(vector):
    return vector / np.linalg.norm(vector)

# 🔹 Function to Detect Faces using YOLOv8
def detect_faces(image_path):
    results = yolo_model(image_path)
    face_boxes = []

    for result in results:
        for box in result.boxes.xyxy:
            x1, y1, x2, y2 = map(int, box)
            face_boxes.append((x1, y1, x2, y2))

    return face_boxes

# 🔹 Function to Extract Face Features
def extract_face_features(image_path):
    img = cv2.imread(image_path)
    if img is None:
        print(f"❌ Error: Could not read {image_path}")
        return None, None

    # Detect Faces
    face_boxes = detect_faces(image_path)
    face_embeddings = []

    for (x1, y1, x2, y2) in face_boxes:
        face = img[y1:y2, x1:x2]

        if face.shape[0] == 0 or face.shape[1] == 0:  
            continue  # Skip invalid faces

        face_pil = Image.fromarray(face)
        face_tensor = transform(face_pil).unsqueeze(0)

        with torch.no_grad():
            features = feature_model(face_tensor)

        face_embedding = normalize_vector(features.squeeze().numpy().flatten())
        face_embeddings.append(face_embedding)

    return face_embeddings, face_boxes  # Returns all detected face embeddings

# 🔹 Store Face Embeddings in MongoDB (Processing All Albums)
def store_faces_in_mongo(base_dir):
    """
    Process all images inside `test_albums/album_1`, `album_2`, ..., `album_5`
    and store embeddings in MongoDB.
    """
    for album in os.listdir(base_dir):
        album_path = os.path.join(base_dir, album)
        if os.path.isdir(album_path):  # Check if it's a directory (album)
            print(f"📂 Processing Album: {album}")
            for filename in tqdm(os.listdir(album_path)):
                if filename.lower().endswith((".jpg", ".png", ".jpeg", ".heic")):
                    image_path = os.path.join(album_path, filename)
                    face_embeddings, face_boxes = extract_face_features(image_path)

                    if face_embeddings is not None:
                        for i, embedding in enumerate(face_embeddings):
                            collection.insert_one({
                                "image_path": image_path,
                                "album_name": album,  # Store album name
                                "embedding": embedding.tolist(),
                                "region": face_boxes[i]
                            })
    print("✅ All face embeddings stored in MongoDB!")

# 🔹 Cosine Similarity Function
def cosine_similarity(vec1, vec2):
    return np.dot(vec1, vec2) / (norm(vec1) * norm(vec2))

# 🔹 Search for a Person in Group Photos Across All Albums
def search_person_in_group(query_image):
    query_face_embeddings, _ = extract_face_features(query_image)

    if query_face_embeddings is None:
        return []

    all_faces = list(collection.find())
    results = []

    for query_face in query_face_embeddings:
        for face in all_faces:
            similarity = cosine_similarity(query_face, np.array(face["embedding"]))
            results.append((face["image_path"], face["album_name"], face["_id"], similarity, face["region"]))

    results.sort(key=lambda x: x[3], reverse=True)
    return results[:25]  # Return top 10 similar faces

def copy_similar_images(results, output_folder="similar_faces"):
    """
    Copies similar images to a new folder.
    """
    os.makedirs(output_folder, exist_ok=True)  # Create folder if it doesn't exist
    copied_images = set()  # Avoid duplicate copies

    for img_path, album_name, _id, similarity, face_region in results:
        filename = os.path.basename(img_path)
        dest_path = os.path.join(output_folder, filename)

        if img_path not in copied_images:  # Avoid duplicate copies
            shutil.copy(img_path, dest_path)
            copied_images.add(img_path)
            print(f"✅ Copied {img_path} -> {dest_path}")

    print(f"\n📂 All similar images saved in `{output_folder}/`")



# 🔹 Run Everything
if __name__ == "__main__":
    # ✅ Step 1: Store All Faces from All Albums in MongoDB
    BASE_DIR = r"C:\Users\falgunip\Downloads\test_albums"  # Folder containing album_1, album_2, album_3...
    # store_faces_in_mongo(BASE_DIR)

    # ✅ Step 2: Search for a Person in Group Photos Across All Albums
    query_image = r"C:\Users\falgunip\Downloads\test_albums\album_1\ADI04384 REEDIT.jpg"
    results = search_person_in_group(query_image)

    print("\n🔍 Found Matching Faces Across Albums:")
    for img_path, album_name, face_id, similarity, face_region in results:
        print(f"📸 Album: {album_name} | Image: {img_path}, 🆔 Face ID: {face_id}, 🎯 Similarity: {similarity:.4f}")
    copy_similar_images(results)