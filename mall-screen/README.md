# Mall Screen 

### Frontend

- **React** (v19.1.0) 
- **React Router** (v7.6.3)
- **Tailwind CSS** 
- **CSS** 
- **GSAP** (GreenSock Animation Platform) 
- **Three.js** 
- **QRCode.react** (QR code generation for displaying ads) 

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)  
- npm  
- Docker (for PostgreSQL)


## Project Structure
```bash
mall-screen/

DB (Database configuration)
    docker-compose.yml: PostgreSQL + Adminer setup  

public
    Ad/: Advertisement images & videos  
    icons/: UI icons  
    robot/: 3D robot models  

src (Source code)

    Robot/
        3D robot component

    components(Reusable UI components)
        Footer.jsx: Footer navigation  
        Help.jsx: Help section  
        TopNavbar.jsx: Top navigation bar  

    screenone (Welcome screen)
        WelcomeSection.jsx: Initial welcome screen  

    screentwo (Advertisement screen)
        AdManagement.jsx: Handles ad logic and rotation  
        AdSection.jsx: Main ad display container  
        AdSampleData.jsx: Sample advertisement data  
        QrContainer.jsx: QR code generation for ads  
```

### Installation & Setup

##### Create Vite React app
```bash
npm create vite@latest mall-screen
cd mall-screen
```
##### Install core dependencies
```bash
npm install
```

##### Tailwind CSS setup
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

##### Install 3D and animation tools
```bash
npm install three @react-three/fiber @react-three/drei
npm install gsap
```

##### Install routing and QR support
```bash
npm install react-router-dom
npm install qrcode.react
npm install qrcode.react
```