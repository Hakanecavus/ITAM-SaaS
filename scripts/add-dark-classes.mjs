import fs from 'fs';
import path from 'path';

const dirs = [
  path.resolve(process.cwd(), 'src/app/login'),
  path.resolve(process.cwd(), 'src/app/register')
];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = {
  'bg-white': 'bg-white dark:bg-slate-800',
  'border-slate-200': 'border-slate-200 dark:border-slate-700',
  'text-slate-800': 'text-slate-800 dark:text-slate-100',
  'text-slate-700': 'text-slate-700 dark:text-slate-300',
  'text-slate-600': 'text-slate-600 dark:text-slate-400',
  'text-slate-500': 'text-slate-500 dark:text-slate-400',
  'bg-slate-50': 'bg-slate-50 dark:bg-slate-900/50',
  'border-slate-100': 'border-slate-100 dark:border-slate-800',
  'divide-slate-100': 'divide-slate-100 dark:divide-slate-800'
};

dirs.forEach(d => {
  if (fs.existsSync(d)) {
    walkDir(d, function(filePath) {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        for (const [light, dark] of Object.entries(replacements)) {
          const regex = new RegExp(`\\b${light}\\b(?!\\s+dark:)`, 'g');
          content = content.replace(regex, dark);
        }

        if (content !== original) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`Updated ${filePath}`);
        }
      }
    });
  }
});
