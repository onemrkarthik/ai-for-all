#!/usr/bin/env tsx
/**
 * check-no-houzz-code.ts
 * 
 * Build-time check to ensure no code from the Houzz or IVY ecosystems is included.
 * This script scans the codebase for patterns that indicate Houzz or IVY-specific code.
 * 
 * Exit codes:
 *   0 - No forbidden ecosystem code found
 *   1 - Forbidden ecosystem code detected
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = join(__dirname, '..');

interface Violation {
  file: string;
  line: number;
  match: string;
  pattern: string;
  description: string;
}

// Patterns that indicate Houzz or IVY ecosystem code
// Each pattern includes a description and optional allowlist for false positives
const FORBIDDEN_PATTERNS = [
  // ============== HOUZZ PATTERNS ==============
  {
    pattern: /@houzz\//,
    description: 'Houzz npm package import',
    // Files/patterns to ignore (e.g., this check script itself)
    allowlist: [/check-no-houzz-code\.ts$/],
  },
  {
    pattern: /from\s+['"]houzz-/,
    description: 'Houzz npm package import (houzz-* prefix)',
    allowlist: [/check-no-houzz-code\.ts$/],
  },
  {
    pattern: /require\s*\(\s*['"]@houzz\//,
    description: 'Houzz npm package require',
    allowlist: [/check-no-houzz-code\.ts$/],
  },
  {
    pattern: /require\s*\(\s*['"]houzz-/,
    description: 'Houzz npm package require (houzz-* prefix)',
    allowlist: [/check-no-houzz-code\.ts$/],
  },
  {
    // Match Houzz URLs but not project references like "houzz-for-all"
    pattern: /(?:https?:\/\/)?(?:www\.)?(?:api\.|cdn\.|static\.)?houzz\.com/,
    description: 'Houzz domain reference',
    allowlist: [
      /check-no-houzz-code\.ts$/,
      /\.claude\/settings\.local\.json$/, // Local IDE settings, not committed
    ],
  },
  {
    // Match Houzz internal package patterns (hz- prefix with package-like naming)
    pattern: /['"]hz-[a-z]+-[a-z]+['"]/,
    description: 'Houzz internal package reference (hz-* pattern)',
    allowlist: [/check-no-houzz-code\.ts$/],
  },
  {
    // Houzz-specific global namespace
    pattern: /\bHouzz\.(Config|Utils|Analytics|API|Services)\b/,
    description: 'Houzz global namespace usage',
    allowlist: [/check-no-houzz-code\.ts$/],
  },
  {
    // Houzz-specific React components from their library
    pattern: /from\s+['"]@houzz\/|<Hz[A-Z][a-zA-Z]+/,
    description: 'Houzz React component (Hz* prefix)',
    allowlist: [/check-no-houzz-code\.ts$/],
  },

  // ============== IVY PATTERNS ==============
  {
    pattern: /@ivy\//,
    description: 'IVY npm package import',
    allowlist: [/check-no-houzz-code\.ts$/],
  },
  {
    pattern: /@ivy-/,
    description: 'IVY npm scoped package import (@ivy-* prefix)',
    allowlist: [/check-no-houzz-code\.ts$/],
  },
  {
    pattern: /from\s+['"]ivy-/,
    description: 'IVY npm package import (ivy-* prefix)',
    allowlist: [/check-no-houzz-code\.ts$/],
  },
  {
    pattern: /require\s*\(\s*['"]@ivy\//,
    description: 'IVY npm package require',
    allowlist: [/check-no-houzz-code\.ts$/],
  },
  {
    pattern: /require\s*\(\s*['"]@ivy-/,
    description: 'IVY npm scoped package require (@ivy-* prefix)',
    allowlist: [/check-no-houzz-code\.ts$/],
  },
  {
    pattern: /require\s*\(\s*['"]ivy-/,
    description: 'IVY npm package require (ivy-* prefix)',
    allowlist: [/check-no-houzz-code\.ts$/],
  },
  {
    // Match IVY-specific domains
    pattern: /(?:https?:\/\/)?(?:www\.)?(?:api\.|cdn\.|static\.)?ivy\.co/,
    description: 'IVY domain reference',
    allowlist: [/check-no-houzz-code\.ts$/],
  },
  {
    // IVY-specific global namespace
    pattern: /\bIvy\.(Config|Utils|Analytics|API|Services)\b/,
    description: 'IVY global namespace usage',
    allowlist: [/check-no-houzz-code\.ts$/],
  },
  {
    // IVY-specific React components
    pattern: /<Ivy[A-Z][a-zA-Z]+/,
    description: 'IVY React component (Ivy* prefix)',
    allowlist: [/check-no-houzz-code\.ts$/],
  },
];

// File extensions to scan
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'];

// Directories to exclude from scanning
const EXCLUDED_DIRS = ['node_modules', '.next', '.git', 'dist', 'build', 'out'];

/**
 * Get list of files to scan using git ls-files (respects .gitignore)
 */
function getFilesToScan(): string[] {
  try {
    const output = execSync('git ls-files', { 
      cwd: ROOT_DIR, 
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });
    
    return output
      .split('\n')
      .filter(file => {
        if (!file) return false;
        
        // Check extension
        const hasValidExt = SCAN_EXTENSIONS.some(ext => file.endsWith(ext));
        if (!hasValidExt) return false;
        
        // Check excluded directories
        const isExcluded = EXCLUDED_DIRS.some(dir => file.startsWith(dir + '/'));
        return !isExcluded;
      });
  } catch {
    console.error('Error: Failed to get file list. Are you in a git repository?');
    process.exit(1);
  }
}

/**
 * Check if a file path matches any allowlist pattern
 */
function isAllowlisted(filePath: string, allowlist: RegExp[]): boolean {
  return allowlist.some(pattern => pattern.test(filePath));
}

/**
 * Scan a file for forbidden patterns
 */
function scanFile(filePath: string): Violation[] {
  const violations: Violation[] = [];
  const fullPath = join(ROOT_DIR, filePath);
  
  if (!existsSync(fullPath)) {
    return violations;
  }
  
  let content: string;
  try {
    content = readFileSync(fullPath, 'utf-8');
  } catch {
    console.warn(`Warning: Could not read file ${filePath}`);
    return violations;
  }
  
  const lines = content.split('\n');
  
  for (const { pattern, description, allowlist } of FORBIDDEN_PATTERNS) {
    // Skip if file is allowlisted for this pattern
    if (allowlist && isAllowlisted(filePath, allowlist)) {
      continue;
    }
    
    lines.forEach((line, index) => {
      const match = line.match(pattern);
      if (match) {
        violations.push({
          file: filePath,
          line: index + 1,
          match: match[0],
          pattern: pattern.source,
          description,
        });
      }
    });
  }
  
  return violations;
}

/**
 * Check package.json for Houzz or IVY dependencies
 */
function checkPackageJson(): Violation[] {
  const violations: Violation[] = [];
  const pkgPath = join(ROOT_DIR, 'package.json');
  
  if (!existsSync(pkgPath)) {
    return violations;
  }
  
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
      ...pkg.optionalDependencies,
    };
    
    for (const depName of Object.keys(allDeps)) {
      // Check for Houzz packages
      if (depName.startsWith('@houzz/') || depName.startsWith('houzz-')) {
        violations.push({
          file: 'package.json',
          line: 0,
          match: depName,
          pattern: 'package dependency',
          description: `Houzz package dependency: ${depName}`,
        });
      }
      // Check for IVY packages
      if (depName.startsWith('@ivy/') || depName.startsWith('@ivy-') || depName.startsWith('ivy-')) {
        violations.push({
          file: 'package.json',
          line: 0,
          match: depName,
          pattern: 'package dependency',
          description: `IVY package dependency: ${depName}`,
        });
      }
    }
  } catch {
    console.warn('Warning: Could not parse package.json');
  }
  
  return violations;
}

/**
 * Main execution
 */
function main(): void {
  console.log('🔍 Checking for Houzz/IVY ecosystem code...\n');
  
  const allViolations: Violation[] = [];
  
  // Check package.json first
  allViolations.push(...checkPackageJson());
  
  // Get and scan all files
  const files = getFilesToScan();
  console.log(`Scanning ${files.length} files...`);
  
  for (const file of files) {
    const violations = scanFile(file);
    allViolations.push(...violations);
  }
  
  if (allViolations.length === 0) {
    console.log('\n✅ No Houzz/IVY ecosystem code detected.\n');
    process.exit(0);
  }
  
  // Report violations
  console.error('\n❌ Houzz/IVY ecosystem code detected!\n');
  console.error('The following violations were found:\n');
  
  for (const v of allViolations) {
    console.error(`  📄 ${v.file}${v.line ? `:${v.line}` : ''}`);
    console.error(`     Pattern: ${v.description}`);
    console.error(`     Match: "${v.match}"`);
    console.error('');
  }
  
  console.error(`Total violations: ${allViolations.length}\n`);
  console.error('Please remove all Houzz/IVY ecosystem code before building.\n');
  
  process.exit(1);
}

main();
