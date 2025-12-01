# JobCheck - Fake Job Post Detection

A clean, modern web application for detecting fraudulent job postings using NLP.

## 🎯 Current Features

✅ **Home Page** - Landing page with hero section and how it works  
✅ **Analyze Page** - Text and file upload for job post analysis  
✅ **Mock API** - Working prediction system  
✅ **Responsive Design** - Mobile and desktop optimized

## 🚀 Future Features

🔐 User authentication & login  
📊 Dashboard with analysis history  
💾 Save analyses to database

See [FUTURE_FEATURES.md](./FUTURE_FEATURES.md) for roadmap.

## 🛠️ Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Recharts (for charts)
- Lucide React (icons)

## 📁 Project Structure

```
src/
├── components/
│   ├── common/           # Reusable UI components
│   ├── auth/             # Reserved for future auth
│   └── sections/         # Landing page sections
├── pages/
│   ├── Home.jsx          # Landing page
│   ├── Analyze.jsx       # Analysis page
│   └── auth/             # Reserved for future auth pages
├── context/
│   ├── AnalyticsContext.jsx  # Local analytics
│   └── auth/             # Reserved for auth context
├── services/
│   ├── predictionService.js  # Prediction API
│   └── auth/             # Reserved for auth service
├── hooks/
│   └── useCustomHooks.js
├── utils/
│   └── helpers.js
└── App.jsx
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

Open http://localhost:5173

## 📝 Pages

### Home Page (/)
- Hero section with CTA
- How it works section
- Feature cards
- Navigation to Analyze page

### Analyze Page (/analyze)
- Text input for job descriptions
- File upload (PDF/Images)
- Real-time analysis
- Results with confidence scores
- Red flag highlighting

## 🔌 API Integration

Currently uses mock API. To integrate with real backend:

1. Update `src/services/predictionService.js`
2. Implement endpoints:
   - `POST /api/predict` - Analyze text
   - `POST /api/predict-file` - Analyze file

See `API_DOCUMENTATION.md` for details.

## 📚 Documentation

- `SETUP_GUIDE.md` - Development setup
- `API_DOCUMENTATION.md` - API integration
- `FUTURE_FEATURES.md` - Roadmap

## 🔒 Data Storage

Currently uses browser localStorage for local analytics. In Phase 2, user data will be saved to database when authentication is added.

---

**Clean, simple, and ready to extend!**
│   ├── utils/                # Utility functions
│   │   └── helpers.js
│   ├── assets/               # Static assets
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/                   # Static public files
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ombarvaliya/Infosys_FakeJob_Detection_using_NLP.git
cd frontend/jobcheck
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables** (optional)
```bash
# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

4. **Start development server**
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 📖 Usage

### 1. Home Page (`/`)
- View the hero section with app introduction
- Learn how the system works
- Quick access to analyze functionality

### 2. Analyze Page (`/analyze`)
- **Text Input**: Paste your job posting and click "Analyze"
- **File Upload**: Upload a PDF or image file with the job posting
- Get instant results with:
  - Real/Fake classification
  - Confidence percentage
  - Highlighted red flags
  - Detailed recommendations

### 3. Dashboard (`/dashboard`)
- View statistics of all analyzed posts
- See breakdown of real vs fake posts
- Review recent predictions table
- Clear analysis history

### 4. About Page (`/about`)
- Learn about the project
- Understand how the technology works
- Get contact information

## 🔌 API Integration

### Mock API (Default)
The frontend comes with built-in mock predictions for demo purposes. The mock API simulates a 2-second delay for realistic UX.

**Example Mock Response:**
```json
{
  "label": "fake",
  "probability": 0.87,
  "suspiciousWords": ["easy money", "work from home"]
}
```

### Real Backend Integration
To connect with a real backend:

1. Update the `API_BASE_URL` in `src/services/predictionService.js`:
```javascript
const API_BASE_URL = 'http://your-backend-url/api'
```

2. Backend should implement these endpoints:

**POST /predict**
```json
Request:
{
  "text": "Job description here..."
}

Response:
{
  "label": "real" | "fake",
  "probability": 0.95,
  "suspiciousWords": ["optional", "red", "flags"]
}
```

**POST /predict-file**
```
Request: multipart/form-data with file
Response: Same as /predict
```

## 🎨 UI Components Guide

### Button
```jsx
<Button variant="primary" size="md">
  Click Me
</Button>
```
Variants: `primary`, `secondary`, `danger`, `ghost`
Sizes: `sm`, `md`, `lg`

### Card
```jsx
<Card>
  <CardHeader>Header Content</CardHeader>
  <CardContent>Main Content</CardContent>
  <CardFooter>Footer Content</CardFooter>
</Card>
```

### Badge
```jsx
<Badge variant="success">Real Post</Badge>
```
Variants: `default`, `primary`, `success`, `danger`

### Loader
```jsx
<Loader size="md" />
```
Sizes: `sm`, `md`, `lg`

### Notification
```jsx
<Notification 
  message="Analysis complete!" 
  type="success" 
  onClose={() => {}}
/>
```
Types: `success`, `error`, `warning`, `info`

### FileUploader
```jsx
<FileUploader 
  onFileSelect={(file) => console.log(file)}
  accept=".pdf,.jpg,.png"
  maxSize={5}
/>
```

## 📊 Analytics Features

- **Total Posts Analyzed**: Cumulative count of all predictions
- **Fake Posts Detected**: Count and percentage of fake posts
- **Real Posts**: Count and percentage of legitimate posts
- **Distribution Charts**: Pie and bar charts visualization
- **Predictions Table**: Detailed history with timestamps

## 💾 Local Storage

The application uses browser's localStorage to persist:
- All predictions and analysis history
- User preferences

Data is stored locally and never sent to external servers (when using mock API).

## 🔐 Privacy & Security

- No user data collection
- No external API calls (when using mock API)
- All analysis happens locally
- No account or login required
- Clean data on browser clear

## 🌐 Responsive Design

- **Mobile-first approach**
- Optimized for devices 320px and up
- Tablet layouts (768px+)
- Desktop layouts (1024px+)
- Touch-friendly components

## 🎯 Performance

- **Vite for fast builds** (~100ms)
- **Code splitting** for faster page loads
- **Optimized images** and assets
- **Lazy loading** of components
- **Minimal dependencies** for smaller bundle size

## 📝 Form Validation

- Text input validation (non-empty)
- File type validation (PDF, JPG, PNG)
- File size validation (max 5MB)
- Real-time error messages
- User-friendly notifications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👥 Authors

- **Infosys FakeJob Detection Project**
- GitHub: [@ombarvaliya](https://github.com/ombarvaliya)

## 🙏 Acknowledgments

- Inspired by the need to protect job seekers from fraudulent postings
- Built with modern web technologies and best practices
- Special thanks to the open-source community

## 📞 Support

- 📧 Email: contact@jobcheck.ai
- 🐛 Report Issues: [GitHub Issues](https://github.com/ombarvaliya/Infosys_FakeJob_Detection_using_NLP/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/ombarvaliya/Infosys_FakeJob_Detection_using_NLP/discussions)

## 🗺️ Roadmap

- [ ] Advanced analytics dashboard
- [ ] Bulk analysis feature
- [ ] Email notifications
- [ ] Browser extension
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Export reports to PDF
- [ ] Team collaboration features

---

**Made with ❤️ to protect job seekers from fraud.**
