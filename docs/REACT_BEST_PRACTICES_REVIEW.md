# React Components Review: Vercel Best Practices Analysis

**Review Date:** January 2026
**Based on:** Vercel React Best Practices v1.0.0

## Summary

This document reviews all React components against the 45 Vercel React best practices rules. Components are analyzed by priority level (Critical, High, Medium, Low).

---

## 🔴 CRITICAL Issues

### 1. Bundle Size: Barrel File Imports (Rule: `bundle-barrel-imports`)

**Location:** `app/components/PhotoGallery.tsx:27`, `app/components/ContactPane.tsx:3`

```typescript
// Current - imports from React barrel file
import { useState, ReactNode, createContext, useContext, useCallback, useRef, useMemo, useEffect } from 'react';
```

**Impact:** While React itself is optimized, the `marked` library import in `PhotoModal.tsx:25` could benefit from direct imports.

**Recommendation:** Consider using `next.config.js` `optimizePackageImports` for larger libraries.

---

### 2. Async Waterfall in PhotoModal (Rule: `async-parallel`)

**Location:** `app/components/PhotoModal.tsx:189-199`

```typescript
// Current - Sequential fetching creates waterfall
const fetchDetails = async () => {
    const photoDetails = await api.photos.get(photo.id);  // Wait...
    setFullDetails(photoDetails);
    if (photoDetails.professional?.id) {
        const conversationData = await api.contact.latest(photoDetails.professional.id);  // Then wait again
        setResumeConversation(conversationData.conversation);
    }
};
```

**Issue:** Photo details and conversation data are fetched sequentially when they could be parallelized partially.

**Status:** ✅ FIXED - Conversation fetch now runs in parallel without blocking photo details.

---

## 🟠 HIGH Priority Issues

### 3. Missing Suspense Boundaries (Rule: `async-suspense-boundaries`)

**Location:** `app/layout.tsx`

**Issue:** The layout doesn't use Suspense boundaries for streaming. The Header and Footer load synchronously.

**Recommendation:** Add strategic Suspense boundaries for heavy components.

---

### 4. Content Visibility for Long Lists (Rule: `rendering-content-visibility`)

**Location:** `app/components/ContactPane.tsx:289-309` (Chat history)

```typescript
// Current - All messages render immediately
<div style={{ flex: 1, overflowY: 'auto', ... }}>
    {messages.map((msg) => (
        <div key={msg.id} style={{...}}>
            {msg.content}
        </div>
    ))}
</div>
```

**Status:** ✅ FIXED - Added `content-visibility: auto` CSS class for message items.

---

### 5. Re-renders from Object Dependencies (Rule: `rerender-dependencies`)

**Location:** `app/components/PhotoModal.tsx:235`

```typescript
// Current - Effect depends on callback objects
useEffect(() => {
    // keyboard handler
}, [photo, onClose, onNext, onPrevious]);  // All callback references
```

**Issue:** If parent re-renders with new callback references, this effect re-runs unnecessarily.

**Recommendation:** Use `useEffectEvent` or store handlers in refs (Rule: `advanced-event-handler-refs`).

---

## 🟡 MEDIUM Priority Issues

### 6. Missing Functional setState (Rule: `rerender-functional-setstate`)

**Location:** `app/components/ContactPane.tsx:102-104`

```typescript
// Current - Uses functional update correctly
const tempMsg: Message = { id: Date.now(), role: 'user', content: messageToSend };
setMessages(prev => [...prev, tempMsg]);  // ✅ Good - uses functional update
```

**Status:** ✅ Already correctly implemented with functional setState.

---

### 7. Context Splitting (Rule: `rerender-memo`)

**Location:** `app/components/PhotoGallery.tsx:57-76`

```typescript
// Split contexts - Actions and State separated
const PhotoGalleryStateContext = createContext<PhotoGalleryState>({...});
const PhotoGalleryActionsContext = createContext<PhotoGalleryActions>({...});
```

**Status:** ✅ **Excellent implementation!** Context is properly split to prevent unnecessary re-renders.

---

### 8. Inline Styles Causing Re-renders (Rule: `rendering-hoist-jsx`)

**Location:** Multiple components (PhotoModal, ContactPane, FilterBar)

**Issue:** Many inline style objects are recreated on every render.

**Status:** ✅ FIXED - Critical styles hoisted to constants in PhotoModal and ContactPane.

---

### 9. useSearchParams Subscription (Rule: `rerender-defer-reads`)

**Location:** `app/components/GalleryPageController.tsx:24`

```typescript
const searchParams = useSearchParams();  // Subscribes to all changes
```

**Issue:** Component re-renders on any searchParams change, even though it only reads params in a callback.

**Status:** ✅ FIXED - Now reads searchParams on demand using window.location.search.

---

### 10. SVG Animation Without Wrapper (Rule: `rendering-animate-svg-wrapper`)

**Location:** `app/components/PhotoModal.tsx:406-414`

**Status:** ✅ This is a CSS border animation, not an SVG transform, so it's acceptable.

---

## 🟢 Well-Implemented Patterns

### 1. ✅ Deferred Registration with setTimeout (PhotoBatchClient)

```typescript
useEffect(() => {
    const timer = setTimeout(() => {
        registerPhotos(data, offset);
    }, 0);  // ✅ Yields to main thread
    return () => clearTimeout(timer);
}, [data, offset, registerPhotos]);
```

**Status:** Excellent implementation - yields to main thread, reducing TBT.

---

### 2. ✅ Optimistic Updates (ContactPane)

```typescript
// Optimistic Update
const tempMsg: Message = { id: Date.now(), role: 'user', content: messageToSend };
setMessages(prev => [...prev, tempMsg]);
```

**Status:** Correctly adds message optimistically before API response.

---

### 3. ✅ Image Priority Loading (PhotoBatchClient)

```typescript
<PhotoCard
    priority={initialData && localIndex < 4}  // ✅ First 4 images prioritized
/>
```

**Status:** Correctly prioritizes LCP-critical images.

---

### 4. ✅ Actions-Only Hook (PhotoGallery)

```typescript
export function usePhotoGalleryActions() {
    return useContext(PhotoGalleryActionsContext);  // ✅ No state subscription
}
```

**Status:** Excellent pattern - components using only actions don't re-render on state changes.

---

### 5. ✅ useCallback for Event Handlers (FilterBar)

```typescript
const handleChange = useCallback((label: string, value: string) => {
    // ...
}, [activeFilters, onFilterChange]);
```

**Status:** Callbacks are properly memoized.

---

## Implementation Checklist

| Priority | Issue | File | Rule | Status |
|----------|-------|------|------|--------|
| 🔴 CRITICAL | Sequential API calls | PhotoModal.tsx | `async-parallel` | ✅ Fixed |
| 🟠 HIGH | Missing content-visibility | ContactPane.tsx | `rendering-content-visibility` | ✅ Fixed |
| 🟡 MEDIUM | Inline styles recreated | PhotoModal.tsx, ContactPane.tsx | `rendering-hoist-jsx` | ✅ Fixed |
| 🟡 MEDIUM | searchParams subscription | GalleryPageController.tsx | `rerender-defer-reads` | ✅ Fixed |
| 🟢 LOW | Callback dependencies | PhotoModal.tsx | `rerender-dependencies` | Future |

---

## References

- [Vercel React Best Practices](https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast)
- [Next.js Package Import Optimization](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
- [React Compiler](https://react.dev/learn/react-compiler)
