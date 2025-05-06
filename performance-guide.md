# Website Performance Testing Guide for Lamp Timess

## Browser Developer Tools

### Chrome DevTools Performance Panel
1. Open your website in Chrome
2. Press F12 or right-click and select "Inspect"
3. Go to the "Performance" tab
4. Click the record button (circle) and interact with your site
5. Stop recording and analyze the results

Key metrics to look for:
- First Paint (FP)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)

### Network Panel
1. Open DevTools and go to the "Network" tab
2. Reload your page to see all network requests
3. Look at the waterfall chart to identify slow-loading resources
4. Check the bottom status bar for total requests, transferred data, and load time

## Web Performance Testing Tools

### Lighthouse (Built into Chrome)
1. Open Chrome DevTools
2. Click on the "Lighthouse" tab
3. Select the categories you want to analyze (Performance, Accessibility, etc.)
4. Click "Generate report"

Lighthouse provides scores and specific recommendations for improvement.

### PageSpeed Insights
1. Visit [PageSpeed Insights](https://pagespeed.web.dev/)
2. Enter your website URL
3. Review both mobile and desktop performance scores

### WebPageTest
1. Visit [WebPageTest](https://www.webpagetest.org/)
2. Enter your website URL
3. Select test location and browser
4. Run the test for detailed performance metrics

## Monitoring Real User Experience

### Google Analytics
If you've set up Google Analytics, you can:
1. Go to Behavior > Site Speed
2. Review page timings and speed suggestions

### Performance API in JavaScript
Add this script to your website to log performance metrics:

```javascript
// Add this to your main.js file
document.addEventListener('DOMContentLoaded', function() {
    // Wait for the page to fully load
    window.addEventListener('load', function() {
        setTimeout(function() {
            // Get performance metrics
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            const domReadyTime = perfData.domComplete - perfData.domLoading;
            
            console.log('Page load time: ' + pageLoadTime + 'ms');
            console.log('DOM ready time: ' + domReadyTime + 'ms');
            
            // Log more detailed metrics
            if (window.performance.getEntriesByType) {
                const resources = window.performance.getEntriesByType('resource');
                console.log('Resource count: ' + resources.length);
                
                // Find slow resources (taking more than 500ms)
                const slowResources = resources.filter(r => r.duration > 500);
                if (slowResources.length > 0) {
                    console.log('Slow resources:');
                    slowResources.forEach(r => {
                        console.log(`${r.name}: ${Math.round(r.duration)}ms`);
                    });
                }
            }
        }, 0);
    });
});
```

## Common Performance Issues to Look For

1. **Slow API Responses**: Check if Supabase queries are taking too long
2. **Large Images**: Ensure images are properly optimized and sized
3. **Render-Blocking Resources**: Check if CSS or JavaScript is blocking rendering
4. **DOM Size**: Too many DOM elements can slow down the page
5. **JavaScript Execution Time**: Look for long-running scripts
6. **Multiple Reflows**: Check if your CSS is causing multiple page reflows

## Specific Areas to Check in Lamp Timess

1. **Profile Page Performance**:
   - Monitor the loading time of bookmarked articles
   - Check if the MutationObserver (if still used) is causing performance issues

2. **Article Loading**:
   - Measure how quickly articles load on the homepage and category pages
   - Check if the article content rendering is optimized

3. **Authentication**:
   - Measure the time it takes to authenticate with Supabase
   - Check if there are unnecessary auth checks

4. **Database Queries**:
   - Monitor the performance of your Supabase queries
   - Ensure you're using proper indexing and query limits

## Performance Improvement Checklist

- [ ] Optimize images (compress, use proper dimensions)
- [ ] Minimize HTTP requests
- [ ] Enable browser caching
- [ ] Minify CSS and JavaScript
- [ ] Use lazy loading for images and content
- [ ] Implement code splitting for JavaScript
- [ ] Consider using a CDN for static assets
- [ ] Optimize database queries with proper indexing and limits
- [ ] Remove unused CSS and JavaScript
- [ ] Implement critical CSS rendering
