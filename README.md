# 18653-SDA-Project-Momie
Momie, your movie homie!

## Installation

### Clone the repository:
```bash
git clone https://github.com/AAsteria/18653-SDA-Project-Momie.git
cd 18653-SDA-Project-Momie
```

### Install Dependencies:
```bash
npm install
```

## Scripts and Commands

### Build
Build both the frontend and backend:
```bash
npm run build
```
- **Frontend:** The React app is built in `src/frontend/build`.
- **Backend:** The TypeScript files are compiled to JavaScript in `dist`.

### Start
Start the backend and frontend simultaneously:
```bash
npm run start
```

### Simple Start
Simple script to build and start:
```bash
npm start
```

Alternatively, start each individually:

#### Frontend:
```bash
npm run start:frontend
```

#### Backend:
```bash
npm run start:backend
```

For more commands, check package.json

## MongoDB Connection

To start MongoDB, run:
```bash
mongod --dbpath ~/data/db
```

## Project Structure
```plaintext
├── src
│   ├── frontend         # React frontend
│   ├── services         # Micro-services
│   ├── workbench        # Additional tools or services
├── dist                 # Compiled backend code
├── node_modules         # Dependencies
├── tsconfig.json        # TypeScript configuration
├── package.json         # Project metadata and scripts
```

## Notes
- Use `.env` files to configure environment variables.
- Ensure the database (e.g., MongoDB) is running before starting the backend.
