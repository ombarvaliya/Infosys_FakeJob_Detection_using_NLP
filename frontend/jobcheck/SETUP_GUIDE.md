# JobCheck Frontend - Setup & Development Guide

## 📋 Quick Setup

### 1. Install Dependencies

```bash
cd frontend/jobcheck
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
npm run preview
```

---

## 🎯 Project Overview

This is a production-ready React application built with:
- ⚡ **Vite** - Fast build tool
- 🎨 **Tailwind CSS** - Utility-first CSS
- 📊 **Recharts** - Data visualization
- 🧭 **React Router** - Page routing
- 🎯 **React Context** - State management

## 📁 Key Files & Folders

| Path | Purpose |
|------|---------|
| `src/pages/` | Main pages (Home, Analyze, Dashboard, About) |
| `src/components/` | Reusable UI components |
| `src/services/` | API integration layer |
| `src/context/` | Global state (Analytics) |
| `src/hooks/` | Custom React hooks |
| `src/utils/` | Helper functions |
| `tailwind.config.js` | Tailwind customization |

---

## 🖥️ Available Scripts

### Development
```bash
npm run dev          # Start dev server with HMR
npm run lint         # Run ESLint
```

### Production
```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to change brand colors:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#0ea5e9',  // Main brand color
        600: '#0284c7',
        // ... more shades
      }
    }
  }
}
```

### Fonts
Update in `tailwind.config.js`:

```javascript
fontFamily: {
  sans: ['Your-Font-Name', 'system-ui', 'sans-serif'],
}
```

### API Endpoint
Modify `src/services/predictionService.js`:

```javascript
const API_BASE_URL = 'http://your-api-url/api'
```

---

## 🔌 API Integration

### For Demo (Mock API)
Default behavior - no setup needed. Uses localStorage.

### For Real Backend
1. Set `VITE_API_URL` in `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

2. Update service to use real API:
```javascript
const useRealAPI = true
```

3. Backend must implement:
   - `POST /api/predict` - Text analysis
   - `POST /api/predict-file` - File analysis

See `API_DOCUMENTATION.md` for details.

---

## 📊 Project Structure

```
jobcheck/
├── src/
│   ├── components/          # React components
│   │   ├── common/         # Reusable components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── FileUploader.jsx
│   │   │   └── ...
│   │   └── sections/       # Page sections
│   │       ├── HeroSection.jsx
│   │       ├── PredictionResult.jsx
│   │       ├── AnalyticsCharts.jsx
│   │       └── ...
│   ├── pages/              # Full pages
│   │   ├── Home.jsx
│   │   ├── Analyze.jsx
│   │   ├── Dashboard.jsx
│   │   └── About.jsx
│   ├── context/            # React Context
│   │   └── AnalyticsContext.jsx
│   ├── hooks/              # Custom hooks
│   │   └── useCustomHooks.js
│   ├── services/           # API services
│   │   └── predictionService.js
│   ├── utils/              # Utilities
│   │   └── helpers.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🚀 Component Usage Examples

### Button
```jsx
<Button 
  variant="primary" 
  size="lg"
  onClick={() => console.log('clicked')}
>
  Click Me
</Button>
```

### Card
```jsx
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Notification
```jsx
<Notification
  message="Success!"
  type="success"
  onClose={() => {}}
/>
```

### Loader
```jsx
<Loader size="md" />
```

### FileUploader
```jsx
<FileUploader 
  onFileSelect={handleFile}
  maxSize={5}
/>
```

---

## 💾 Data Persistence

The app uses **localStorage** to save:
- All predictions and analysis history
- User preferences

Clear browser data to reset the application.

---

## 🔒 Security Best Practices

- ✅ No sensitive data in localStorage
- ✅ Client-side validation before API calls
- ✅ HTTPS for production
- ✅ No hardcoded API keys
- ✅ CORS properly configured

---

## ⚡ Performance Tips

1. **Code Splitting**: Routes are automatically code-split
2. **Lazy Loading**: Components load on demand
3. **Optimization**: Vite handles tree-shaking
4. **Bundle Size**: Keep dependencies minimal
5. **Image Optimization**: Use modern formats

Check bundle size:
```bash
npm run build
```

---

## 🐛 Debugging

### Browser DevTools
- React DevTools extension for component inspection
- Network tab for API calls
- Console for error messages

### Tailwind CSS
Add to `tailwind.config.js` for debugging:
```javascript
safelist: [
  // Add any dynamically generated classes here
],
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Min Width |
|-----------|-----------|
| Mobile   | 0px       |
| sm       | 640px     |
| md       | 768px     |
| lg       | 1024px    |
| xl       | 1280px    |
| 2xl      | 1536px    |

Usage:
```jsx
<div className="text-sm md:text-lg lg:text-2xl">
  Responsive text
</div>
```

---

## 🧪 Testing (Coming Soon)

Set up testing with:
```bash
npm install --save-dev vitest @testing-library/react
```

---

## 📚 Resources

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [React Router](https://reactrouter.com)

---

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Docker
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📞 Support

- Issues: [GitHub Issues](https://github.com/ombarvaliya/Infosys_FakeJob_Detection_using_NLP)
- Email: contact@jobcheck.ai

---

**Happy coding! 🎉**
