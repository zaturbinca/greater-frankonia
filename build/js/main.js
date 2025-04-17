// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

    console.log("Frankonia Website Initialized (v6 - Upgraded Structure & Features).");

    // --- Intersection Observer for Scroll Animations ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: Unobserve after animation to save resources
                // observer.unobserve(entry.target);
            } else {
                // Optional: Remove class if you want animations to replay on scroll up/down
                // if (entry.target.classList.contains('is-visible')) {
                //     entry.target.classList.remove('is-visible');
                // }
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });

    // --- Header Background Change on Scroll ---
    const header = document.getElementById('main-header');
    const scrollThreshold = 50; // Increased threshold slightly
    let isHeaderScrolled = false;
    let scrollTimeout;

    function handleScroll() {
        const shouldBeScrolled = window.scrollY > scrollThreshold;
        if (shouldBeScrolled !== isHeaderScrolled) {
            isHeaderScrolled = shouldBeScrolled;
            header.classList.toggle('scrolled', isHeaderScrolled);
        }
    }

    window.addEventListener('scroll', () => {
        // Debounce scroll event using requestAnimationFrame for performance
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            requestAnimationFrame(handleScroll);
        }, 10); // Adjust delay as needed
    }, { passive: true });

    // Initial check in case the page loads already scrolled
    handleScroll();


    // --- Smooth Scrolling for Nav Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            // Ensure it's a valid internal link
            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault(); // Prevent default only if target exists

                    const headerOffset = header.offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    // Adjust offset slightly more for better spacing below sticky header
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // If it's a mobile menu link, find the Alpine component and close the menu
                    // This assumes the link is inside the component managing 'mobileMenuOpen'
                    const alpineComponent = this.closest('[x-data]');
                    if (alpineComponent && alpineComponent.__x) {
                         // Check if mobileMenuOpen exists in the component's data
                         if (typeof alpineComponent.__x.getUnobservedData().mobileMenuOpen !== 'undefined') {
                             alpineComponent.__x.getUnobservedData().mobileMenuOpen = false;
                         }
                    }
                }
            }
        });
    });

    // --- Dynamic Year in Footer ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Basic Tooltip Implementation (Requires Popper.js) ---
    // Add Popper.js CDN to your HTML:
    // <script src="https://unpkg.com/@popperjs/core@2/dist/umd/popper.min.js"></script>

    if (typeof Popper !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-tooltip]'));
        const tooltipElement = document.getElementById('tooltip');

        if (tooltipElement && tooltipTriggerList.length > 0) {
            let popperInstance = null;

            tooltipTriggerList.forEach(tooltipTriggerEl => {
                const tooltipText = tooltipTriggerEl.getAttribute('data-tooltip');

                function show() {
                    if (!tooltipText) return; // Don't show if no text
                    tooltipElement.querySelector('.tooltip-custom').textContent = tooltipText; // Set text node directly
                    tooltipElement.style.display = 'block'; // Make it visible for Popper
                    tooltipElement.classList.remove('hidden');
                    tooltipElement.classList.add('opacity-100');

                    popperInstance = Popper.createPopper(tooltipTriggerEl, tooltipElement, {
                        placement: 'top', // Default placement
                        modifiers: [
                            {
                                name: 'offset',
                                options: {
                                    offset: [0, 8], // Offset tooltip from trigger
                                },
                            },
                            {
                                name: 'arrow',
                                options: {
                                    element: tooltipElement.querySelector('.tooltip-arrow'),
                                },
                            },
                        ],
                    });
                }

                function hide() {
                    tooltipElement.classList.remove('opacity-100');
                    tooltipElement.classList.add('hidden');
                    tooltipElement.style.display = 'none'; // Hide completely

                    if (popperInstance) {
                        popperInstance.destroy();
                        popperInstance = null;
                    }
                }

                const showEvents = ['mouseenter', 'focus'];
                const hideEvents = ['mouseleave', 'blur'];

                showEvents.forEach(event => {
                    tooltipTriggerEl.addEventListener(event, show);
                });

                hideEvents.forEach(event => {
                    tooltipTriggerEl.addEventListener(event, hide);
                });
            });
        } else {
             console.warn("Tooltip element (#tooltip) or trigger elements ([data-tooltip]) not found, or Popper.js not loaded.");
        }
    } else {
        console.warn("Popper.js not found. Tooltips will not function. Add Popper.js CDN to your HTML.");
    }


    // --- Alpine.js Initialization Check ---
    document.addEventListener('alpine:init', () => {
        console.log('Alpine.js Initialized.');
        // You can define Alpine components or data here if needed
        // Alpine.data('myComponent', () => ({ ... }))
    });

}); // End DOMContentLoaded
