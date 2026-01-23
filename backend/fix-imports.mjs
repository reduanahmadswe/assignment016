import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixImports(fullPath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      // Replace @/ imports with relative paths
      content = content.replace(
        /from ['"]@\/([^'"]+)['"]/g,
        (match, importPath) => {
          const fileDir = path.dirname(fullPath);
          const distDir = path.join(__dirname, 'dist');
          const targetPath = path.join(distDir, importPath + (importPath.endsWith('.js') ? '' : '.js'));
          const relativePath = path.relative(fileDir, targetPath).replace(/\\/g, '/');
          return `from '${relativePath.startsWith('.') ? relativePath : './' + relativePath}'`;
        }
      );
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  fixImports(distDir);
  }
