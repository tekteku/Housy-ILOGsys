import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticRoot = path.join(__dirname, '../static');

// Create static directory structure
function createStaticDirectoryStructure() {
  const directories = [
    'images/profiles',
    'images/projects',
    'icons',
    'fonts',
    'css',
    'js'
  ];

  directories.forEach(dir => {
    const dirPath = path.join(staticRoot, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    } else {
      console.log(`Directory already exists: ${dirPath}`);
    }
  });
}

// Copy default images to static directory
async function copyDefaultImages() {
  // Import the image creation scripts
  await import('./create-static-avatars.js');
  await import('./create-project-image.js');
}

// Main function
async function setupStaticAssets() {
  console.log('Setting up static assets...');
  createStaticDirectoryStructure();
  await copyDefaultImages();
  console.log('Static assets setup complete!');
}

// Run the setup
setupStaticAssets().catch(error => {
  console.error('Error setting up static assets:', error);
  process.exit(1);
});
