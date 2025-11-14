# WOMB Site Testing Checklist

## Desktop Browser Testing

### Chrome
- [ ] Landing page loads correctly
- [ ] Language toggle works
- [ ] Navigation between all pages
- [ ] Event pages display correctly
- [ ] Artist pages display correctly
- [ ] Audio player works (play/pause/seek)
- [ ] Gallery lightbox opens/closes
- [ ] Gallery navigation (prev/next)
- [ ] Keyboard navigation in gallery (arrows, ESC)
- [ ] All external links work

### Firefox
- [ ] All items from Chrome checklist
- [ ] Audio player compatibility
- [ ] CSS rendering correct

### Safari
- [ ] All items from Chrome checklist
- [ ] Audio player compatibility
- [ ] Touch gestures on trackpad

### Edge
- [ ] All items from Chrome checklist

## Mobile Testing

### iOS Safari
- [ ] Responsive layout
- [ ] Touch targets minimum 44px
- [ ] Gallery swipe gestures work
- [ ] Audio player controls accessible
- [ ] Navigation menu works
- [ ] Pinch to zoom disabled where appropriate

### Android Chrome
- [ ] All items from iOS Safari checklist
- [ ] Hardware back button behavior

## Performance Testing

- [ ] Lighthouse score > 90 for Performance
- [ ] Images lazy load correctly
- [ ] No layout shift (CLS < 0.1)
- [ ] First Contentful Paint < 2s
- [ ] Total bundle size < 500KB

## Accessibility Testing

- [ ] Keyboard navigation works throughout
- [ ] Screen reader compatible
- [ ] Color contrast WCAG AA compliant
- [ ] Focus indicators visible
- [ ] Alt text for all images
- [ ] ARIA labels where needed

## Content Testing

- [ ] All events display correctly
- [ ] All artists have profiles
- [ ] Audio files play correctly
- [ ] Images load correctly
- [ ] French translations accurate
- [ ] English translations accurate
- [ ] No broken links

## Audio Protection Testing

- [ ] Right-click disabled on audio player
- [ ] No download button visible
- [ ] Browser dev tools don't easily reveal direct URLs
- [ ] Audio loads via blob URLs

## SEO Testing

- [ ] Meta tags present on all pages
- [ ] Open Graph tags for social sharing
- [ ] Sitemap generated
- [ ] Robots.txt configured
- [ ] Canonical URLs set

## Deployment Testing

- [ ] Build completes without errors
- [ ] All assets load on production
- [ ] GitHub Pages deployment successful
- [ ] Custom domain works (if configured)
- [ ] HTTPS enabled