# Architecture rules

- Keep the home page's cosmetic 3D experience in a lazy-loaded, isolated React Three Fiber component; learning pages must not load its rendering dependencies.
- Resolve 3D material colors from global semantic CSS tokens so the scene stays consistent with the site's theme.