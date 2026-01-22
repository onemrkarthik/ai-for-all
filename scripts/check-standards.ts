#!/usr/bin/env ts-node

/**
 * Standards Enforcement Script
 * 
 * Checks codebase for violations of team standards.
 * Run with: npm run check:standards
 */

import * as fs from 'fs';
import * as path from 'path';

// ==========================================
// CONFIGURATION
// ==========================================

const CONFIG = {
  // Directories to scan
  srcDirs: ['app', 'lib'],
  
  // Forbidden generic file names
  forbiddenFileNames: [
    'utils.ts',
    'utils.tsx',
    'helpers.ts',
    'helpers.tsx',
    'misc.ts',
    'misc.tsx',
    'common.ts',
    'common.tsx',
    'index.ts', // Allowed only in specific cases
  ],
  
  // Allowed index.ts locations (re-exports are OK here)
  allowedIndexLocations: [
    'lib/api/index.ts',
    'lib/navigation/index.ts',
    'lib/db/index.ts',
    'lib/services/index.ts',
  ],
  
  // Patterns that indicate layer violations
  layerViolations: {
    // Files in app/ should not import from lib/db directly
    interface: {
      pattern: /^app\//,
      forbidden: [
        /from\s+['"]@?\/lib\/db/,
        /from\s+['"]\.\.\/.*lib\/db/,
        /import.*better-sqlite3/,
      ],
      message: 'Interface layer (app/) cannot import from data layer (lib/db) directly',
    },
  },
  
  // Required files in feature folders
  requiredFeatureFiles: ['README.md'],
  
  // Feature folders (subdirectories of app/ that aren't special Next.js folders)
  excludedFromFeatureCheck: ['api', 'components', 'styles'],
  
  // Feature directories that should be isolated from each other
  featureDirs: ['professionals', 'photos', 'styles', 'contact'],
  
  // Directories that CAN be imported by features (shared code)
  sharedDirs: ['app/components', 'lib'],
  
  // Function naming patterns (must start with verb)
  validFunctionVerbs: [
    'get', 'set', 'create', 'update', 'delete', 'remove',
    'fetch', 'load', 'save', 'store',
    'validate', 'check', 'verify', 'ensure',
    'format', 'parse', 'transform', 'convert',
    'calculate', 'compute', 'count',
    'send', 'receive', 'emit', 'dispatch',
    'init', 'initialize', 'setup', 'configure',
    'handle', 'process', 'execute', 'run',
    'render', 'display', 'show', 'hide',
    'enable', 'disable', 'toggle',
    'add', 'append', 'insert', 'push',
    'find', 'search', 'filter', 'sort',
    'open', 'close', 'start', 'stop',
    'build', 'make', 'generate', 'produce',
    'use', // React hooks
    'is', 'has', 'can', 'should', // Boolean checks
  ],
};

// ==========================================
// TYPES
// ==========================================

interface Violation {
  file: string;
  line?: number;
  rule: string;
  message: string;
  severity: 'error' | 'warning';
}

// ==========================================
// UTILITY FUNCTIONS
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
      // Skip node_modules and hidden directories
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

function readFileContent(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

// ==========================================
// CHECK FUNCTIONS
// ==========================================

function checkForbiddenFileNames(files: string[]): Violation[] {
  const violations: Violation[] = [];
  
  for (const file of files) {
    const fileName = path.basename(file);
    
    // Check if it's a forbidden name
    if (CONFIG.forbiddenFileNames.includes(fileName)) {
      // Allow index.ts in specific locations
      if (fileName === 'index.ts' && CONFIG.allowedIndexLocations.includes(file)) {
        continue;
      }
      
      // Special case: index.ts is sometimes OK
      if (fileName === 'index.ts') {
        continue; // Skip index.ts for now, could add stricter rules
      }
      
      violations.push({
        file,
        rule: 'no-generic-names',
        message: `Generic file name "${fileName}" is not allowed. Use a descriptive name like "priceCalculation.ts" or "userValidation.ts"`,
        severity: 'error',
      });
    }
  }
  
  return violations;
}

function checkLayerViolations(files: string[]): Violation[] {
  const violations: Violation[] = [];
  
  for (const file of files) {
    const content = readFileContent(file);
    const lines = content.split('\n');
    
    // Check interface layer violations
    const { interface: interfaceRules } = CONFIG.layerViolations;
    
    if (interfaceRules.pattern.test(file)) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        for (const forbidden of interfaceRules.forbidden) {
          if (forbidden.test(line)) {
            violations.push({
              file,
              line: i + 1,
              rule: 'layer-violation',
              message: interfaceRules.message,
              severity: 'error',
            });
          }
        }
      }
    }
  }
  
  return violations;
}

function checkFeatureReadmes(): Violation[] {
  const violations: Violation[] = [];
  
  if (!fs.existsSync('app')) {
    return violations;
  }
  
  const appContents = fs.readdirSync('app');
  
  for (const item of appContents) {
    const fullPath = path.join('app', item);
    
    // Skip if not a directory or if it's an excluded folder
    if (!fs.statSync(fullPath).isDirectory()) {
      continue;
    }
    if (CONFIG.excludedFromFeatureCheck.includes(item)) {
      continue;
    }
    // Skip Next.js special folders
    if (item.startsWith('(') || item.startsWith('[')) {
      continue;
    }
    
    // Check for README.md
    const readmePath = path.join(fullPath, 'README.md');
    if (!fs.existsSync(readmePath)) {
      violations.push({
        file: fullPath,
        rule: 'missing-readme',
        message: `Feature folder "${item}" is missing README.md`,
        severity: 'warning',
      });
    }
  }
  
  return violations;
}

function checkHardcodedValues(files: string[]): Violation[] {
  const violations: Violation[] = [];
  
  // URLs that are legitimate and should not trigger warnings
  const allowedUrlPatterns = [
    /schema\.org/,           // JSON-LD structured data (required)
    /xmlns/,                 // XML namespace declarations (in data URIs)
    /unsplash\.com/,         // Unsplash CDN (external image service)
    /images\.unsplash\.com/, // Unsplash CDN images
    /example\.com/,          // Placeholder URLs
    /w3\.org/,               // W3C standards URLs
  ];
  
  const hardcodedPatterns = [
    {
      pattern: /['"`]https?:\/\/(?!localhost)[^'"`]+['"`]/g,
      message: 'Hardcoded URL detected. Use environment variables or config.',
    },
    {
      pattern: /['"`]\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}['"`]/g,
      message: 'Hardcoded IP address detected. Use environment variables or config.',
    },
    {
      pattern: /(?:api[_-]?key|apikey|secret|password|token)\s*[:=]\s*['"`][^'"`]+['"`]/gi,
      message: 'Possible hardcoded secret detected. Use environment variables.',
    },
  ];
  
  for (const file of files) {
    // Skip config files and env examples
    if (file.includes('.env') || file.includes('config')) {
      continue;
    }
    
    const content = readFileContent(file);
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip comments
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        continue;
      }
      
      for (const { pattern, message } of hardcodedPatterns) {
        if (pattern.test(line)) {
          // Check if this is an allowed URL pattern
          const isAllowed = allowedUrlPatterns.some(allowed => allowed.test(line));
          
          if (!isAllowed) {
            violations.push({
              file,
              line: i + 1,
              rule: 'no-hardcoded-values',
              message,
              severity: 'warning',
            });
          }
        }
        // Reset regex lastIndex
        pattern.lastIndex = 0;
      }
    }
  }
  
  return violations;
}

function checkTypeSafety(files: string[]): Violation[] {
  const violations: Violation[] = [];
  
  const patterns = [
    {
      pattern: /:\s*any\b/g,
      message: 'Explicit "any" type used. Define a proper type.',
    },
    {
      pattern: /as\s+any\b/g,
      message: 'Type assertion to "any" used. Define a proper type.',
    },
    {
      pattern: /@ts-ignore/g,
      message: '@ts-ignore used. Fix the type error instead.',
    },
    {
      pattern: /@ts-nocheck/g,
      message: '@ts-nocheck used. Fix type errors instead of disabling checks.',
    },
  ];
  
  for (const file of files) {
    const content = readFileContent(file);
    const lines = content.split('\n');
    
    let inBlockComment = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Track block comments
      if (trimmedLine.startsWith('/*') || trimmedLine.startsWith('/**')) {
        inBlockComment = true;
      }
      if (trimmedLine.includes('*/')) {
        inBlockComment = false;
        continue; // Skip the closing line of block comments
      }
      
      // Skip comments entirely
      if (inBlockComment || trimmedLine.startsWith('//') || trimmedLine.startsWith('*')) {
        continue;
      }
      
      for (const { pattern, message } of patterns) {
        if (pattern.test(line)) {
          violations.push({
            file,
            line: i + 1,
            rule: 'type-safety',
            message,
            severity: 'warning',
          });
        }
        pattern.lastIndex = 0;
      }
    }
  }
  
  return violations;
}

function checkRawFetchUsage(files: string[]): Violation[] {
  const violations: Violation[] = [];
  
  for (const file of files) {
    // Only check app/ directory (interface layer)
    if (!file.startsWith('app/')) {
      continue;
    }
    // Skip API routes (they don't need the client)
    if (file.includes('app/api/')) {
      continue;
    }
    
    const content = readFileContent(file);
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for raw fetch to internal API
      if (/fetch\s*\(\s*['"`]\/api\//.test(line)) {
        violations.push({
          file,
          line: i + 1,
          rule: 'use-api-client',
          message: 'Use typed API client (import { api } from "@/lib/api") instead of raw fetch',
          severity: 'warning',
        });
      }
    }
  }
  
  return violations;
}

function checkCrossFeatureImports(files: string[]): Violation[] {
  const violations: Violation[] = [];
  
  // Get all feature directories
  const featureDirs = CONFIG.featureDirs;
  
  for (const file of files) {
    // Only check files within feature directories
    const fileFeature = featureDirs.find(f => file.includes(`app/${f}/`) || file.includes(`app/api/${f}/`));
    
    if (!fileFeature) {
      continue; // Not in a feature directory
    }
    
    const content = readFileContent(file);
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip non-import lines
      if (!line.includes('import') && !line.includes('require')) {
        continue;
      }
      
      // Check if importing from another feature
      for (const otherFeature of featureDirs) {
        if (otherFeature === fileFeature) {
          continue; // Same feature is OK
        }
        
        // Check for direct imports from other features
        const patterns = [
          new RegExp(`from\\s+['"].*app/${otherFeature}/`),
          new RegExp(`from\\s+['"].*app/api/${otherFeature}/`),
          new RegExp(`from\\s+['"]@/app/${otherFeature}/`),
          new RegExp(`from\\s+['"]@/app/api/${otherFeature}/`),
          new RegExp(`from\\s+['"]\\.\\./+${otherFeature}/`),
          new RegExp(`from\\s+['"]\\.\\./+.*/${otherFeature}/`),
        ];
        
        for (const pattern of patterns) {
          if (pattern.test(line)) {
            violations.push({
              file,
              line: i + 1,
              rule: 'no-cross-feature-imports',
              message: `Feature "${fileFeature}" cannot import from feature "${otherFeature}". Extract shared code to app/components/ or lib/`,
              severity: 'error',
            });
            break;
          }
        }
      }
    }
  }
  
  return violations;
}

function checkApiRouteIsolation(files: string[]): Violation[] {
  const violations: Violation[] = [];
  
  for (const file of files) {
    // Only check API routes
    if (!file.includes('app/api/')) {
      continue;
    }
    
    const content = readFileContent(file);
    const lines = content.split('\n');
    
    // Determine which API feature this file belongs to
    const apiFeatureMatch = file.match(/app\/api\/([^/]+)\//);
    const fileFeature = apiFeatureMatch ? apiFeatureMatch[1] : null;
    
    if (!fileFeature) {
      continue;
    }
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (!line.includes('import') && !line.includes('require')) {
        continue;
      }
      
      // Check for imports from other API routes
      const otherApiPattern = /from\s+['"].*app\/api\/([^/'"]+)/;
      const match = line.match(otherApiPattern);
      
      if (match && match[1] !== fileFeature) {
        violations.push({
          file,
          line: i + 1,
          rule: 'no-cross-api-imports',
          message: `API route "${fileFeature}" cannot import from API route "${match[1]}". Extract shared code to lib/services/`,
          severity: 'error',
        });
      }
    }
  }
  
  return violations;
}

function checkHardcodedPaths(files: string[]): Violation[] {
  const violations: Violation[] = [];
  
  for (const file of files) {
    // Only check app/ directory
    if (!file.startsWith('app/')) {
      continue;
    }
    
    const content = readFileContent(file);
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for hardcoded href paths (but allow external links and anchors)
      if (/href\s*=\s*['"`]\/(?!api)[a-z]/.test(line)) {
        // Skip if it's using nav helper
        if (line.includes('nav.')) {
          continue;
        }
        
        violations.push({
          file,
          line: i + 1,
          rule: 'use-nav-helpers',
          message: 'Use typed navigation helpers (import { nav } from "@/lib/navigation") instead of hardcoded paths',
          severity: 'warning',
        });
      }
    }
  }
  
  return violations;
}

// ==========================================
// MAIN
// ==========================================

function main(): void {
  console.log('🔍 Checking code standards...\n');
  
  const allViolations: Violation[] = [];
  
  // Collect all files
  const files: string[] = [];
  for (const dir of CONFIG.srcDirs) {
    files.push(...getAllFiles(dir));
  }
  
  console.log(`   Scanning ${files.length} files...\n`);
  
  // Run all checks
  const checks = [
    { name: 'Generic file names', fn: () => checkForbiddenFileNames(files) },
    { name: 'Layer violations', fn: () => checkLayerViolations(files) },
    { name: 'Cross-feature imports', fn: () => checkCrossFeatureImports(files) },
    { name: 'API route isolation', fn: () => checkApiRouteIsolation(files) },
    { name: 'Feature READMEs', fn: () => checkFeatureReadmes() },
    { name: 'Hardcoded values', fn: () => checkHardcodedValues(files) },
    { name: 'Type safety', fn: () => checkTypeSafety(files) },
    { name: 'Raw fetch usage', fn: () => checkRawFetchUsage(files) },
    { name: 'Hardcoded paths', fn: () => checkHardcodedPaths(files) },
  ];
  
  for (const check of checks) {
    const violations = check.fn();
    allViolations.push(...violations);
    
    const errorCount = violations.filter(v => v.severity === 'error').length;
    const warnCount = violations.filter(v => v.severity === 'warning').length;
    
    if (violations.length === 0) {
      console.log(`   ✅ ${check.name}`);
    } else {
      console.log(`   ❌ ${check.name} (${errorCount} errors, ${warnCount} warnings)`);
    }
  }
  
  // Report violations
  console.log('\n' + '='.repeat(60) + '\n');
  
  const errors = allViolations.filter(v => v.severity === 'error');
  const warnings = allViolations.filter(v => v.severity === 'warning');
  
  if (errors.length > 0) {
    console.log('❌ ERRORS:\n');
    for (const v of errors) {
      const location = v.line ? `${v.file}:${v.line}` : v.file;
      console.log(`   [${v.rule}] ${location}`);
      console.log(`   ${v.message}\n`);
    }
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    for (const v of warnings) {
      const location = v.line ? `${v.file}:${v.line}` : v.file;
      console.log(`   [${v.rule}] ${location}`);
      console.log(`   ${v.message}\n`);
    }
  }
  
  // Summary
  console.log('='.repeat(60));
  console.log(`\n📊 Summary: ${errors.length} errors, ${warnings.length} warnings\n`);
  
  if (errors.length > 0) {
    console.log('❌ Standards check FAILED\n');
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log('⚠️  Standards check PASSED with warnings\n');
    process.exit(0);
  } else {
    console.log('✅ All standards checks PASSED\n');
    process.exit(0);
  }
}

main();
