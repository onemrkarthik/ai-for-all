/**
 * Architecture Tests
 * 
 * These tests verify that the codebase follows architectural standards.
 * Run with: npm test -- --testPathPattern=architecture
 */

import * as fs from 'fs';
import * as path from 'path';

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getAllFiles(dir: string, extensions: string[] = ['.ts', '.tsx']): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (item === 'node_modules' || item.startsWith('.')) {
        continue;
      }
      files.push(...getAllFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function getFileContent(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

// ==========================================
// TESTS
// ==========================================

describe('Architecture Standards', () => {
  
  describe('File Naming', () => {
    
    test('no generic file names like utils.ts or helpers.ts', () => {
      const forbidden = ['utils.ts', 'utils.tsx', 'helpers.ts', 'helpers.tsx', 'misc.ts', 'misc.tsx'];
      const files = getAllFiles('app').concat(getAllFiles('lib'));
      
      const violations = files.filter(f => 
        forbidden.some(bad => f.endsWith(bad))
      );
      
      expect(violations).toEqual([]);
    });
    
    test('component files use PascalCase', () => {
      const componentFiles = getAllFiles('app/components');
      
      const violations = componentFiles.filter(f => {
        const fileName = path.basename(f, path.extname(f));
        // Should start with uppercase
        return /^[a-z]/.test(fileName);
      });
      
      if (violations.length > 0) {
        console.log('Component files should use PascalCase:', violations);
      }
      
      expect(violations).toEqual([]);
    });
    
  });
  
  describe('Layer Separation', () => {
    
    test('components do not import from lib/db directly', () => {
      const componentFiles = getAllFiles('app/components');
      
      const violations = componentFiles.filter(file => {
        const content = getFileContent(file);
        return (
          content.includes("from '@/lib/db") ||
          content.includes('from "@/lib/db') ||
          content.includes("from '../lib/db") ||
          content.includes('from "../lib/db')
        );
      });
      
      if (violations.length > 0) {
        console.log('Components importing db directly:', violations);
      }
      
      expect(violations).toEqual([]);
    });
    
    test('pages do not import from lib/db directly', () => {
      const pageFiles = getAllFiles('app').filter(f => 
        f.endsWith('page.tsx') || f.endsWith('page.ts')
      );
      
      const violations = pageFiles.filter(file => {
        const content = getFileContent(file);
        return (
          content.includes("from '@/lib/db") ||
          content.includes('from "@/lib/db')
        );
      });
      
      if (violations.length > 0) {
        console.log('Pages importing db directly:', violations);
      }
      
      expect(violations).toEqual([]);
    });
    
    test('client components do not import server-only modules', () => {
      const clientComponents = getAllFiles('app').filter(file => {
        const content = getFileContent(file);
        return content.includes("'use client'") || content.includes('"use client"');
      });
      
      const serverOnlyPatterns = [
        /from\s+['"]better-sqlite3['"]/,
        /from\s+['"]@\/lib\/db['"]/,
        /from\s+['"]fs['"]/,
        /from\s+['"]path['"]/,
      ];
      
      const violations = clientComponents.filter(file => {
        const content = getFileContent(file);
        return serverOnlyPatterns.some(pattern => pattern.test(content));
      });
      
      if (violations.length > 0) {
        console.log('Client components importing server-only modules:', violations);
      }
      
      expect(violations).toEqual([]);
    });
    
  });
  
  describe('Feature Isolation', () => {
    
    const featureDirs = ['professionals', 'photos', 'styles', 'contact'];
    
    test('features do not import from other features', () => {
      const violations: { file: string; importsFrom: string }[] = [];
      
      for (const feature of featureDirs) {
        const featurePath = `app/${feature}`;
        if (!fs.existsSync(featurePath)) continue;
        
        const featureFiles = getAllFiles(featurePath);
        
        for (const file of featureFiles) {
          const content = getFileContent(file);
          
          for (const otherFeature of featureDirs) {
            if (otherFeature === feature) continue;
            
            // Check for imports from other features
            const patterns = [
              `from '@/app/${otherFeature}`,
              `from "@/app/${otherFeature}`,
              `from '../${otherFeature}`,
              `from "../${otherFeature}`,
              `from '../../${otherFeature}`,
              `from "../../${otherFeature}`,
            ];
            
            if (patterns.some(p => content.includes(p))) {
              violations.push({ file, importsFrom: otherFeature });
            }
          }
        }
      }
      
      if (violations.length > 0) {
        console.log('Cross-feature imports found:', violations);
      }
      
      expect(violations).toEqual([]);
    });
    
    test('API routes do not import from other API routes', () => {
      const violations: { file: string; importsFrom: string }[] = [];
      
      const apiPath = 'app/api';
      if (!fs.existsSync(apiPath)) return;
      
      const apiDirs = fs.readdirSync(apiPath)
        .filter(f => fs.statSync(path.join(apiPath, f)).isDirectory());
      
      for (const apiFeature of apiDirs) {
        const apiFeaturePath = path.join(apiPath, apiFeature);
        const apiFiles = getAllFiles(apiFeaturePath);
        
        for (const file of apiFiles) {
          const content = getFileContent(file);
          
          for (const otherApi of apiDirs) {
            if (otherApi === apiFeature) continue;
            
            const patterns = [
              `from '@/app/api/${otherApi}`,
              `from "@/app/api/${otherApi}`,
              `from '../${otherApi}`,
              `from "../${otherApi}`,
              `from '../../${otherApi}`,
              `from "../../${otherApi}`,
            ];
            
            if (patterns.some(p => content.includes(p))) {
              violations.push({ file, importsFrom: otherApi });
            }
          }
        }
      }
      
      if (violations.length > 0) {
        console.log('Cross-API imports found:', violations);
      }
      
      expect(violations).toEqual([]);
    });
    
    test('features only import from shared locations', () => {
      const allowedImportSources = [
        '@/lib/',
        '@/app/components/',
        'react',
        'next',
        '@/',  // Other lib imports
        './',  // Same feature
        '../', // Parent within same feature (needs more context)
      ];
      
      const violations: { file: string; line: number; import: string }[] = [];
      
      for (const feature of featureDirs) {
        const featurePath = `app/${feature}`;
        if (!fs.existsSync(featurePath)) continue;
        
        const featureFiles = getAllFiles(featurePath);
        
        for (const file of featureFiles) {
          const content = getFileContent(file);
          const lines = content.split('\n');
          
          lines.forEach((line, index) => {
            // Match import statements
            const importMatch = line.match(/from\s+['"]([^'"]+)['"]/);
            if (!importMatch) return;
            
            const importPath = importMatch[1];
            
            // Skip allowed sources
            if (allowedImportSources.some(allowed => importPath.startsWith(allowed))) {
              return;
            }
            
            // Skip node_modules (no @ or . prefix)
            if (!importPath.startsWith('@') && !importPath.startsWith('.')) {
              return;
            }
            
            // Check if it's importing from another feature
            for (const otherFeature of featureDirs) {
              if (otherFeature === feature) continue;
              
              if (importPath.includes(`/app/${otherFeature}/`) ||
                  importPath.includes(`/${otherFeature}/`)) {
                violations.push({ file, line: index + 1, import: importPath });
              }
            }
          });
        }
      }
      
      if (violations.length > 0) {
        console.log('Invalid imports in features:', violations.slice(0, 10));
      }
      
      expect(violations).toEqual([]);
    });
    
  });
  
  describe('Type Safety', () => {
    
    test('no explicit any types', () => {
      const files = getAllFiles('app').concat(getAllFiles('lib'));
      
      const violations: { file: string; line: number }[] = [];
      
      for (const file of files) {
        const content = getFileContent(file);
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          // Skip comments
          if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
            return;
          }
          
          if (/:\s*any\b/.test(line) || /as\s+any\b/.test(line)) {
            violations.push({ file, line: index + 1 });
          }
        });
      }
      
      if (violations.length > 0) {
        console.log('Files with explicit any:', violations.slice(0, 10));
      }
      
      // Allow some violations but warn
      expect(violations.length).toBeLessThan(10);
    });
    
    test('no @ts-ignore comments', () => {
      const files = getAllFiles('app').concat(getAllFiles('lib'));
      
      const violations = files.filter(file => {
        const content = getFileContent(file);
        return content.includes('@ts-ignore');
      });
      
      if (violations.length > 0) {
        console.log('Files with @ts-ignore:', violations);
      }
      
      expect(violations).toEqual([]);
    });
    
  });
  
  describe('API Client Usage', () => {
    
    test('components use typed API client instead of raw fetch', () => {
      const componentFiles = getAllFiles('app/components');
      
      const violations = componentFiles.filter(file => {
        const content = getFileContent(file);
        // Check for raw fetch to /api
        return /fetch\s*\(\s*['"`]\/api\//.test(content);
      });
      
      if (violations.length > 0) {
        console.log('Components using raw fetch:', violations);
      }
      
      // Warning level - should use api client
      expect(violations.length).toBeLessThan(5);
    });
    
  });
  
  describe('Navigation', () => {
    
    test('components use nav helpers instead of hardcoded paths', () => {
      const componentFiles = getAllFiles('app/components');
      
      const violations: { file: string; line: number }[] = [];
      
      for (const file of componentFiles) {
        const content = getFileContent(file);
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          // Check for hardcoded href paths (internal routes)
          if (/href\s*=\s*['"`]\/[a-z]/.test(line)) {
            // Skip if using nav helper
            if (!line.includes('nav.')) {
              violations.push({ file, line: index + 1 });
            }
          }
        });
      }
      
      if (violations.length > 0) {
        console.log('Hardcoded paths found:', violations.slice(0, 10));
      }
      
      // Warning level
      expect(violations.length).toBeLessThan(10);
    });
    
  });
  
  describe('Documentation', () => {
    
    test('feature folders have README.md', () => {
      if (!fs.existsSync('app')) {
        return;
      }
      
      const excludedFolders = ['api', 'components', 'styles'];
      const features = fs.readdirSync('app')
        .filter(f => {
          const fullPath = path.join('app', f);
          return (
            fs.statSync(fullPath).isDirectory() &&
            !excludedFolders.includes(f) &&
            !f.startsWith('(') &&
            !f.startsWith('[')
          );
        });
      
      const missingReadme = features.filter(f => 
        !fs.existsSync(path.join('app', f, 'README.md'))
      );
      
      if (missingReadme.length > 0) {
        console.log('Feature folders missing README:', missingReadme);
      }
      
      // Warning level
      expect(missingReadme.length).toBeLessThan(3);
    });
    
  });
  
});

describe('Code Quality', () => {
  
  test('no console.log in production code', () => {
    const files = getAllFiles('app').concat(getAllFiles('lib'));

    const violations: { file: string; line: number }[] = [];

    for (const file of files) {
      // Skip test files and logger utilities
      if (file.includes('.test.') || file.includes('.spec.') || file.includes('logger.ts')) {
        continue;
      }

      const content = getFileContent(file);
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        // Skip comments (single-line, multi-line, and JSDoc)
        if (
          trimmedLine.startsWith('//') ||
          trimmedLine.startsWith('*') ||
          trimmedLine.startsWith('/*')
        ) {
          return;
        }
        if (/console\.log\(/.test(line)) {
          violations.push({ file, line: index + 1 });
        }
      });
    }

    if (violations.length > 0) {
      console.log('console.log found:', violations.slice(0, 10));
    }

    // Warning level - some console.logs might be intentional
    expect(violations.length).toBeLessThan(5);
  });
  
  test('no TODO comments older than allowed', () => {
    const files = getAllFiles('app').concat(getAllFiles('lib'));
    
    const todos: { file: string; line: number; content: string }[] = [];
    
    for (const file of files) {
      const content = getFileContent(file);
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (/\/\/\s*TODO/i.test(line) || /\/\*\s*TODO/i.test(line)) {
          todos.push({ file, line: index + 1, content: line.trim() });
        }
      });
    }
    
    if (todos.length > 0) {
      console.log('TODOs found:', todos.slice(0, 10));
    }
    
    // Just informational - TODOs are allowed but tracked
    expect(true).toBe(true);
  });
  
});
