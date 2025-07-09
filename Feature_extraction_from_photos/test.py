import os
import cv2
import torch
import numpy as np
import shutil
from numpy.linalg import norm
from pymongo import MongoClient
import torchvision.transforms as transforms
import torchvision.models as models
from tqdm import tqdm
from fastapi import FastAPI, UploadFile, File
from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import hashlib
app =FastAPI()

from pydantic import BaseModel

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
UPLOAD_FOLDER_FOR_SEARCHED_IMG = os.path.join(BASE_DIR, "temp")
UPLOAD_FOLDER_FOR_IMG_PATH = os.path.join(BASE_DIR, "controller","uploads")
BASE_URL = "http://localhost:4000/uploads/"
print("here",UPLOAD_FOLDER_FOR_SEARCHED_IMG)
os.makedirs(UPLOAD_FOLDER_FOR_SEARCHED_IMG,exist_ok=True)

class ImageSearchModel(BaseModel):
    image_name: str

class AlbumRequest(BaseModel):
    album_name: str
    user_name: str
    folder_name: Optional[str] = None





client = MongoClient("mongodb+srv://siddhantLM:root123@cluster0.xnqyg.mongodb.net/photo-gallery")
db = client["image_db_b4_model"]
collection = db["image_features"]



model = models.efficientnet_b4(pretrained=True)
model = torch.nn.Sequential(*(list(model.children())[:-1]))  
model.eval()


transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def normalize_vector(vector):
    return vector / np.linalg.norm(vector)

def generate_image_hash(image_path):
    """Generate a unique hash (fingerprint) for an image."""
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return None
    img_bytes = img.tobytes()
    return hashlib.md5(img_bytes).hexdigest()


def extract_features(image_path):
    img = cv2.imread(image_path)
    if img is None:
        print(f" Error: Could not read {image_path}")
        return None
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = transform(img).unsqueeze(0)  
    with torch.no_grad():
        features = model(img)

    return normalize_vector(features.squeeze().numpy().flatten())  


def store_album_embeddings(album_name):
    album_path = os.path.join(UPLOAD_FOLDER_FOR_SEARCHED_IMG, album_name)

    if not os.path.isdir(album_path):
        print(f" Album {album_name} does not exist.")
        return {"status": "error", "message": "Album does not exist"}

    print(f" Processing Album: {album_name}")

    for filename in os.listdir(album_path):
        if filename.lower().endswith((".jpg", ".png", ".jpeg", ".heic")):
            image_path = os.path.join(album_path, filename)

            
            image_hash = generate_image_hash(image_path)

            
            if collection.find_one({"image_hash": image_hash}):
                print(f" Duplicate Image Skipped: {filename}")
                continue  

            embedding = extract_features(image_path)
            if embedding is not None:
                image_url = f"{BASE_URL}{album_name}/{filename}"  
                collection.insert_one({
                    "image_url": image_url,
                    "album_name": album_name,
                    "embedding": embedding.tolist(),
                    "image_hash": image_hash  
                })

    print(" All new image embeddings stored in MongoDB!")



def cosine_similarity(vec1, vec2):
    return np.dot(vec1, vec2) / (norm(vec1) * norm(vec2))


def search_all_images(user_input_image, album_filter=None):
    query_embedding = extract_features(user_input_image)
    if query_embedding is None:
        return []

    
    search_filter = {"album_name": album_filter} if album_filter else {}

    
    all_images = list(collection.find(search_filter))

    
    similarities = [
        {
            "url": img["image_url"],  
            "album_name": img["album_name"],
            "similarity": round(cosine_similarity(query_embedding, np.array(img["embedding"])), 4)
        }
        for img in all_images
    ]
    
    
    # similarities.sort(key=lambda x: x["similarity"], reverse=True)

    # Filter images with similarity > 0.4
    filtered_similarities = [img for img in similarities if img["similarity"] > 0.4]
    
    # Sort by similarity in descending order
    filtered_similarities.sort(key=lambda x: x["similarity"], reverse=True)

    return filtered_similarities  


def save_similar_images(results):
    output_folder = "similar_images_app"
    os.makedirs(output_folder, exist_ok=True)  

    for img_path, similarity in results:
        filename = os.path.basename(img_path)
        dest_path = os.path.join(output_folder, filename)

        shutil.copy(img_path, dest_path)  
        print(f" Copied {img_path} -> {dest_path}")

    print(f"\n All similar images saved in `{output_folder}/`")


def open_images_in_windows(results):
    for img_path, similarity in results:
        print(f"Opening: {img_path}, 🎯 Similarity: {similarity:.4f}")
        os.startfile(img_path)  


def evaluate_accuracy(query_image_path, ground_truth_images, top_k=5):
    query_embedding = extract_features(query_image_path)  
    all_images = list(collection.find())  

    
    similarities = [(img["image_path"], cosine_similarity(query_embedding, np.array(img["embedding"])))
                    for img in all_images]

    
    similarities.sort(key=lambda x: x[1], reverse=True)

    
    retrieved_images = [img[0] for img in similarities[:top_k]]

    
    relevant_retrieved = len(set(retrieved_images) & set(ground_truth_images))
    total_retrieved = len(retrieved_images)
    total_relevant = len(ground_truth_images)

    precision = relevant_retrieved / total_retrieved if total_retrieved > 0 else 0
    recall = relevant_retrieved / total_relevant if total_relevant > 0 else 0

    return precision, recall


def check_similarity_distribution(query_image_path, top_k=5):
    query_embedding = extract_features(query_image_path)
    all_images = list(collection.find())

    similarities = [(img["image_path"], cosine_similarity(query_embedding, np.array(img["embedding"])))
                    for img in all_images]

    similarities.sort(key=lambda x: x[1], reverse=True)

    
    similarity_scores = [sim[1] for sim in similarities[:top_k]]

    avg_similarity = np.mean(similarity_scores)
    print(f" Average Cosine Similarity: {avg_similarity:.4f}")

    return similarity_scores

@app.post("/search-image/")
async def search_image(data: ImageSearchModel):
    print("went to FASTAPI")
    try:
       
        file_path = os.path.join(UPLOAD_FOLDER_FOR_SEARCHED_IMG, data.image_name)
        print(BASE_DIR)
        print(f"Looking for file: {file_path}")
       
        if not os.path.exists(file_path):
            return JSONResponse(content={"error": "File not found in temp folder"}, status_code=404)

      
        results = search_all_images(file_path)

        
        os.remove(file_path)
        print("result", results)
        return JSONResponse(content={"results": results})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/process-album/")
async def process_album(data: AlbumRequest):
    try:
        album_name = data.album_name
        user_name = data.user_name
        # folder_name = data.folder_name
        album_path = os.path.join(UPLOAD_FOLDER_FOR_IMG_PATH, user_name, album_name, "originals")

        if not os.path.isdir(album_path):
            return JSONResponse(content={"status": "error", "message": "Album does not exist"}, status_code=404)

        print(f"Processing Album: {album_name}")

        processed_images = []

        for filename in os.listdir(album_path):
            if filename.lower().endswith((".jpg", ".png", ".jpeg", ".heic")):
                try:
                    image_path = os.path.join(album_path, filename)
                    image_hash = generate_image_hash(image_path)

                    # existing_entry = collection.find_one({"image_hash": image_hash})
                    # if existing_entry:
                    #     print(f" Duplicate Image Skipped: {filename}")
                    #     processed_images.append({"image_url": existing_entry["image_url"], "status": "skipped"})
                    #     continue

                    embedding = extract_features(image_path)
                    if embedding is not None:
                        image_url = f"{BASE_URL}{user_name}/{album_name}/originals/{filename}"

                        collection.insert_one({
                            "image_url": image_url,
                            "album_name": album_name,
                            "embedding": embedding.tolist(),
                            "image_hash": image_hash
                        })

                        processed_images.append({"image_url": image_url, "status": "processed"})
                    else:
                        print(f"Failed to extract features for {filename}")
                        processed_images.append({"image_url": "", "filename": filename, "status": "failed_feature_extraction"})

                except Exception as e:
                    print(f"Error processing image {filename}: {str(e)}")
                    processed_images.append({"image_url": "", "filename": filename, "status": "error", "error": str(e)})
                    continue  # Continue processing other images

        return JSONResponse(
            content={
                "status": "success", 
                "message": f"Album {album_name} processed successfully", 
                "processed_images": processed_images
            },
            status_code=200
        )

    except Exception as e:
        print(f"Error processing album {album_name}: {str(e)}")
        return JSONResponse(
            content={
                "status": "error", 
                "message": f"Failed to process album: {str(e)}"
            }, 
            status_code=500
        )
if __name__ == "__main__":
    
    # BASE_DIR = r"C:\Users\falgunip\Downloads\test_albums"  
    
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

    
    
    

    
    
    

    
    
    
    
    

    
    
    
    
