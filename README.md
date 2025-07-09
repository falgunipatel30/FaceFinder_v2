# FaceFinder 👤📁

FaceFinder is a powerful face recognition application that allows users to create albums and organize images into nested folders. With an intuitive UI and robust backend, FaceFinder helps users quickly find all instances of a specific face across their image library using AI-powered face recognition.

## 🔍 Key Features

- 📁 **Album and Folder Management** - Create albums and nested folders for flexible image organization
- 📸 **Image Upload with Automatic Thumbnails** - Images are stored in both original and thumbnail versions for optimized performance
- 🧠 **Face Search Functionality** - Upload a reference image and our AI model will find all matching faces across the album hierarchy
- 🗂️ **Organized Directory Structure** - Systematic file organization by user, album, and folder hierarchy
- 🔐 **User Authentication** - Secure user accounts with JWT-based authentication
- ⚡ **Performance Optimized** - Thumbnail generation and efficient file storage for fast loading

## 🛠️ Tech Stack

- **Frontend**: React with Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Face Recognition**: Custom AI model
- **File Storage**: Filesystem-based organization
- **Image Processing**: Sharp (thumbnail creation and watermark addition)
- **Authentication**: JWT (JSON Web Tokens)

## 📂 Directory Structure

The application organizes files in the following structure:

```
uploads/
└── {username}/
    └── {album_name}/
        └── {folder_name}/
            └── {subfolder_name}/
                ├── originals/
                │   └── image1.jpg
                └── thumbnails/
                    └── image1.jpg
```

### Example:
```
uploads/
└── johndoe/
    └── MyAlbum/
        └── Vacation/
            ├── originals/
            │   ├── beach_photo.jpg
            │   └── family_dinner.jpg
            └── thumbnails/
                ├── beach_photo.jpg
                └── family_dinner.jpg
```

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/facefinder.git
cd facefinder
```

### 2. Install Dependencies

**Frontend dependencies (in root directory):**
```bash
npm install
```

**Backend dependencies:**
```bash
cd backend
npm install
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:5000
```

Create a `.env` file in the `/backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
UPLOADS_DIR=uploads
JWT_SECRET=your_secret_key
```

### 4. Start the Application

**Start the frontend (from root directory):**
```bash
npm start
```

**Start the backend (in a new terminal):**
```bash
cd backend
node index.js
```

Make sure both frontend and backend servers are running simultaneously.

## 🎯 Usage

1. **Create an Account** - Sign up for a new account or log in with existing credentials
2. **Create Albums** - Organize your images by creating albums for different categories
3. **Upload Images** - Add images to your albums with automatic thumbnail generation
4. **Create Folders** - Organize images within albums using nested folder structures
5. **Face Search** - Upload a reference image to find all matching faces across your library

## 📁 Project Structure

```
facefinder/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   └── App.js
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── index.js
├── uploads/
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Albums
- `GET /api/albums` - Get user's albums
- `POST /api/albums` - Create new album
- `DELETE /api/albums/:id` - Delete album

### Images
- `POST /api/images/upload` - Upload images
- `GET /api/images/:albumId` - Get album images
- `DELETE /api/images/:id` - Delete image

### Face Recognition
- `POST /api/face/search` - Search for faces

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- Large image uploads may take time to process
- Face recognition accuracy depends on image quality
- Nested folder depth is limited for performance reasons

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

## 🔮 Future Enhancements

- Cloud storage integration (AWS S3, Google Cloud)
- Advanced face clustering algorithms
- Mobile app development
- Batch image processing
- Real-time face detection
- Social sharing features

---

**Built with ❤️ by the FaceFinder Team**