# Wedding Invitation Web Page

Mobile-First Wedding Invitation mobile web page built with React, Vite, Tailwind CSS, and Framer Motion.

## 🎉 Features

- **Hero Section** - Beautiful landing with parallax scrolling effects
- **Photo Gallery** - Interactive grid gallery with modal view
- **Location Maps** - Integrated Naver Maps for venue locations
- **RSVP Form** - Complete guest management with form validation
- **Account Information** - Digital envelope for wedding blessings
- **Responsive Design** - Optimized for all screen sizes (mobile-first)
- **Smooth Animations** - Elegant transitions using Framer Motion

## 🛠️ Tech Stack

- **React 19.2.0** - Modern React with latest features
- **Vite 7.2.4** - Lightning-fast build tool and dev server
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **Framer Motion** - Production-ready animation library
- **Naver Maps** - Location integration for Korean venues

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/graviton94/Wedding.git
cd Wedding
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
Wedding/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── Hero.jsx       # Hero section with parallax
│   │   ├── Gallery.jsx    # Photo gallery
│   │   ├── Location.jsx   # Location with maps
│   │   └── RSVP.jsx       # RSVP form and accounts
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles with Tailwind
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
├── eslint.config.js       # ESLint configuration
└── package.json           # Dependencies
```

## 🎨 Customization

### Update Wedding Details

Edit the component files to customize:

1. **Hero Section** (`src/components/Hero.jsx`)
   - Names of bride and groom
   - Wedding date and location
   - Colors and styling

2. **Gallery** (`src/components/Gallery.jsx`)
   - Replace placeholder image URLs with actual photos
   - Adjust grid layout if needed

3. **Location** (`src/components/Location.jsx`)
   - Update venue names and addresses
   - Modify map coordinates (lat/lng)
   - Update transportation details

4. **RSVP** (`src/components/RSVP.jsx`)
   - Update bank account details
   - Modify form fields as needed
   - Connect to your backend API

### Styling

The project uses Tailwind CSS. Modify classes in components or update `src/index.css` for global styles.

## 🧪 Development

### Linting

```bash
npm run lint
```

### Format Code

The project follows ESLint configuration. Make sure to run linting before committing.

## 📱 Mobile-First Design

This project is built with a mobile-first approach, ensuring optimal experience on:
- Mobile phones (320px - 480px)
- Tablets (481px - 768px)
- Desktops (769px+)

## 🔒 Security

- No sensitive data logged to console
- Input validation on forms
- Coordinate validation for map integration
- Safe clipboard operations

## 📄 License

This project is open source and available for personal use.

## 🙏 Acknowledgments

Built using "Vibe Coding" methodology with AI agents (Gemini & GitHub Copilot) to orchestrate the design and logic.

---

Made with ❤️ for your special day
