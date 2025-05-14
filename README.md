# Housy-ILOGsys

![Housy-ILOGsys Logo](static/images/projects/default.png)

## Overview

Housy-ILOGsys is a comprehensive construction project management application designed specifically for the Tunisian market. The platform provides tools for construction project planning, material management, cost estimation, and AI-powered assistance for construction professionals.

## Features

- **Project Management**: Plan, track, and manage construction projects efficiently
- **Materials Database**: Access a comprehensive database of construction materials available in Tunisia
- **AI-Powered Chat Assistant**: Get intelligent help with project planning and material selection
- **Cost Estimation**: Generate accurate cost estimates for projects based on material prices and quantities
- **Market Trends Analysis**: Visualize trends in material availability and pricing
- **Resource Management**: Organize and monitor project resources and personnel
- **Interactive Gantt Charts**: View project timelines and milestones visually

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (with Drizzle ORM)
- **AI Integration**: Integration with AI models for intelligent assistance
- **Image Processing**: Support for project and profile image uploads

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- (Optional) Ollama for local AI model integration

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/tekteku/Housy-ILOGsys.git
   cd Housy-ILOGsys
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgres://username:password@localhost:5432/housy
   PORT=3000
   ```

4. Set up the database
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Run the application
   ```bash
   # Development mode
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend Node.js/Express application
- `/shared` - Shared types and utilities
- `/scripts` - Utility scripts for setup and maintenance
- `/static` - Static assets like images and fonts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Tunisia Construction Industry contributors
- All open-source libraries used in this project
- ILOG Systems for project sponsorship and guidance
