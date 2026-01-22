## What ONE thing does this PR do?

<!-- Describe in ONE sentence. If you need "and", consider splitting the PR. -->

## Which layer does this change?

<!-- Check all that apply -->

- [ ] Interface (app/, app/api/, app/components/)
- [ ] Logic (lib/api/, lib/navigation/, lib/services/)
- [ ] Data (lib/db/)
- [ ] Infrastructure (config, scripts, CI/CD)
- [ ] Documentation only

## Standards Checklist

<!-- All items must be checked before merge -->

### Architecture
- [ ] Each file has a single responsibility
- [ ] No layer violations (UI doesn't import from lib/db)
- [ ] No generic file names (utils.ts, helpers.ts, misc.ts)
- [ ] **No cross-feature imports** (features don't import from other features)
- [ ] **No cross-API imports** (API routes don't import from other API routes)
- [ ] Shared code extracted to `app/components/` or `lib/`

### Naming
- [ ] Functions use verb-noun pattern (createUser, validateEmail)
- [ ] Files have descriptive names (userValidation.ts, not validation.ts)

### Code Quality
- [ ] No hardcoded values (URLs, IPs, secrets)
- [ ] No `any` types (proper TypeScript types defined)
- [ ] No `@ts-ignore` or `@ts-nocheck`

### Patterns
- [ ] Used `api` client instead of raw `fetch()` for internal APIs
- [ ] Used `nav` helpers instead of hardcoded paths
- [ ] Server/client component separation is correct

### Documentation
- [ ] Feature README updated (if applicable)
- [ ] Complex logic has explanatory comments

## How to Test

<!-- Steps to verify this change works -->

1. 
2. 
3. 

## Screenshots

<!-- If UI changes, add before/after screenshots -->

## Related Issues

<!-- Link any related issues: Fixes #123, Related to #456 -->
