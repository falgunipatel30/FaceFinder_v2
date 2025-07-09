# FaceFinder 👤📁

FaceFinder is a powerful face recognition app that allows users to create albums and organize images into nested folders. With an intuitive UI and robust backend, FaceFinder helps users quickly find all instances of a specific face across their image library using AI.

## 🔍 Key Features

- 📁 **Album and Folder Management**  
  Users can create albums and nested folders for flexible image organization.

- 📸 **Image Upload with Automatic Thumbnails**  
  Images are stored in both original and thumbnail versions for optimized performance.

- 🧠 **Face Search Functionality**  
  Upload a reference image and our model will find all matching faces across the album hierarchy.

- 🗂️ **Directory Structure**
  /{username}/{album_name}/{folder_name}/{subfolder_name}/originals
  /{username}/{album_name}/{folder_name}/{subfolder_name}/thumbnails

## 🛠️ Tech Stack

- **Frontend**: React / Tailwind (optional)
- **Backend**: Node.js / Express
- **Database**: MongoDB
- **Face Recognition**: custom model
- **File Storage**: Filesystem-based (organized by user and folder hierarchy)
- **Image Processing**: Sharp (for thumbnail creation and watermark addition)


2. Install Dependencies
📦 Frontend dependencies (in root)
bash
Copy
Edit
npm install
📦 Backend dependencies (in /backend)
bash
Copy
Edit
cd backend
npm install
cd ..
3. Set Up Environment Variables
In root .env:
env
Copy
Edit
VITE_API_BASE_URL=http://localhost:5000
In /backend/.env:
env
Copy
Edit
PORT=5000
MONGODB_URI=your_mongodb_connection_string
UPLOADS_DIR=uploads
JWT_SECRET=your_secret_key
4. Start the App
🖥️ Start the frontend (from root):
bash
Copy
Edit
npm start
🧠 Start the backend (from /backend):
bash
Copy
Edit
cd backend
node index.js
Make sure both frontend and backend servers are running simultaneously.

📂 Folder Structure Example
markdown
Copy
Edit
uploads/
└── johndoe/
    └── MyAlbum/
        └── Vacation/
            ├── originals/
            │   └── image1.jpg
            └── thumbnails/
                └── image1.jpg