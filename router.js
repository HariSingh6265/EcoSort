// Client-side hash router for EcoSort view navigation

export class Router {
    /**
     * @param {Object} routes - Key-value pair of route configurations
     * @param {string} defaultRoute - Fallback route key (e.g. 'gateway')
     */
    constructor(routes, defaultRoute) {
        this.routes = routes;
        this.defaultRoute = defaultRoute;
        this.currentRoute = null;

        // Listen for browser URL hash modifications
        window.addEventListener('hashchange', () => this.handleHashChange());
    }

    // Initialize routing on application load
    init() {
        this.handleHashChange();
    }

    // Programmatically change route
    navigate(routeKey) {
        window.location.hash = `#/${routeKey}`;
    }

    // Route resolver triggered by hash change events
    async handleHashChange() {
        const hash = window.location.hash;
        
        // Match path string like '#/dashboard' or empty
        let routeKey = hash.replace(/^#\/?/, '') || this.defaultRoute;
        
        // If the route doesn't exist, fall back to default
        if (!this.routes[routeKey]) {
            routeKey = this.defaultRoute;
        }

        // 1. Run 'onLeave' lifecycle hook on previous route
        if (this.currentRoute && this.currentRoute !== routeKey) {
            const prevRouteConfig = this.routes[this.currentRoute];
            if (prevRouteConfig && typeof prevRouteConfig.onLeave === 'function') {
                try {
                    await prevRouteConfig.onLeave();
                } catch (e) {
                    console.error(`Error in onLeave hook for route: ${this.currentRoute}`, e);
                }
            }
        }

        // 2. Toggle active view container visibility in DOM
        for (const key in this.routes) {
            const config = this.routes[key];
            const viewElement = document.getElementById(config.elementId);
            
            if (viewElement) {
                if (key === routeKey) {
                    viewElement.classList.add('active');
                    viewElement.style.display = 'block';
                } else {
                    viewElement.classList.remove('active');
                    viewElement.style.display = 'none';
                }
            }
        }

        const currentConfig = this.routes[routeKey];
        this.currentRoute = routeKey;

        // 3. Run 'onEnter' lifecycle hook on new route
        if (currentConfig && typeof currentConfig.onEnter === 'function') {
            try {
                await currentConfig.onEnter();
            } catch (e) {
                console.error(`Error in onEnter hook for route: ${routeKey}`, e);
            }
        }
    }
}
