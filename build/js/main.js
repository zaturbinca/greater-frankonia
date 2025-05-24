// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

    console.log("Frankonia Website Initialized (v9 - Split Pages).");

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

    // Use passive listener for performance
    window.addEventListener('scroll', () => {
        // Debounce and throttle with requestAnimationFrame
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            requestAnimationFrame(handleScroll);
        }, 10); // Small delay to group scroll events
    }, { passive: true });

    // Initial check on page load
    handleScroll();


    // --- Smooth Scrolling for Nav Links (within the same page) ---
    // This script now primarily handles links like href="#section-id" on index.html
    // Links between pages (e.g., href="lore_page.html") are handled by the browser.
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // Check if the link is *only* an anchor and not part of a full URL to another page
        // This prevents smooth scrolling for links like <a href="lore_page.html#section">
        try {
            const url = new URL(anchor.href);
            const isSamePageAnchor = url.origin === window.location.origin && url.pathname === window.location.pathname && url.hash.length > 1;

            if (isSamePageAnchor) {
                anchor.addEventListener('click', function (e) {
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        e.preventDefault();

                        const headerOffset = header ? header.offsetHeight : 0; // Check if header exists
                        // Use getBoundingClientRect().top + window.pageYOffset for accurate position relative to document
                        const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                        const offsetPosition = elementPosition - headerOffset - 20; // Adjust for fixed header and add a little extra padding

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });

                        // Close mobile menu if open (assuming Alpine.js structure)
                        // Find the closest element with x-data and access its Alpine instance
                        const alpineComponent = this.closest('[x-data]');
                        if (alpineComponent && alpineComponent.__x) {
                             // Check if the mobileMenuOpen property exists before trying to set it
                             if (typeof alpineComponent.__x.getUnobservedData().mobileMenuOpen !== 'undefined') {
                                 alpineComponent.__x.getUnobservedData().mobileMenuOpen = false;
                             }
                        }
                    }
                });
            }
        } catch (e) {
            // Handle potential errors with URL parsing if href is malformed
            console.error("Error parsing URL for smooth scroll:", anchor.href, e);
        }
    });


    // --- Dynamic Year in Footer ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Tooltip Implementation (Requires Popper.js) ---
    // NOTE: regiments_page.html has its own embedded tooltip script targeting the same attribute.
    // This might cause minor redundancy or unexpected behavior in some browsers, but is necessary
    // to enable tooltips on index.html without modifying regiments_page.html.
    if (typeof Popper !== 'undefined') {
        // Target elements with data-tooltip-target="tooltip" as used in the HTML
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-tooltip-target="tooltip"]'));
        const tooltipElement = document.getElementById('tooltip');
        const tooltipArrow = tooltipElement ? tooltipElement.querySelector('.tooltip-arrow') : null;

        if (tooltipElement && tooltipArrow && tooltipTriggerList.length > 0) {
            let popperInstance = null;
            let activeTrigger = null; // Keep track of the element currently showing a tooltip
            let showTimeout; // Timeout to delay showing the tooltip
            let hideTimeout; // Timeout to delay hiding the tooltip

            function createPopperInstance(triggerEl, placement) {
                 // Destroy existing instance if it exists for this trigger
                 if (triggerEl._popper) {
                      triggerEl._popper.destroy();
                      delete triggerEl._popper;
                 }

                 // Create new Popper instance
                 const instance = Popper.createPopper(triggerEl, tooltipElement, {
                     placement: placement,
                     modifiers: [
                         { name: 'offset', options: { offset: [0, 8] } },
                         { name: 'arrow', options: { element: tooltipArrow } },
                         { name: 'preventOverflow', options: { boundary: 'body' } },
                         { name: 'flip', options: { fallbackPlacements: ['top', 'bottom', 'left', 'right'] } },
                     ],
                 });
                 triggerEl._popper = instance; // Store instance on the trigger element
                 return instance;
            }


            function show(triggerEl) {
                // Clear any existing timeouts
                clearTimeout(showTimeout);
                clearTimeout(hideTimeout);

                // If a different tooltip is active, hide it immediately
                if (activeTrigger && activeTrigger !== triggerEl) {
                    hide(activeTrigger, 0); // Hide previous one with no delay
                }

                activeTrigger = triggerEl; // Set the new active trigger

                // Set a delay before showing
                showTimeout = setTimeout(() => {
                    const tooltipText = triggerEl.getAttribute('data-tooltip-text');
                    if (!tooltipText) return;

                    tooltipElement.textContent = tooltipText; // Set text
                    tooltipElement.classList.remove('hidden'); // Make it visible for Popper calc
                    tooltipElement.style.display = 'block';
                    tooltipElement.setAttribute('aria-hidden', 'false'); // Accessibility

                    // Create or update Popper instance
                    const placement = triggerEl.getAttribute('data-popper-placement') || 'top';
                    popperInstance = createPopperInstance(triggerEl, placement);


                    // Force update for positioning and then show with opacity
                    popperInstance.update();
                    requestAnimationFrame(() => {
                         tooltipElement.classList.add('opacity-100');
                    });
                }, 500); // Delay in milliseconds (e.g., 500ms)
            }

            function hide(triggerEl, delay = 100) { // Add a small delay for smoother transition
                clearTimeout(showTimeout); // Clear the show timeout if hiding before it fires

                // Only hide if the element requesting hide is the currently active trigger
                // or if triggerEl is null (e.g., from a global click handler)
                if (activeTrigger === triggerEl || !triggerEl) {
                     hideTimeout = setTimeout(() => {
                         if (activeTrigger && activeTrigger._popper) {
                             tooltipElement.classList.remove('opacity-100');
                             tooltipElement.setAttribute('aria-hidden', 'true');

                             // Use transitionend to hide completely after fade out
                             const handleTransitionEnd = () => {
                                 tooltipElement.style.display = 'none';
                                 tooltipElement.classList.add('hidden');
                                 tooltipElement.removeEventListener('transitionend', handleTransitionEnd);
                                 // Optional: Destroy Popper instance after hiding if needed, but keeping it might be faster for repeated hovers
                                 // if (activeTrigger && activeTrigger._popper) {
                                 //     activeTrigger._popper.destroy();
                                 //     delete activeTrigger._popper;
                                 // }
                                 activeTrigger = null; // Reset active trigger
                             }
                             // Add event listener, but also a fallback timeout
                             tooltipElement.addEventListener('transitionend', handleTransitionEnd, { once: true });

                             // Fallback timeout in case transitionend doesn't fire
                             setTimeout(() => {
                                 if (!tooltipElement.classList.contains('opacity-100') && tooltipElement.style.display !== 'none') {
                                      handleTransitionEnd();
                                 }
                             }, 250); // Match transition duration + a little buffer

                         } else {
                              // If no active trigger or popper instance, just ensure it's hidden
                              tooltipElement.style.display = 'none';
                              tooltipElement.classList.add('hidden');
                              tooltipElement.classList.remove('opacity-100');
                              tooltipElement.setAttribute('aria-hidden', 'true');
                              activeTrigger = null;
                         }
                     }, delay); // Apply hide delay
                }
            }

            tooltipTriggerList.forEach(tooltipTriggerEl => {
                tooltipTriggerEl.addEventListener('mouseenter', () => show(tooltipTriggerEl));
                tooltipTriggerEl.addEventListener('mouseleave', () => hide(tooltipTriggerEl));
                tooltipTriggerEl.addEventListener('focus', () => show(tooltipTriggerEl));
                tooltipTriggerEl.addEventListener('blur', () => hide(tooltipTriggerEl));

                 // Clean up Popper instance on element removal (optional but good practice)
                 const observer = new MutationObserver((mutations) => {
                    mutations.forEach(mutation => {
                        if (!document.body.contains(tooltipTriggerEl)) {
                            hide(tooltipTriggerEl, 0); // Hide immediately if element is removed
                            if (tooltipTriggerEl._popper) {
                                tooltipTriggerEl._popper.destroy();
                                delete tooltipTriggerEl._popper;
                            }
                            observer.disconnect(); // Stop observing once element is gone
                        }
                    });
                 });
                 observer.observe(document.body, { childList: true, subtree: true });
            });

             // Hide tooltip if clicking anywhere else (optional, but good for accessibility)
             document.addEventListener('click', (e) => {
                 // Check if the click target is *not* the active trigger and *not* the tooltip itself
                 if (activeTrigger && !activeTrigger.contains(e.target) && !tooltipElement.contains(e.target)) {
                     hide(null, 0); // Hide immediately on outside click
                 }
             });

        } else {
             console.warn("Tooltip elements (#tooltip, .tooltip-arrow) or Popper.js not fully set up for [data-tooltip-target='tooltip'].");
        }
    } else {
        console.warn("Popper.js not found. Tooltips will not function.");
    }


    // --- START: Discord Widget Integration Logic ---

    const discordSection = document.getElementById('discord-status');

    if (discordSection) {
        const serverId = '1355603384165470290'; // <<< YOUR SERVER ID HERE
        // Add a cache-buster to the API URL
        const apiUrl = `https://discord.com/api/guilds/${serverId}/widget.json?_=${Date.now()}`;

        const loader = document.getElementById('discord-loader');
        const widgetContainer = document.getElementById('discord-widget-container');
        const widgetContent = document.getElementById('discord-widget-content');
        const serverIconEl = document.getElementById('discord-server-icon');
        const serverNameEl = document.getElementById('discord-server-name');
        const onlineCountEl = document.getElementById('discord-online-count');
        const memberListEl = document.getElementById('discord-member-list');
        const memberPlaceholderEl = document.getElementById('discord-member-placeholder');
        const joinLink = document.getElementById('discord-join-link');
        const copyLinkButton = document.getElementById('discord-copy-link-button');
        const errorMessageEl = document.getElementById('discord-error-message');

        let inviteLink = null;

        function displayDiscordError(message) {
            console.error("Discord Widget Error:", message);
            // Update UI elements to show error state
            if (serverNameEl) serverNameEl.textContent = 'Error Loading';
            if (onlineCountEl) onlineCountEl.textContent = 'N/A';
            if (memberPlaceholderEl) {
                 memberPlaceholderEl.textContent = 'Could not load members.';
                 if (memberListEl) {
                    memberListEl.innerHTML = ''; // Clear any partial list
                    memberListEl.appendChild(memberPlaceholderEl);
                 }
            }

            // Show the dedicated error message area
            if (errorMessageEl) {
                errorMessageEl.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> ${message}`; // Use innerHTML for icon
                errorMessageEl.classList.remove('hidden');
            }

            // Hide loader and show content area (possibly dimmed via CSS)
            if(loader) loader.classList.add('hidden');
            if(widgetContent) {
                widgetContent.classList.add('opacity-100', 'loaded');
                // Add a class to dim or style the content area on error via CSS
                widgetContent.classList.add('error-state');
            }
            // Hide action buttons
            if(joinLink) joinLink.classList.add('hidden');
            if(copyLinkButton) copyLinkButton.classList.add('hidden');
            // Hide server icon or show a fallback
            if(serverIconEl) {
                serverIconEl.style.display = 'none'; // Hide the icon on error
                // Or set a fallback icon: serverIconEl.src = 'fallback-icon.png';
            }
        }

        async function copyToClipboard(text) {
            if (!navigator.clipboard) {
                // Fallback for older browsers
                try {
                    const textArea = document.createElement("textarea");
                    textArea.value = text;
                    // Avoid scrolling to bottom
                    textArea.style.position = "fixed";
                    textArea.style.top = "0";
                    textArea.style.left = "0";
                    textArea.style.width = "1em";
                    textArea.style.height = "1em";
                    textArea.style.padding = "0";
                    textArea.style.border = "none";
                    textArea.style.outline = "none";
                    textArea.style.boxShadow = "none";
                    textArea.style.background = "transparent";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    return true;
                } catch (err) {
                    console.error('Fallback copy failed:', err);
                    return false;
                }
            }
            // Modern async clipboard API
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                console.error('Async clipboard copy failed:', err);
                return false;
            }
        }


        function createDiscordMemberElement(member) {
            const listItem = document.createElement('li');
            listItem.className = 'discord-member-item';
            // Use username and discriminator for full tag if available, fallback to just username
            const fullUsername = member.discriminator && member.discriminator !== '0' && member.discriminator !== '0000'
                                 ? `${member.username}#${member.discriminator}`
                                 : member.username;
            listItem.setAttribute('title', `${fullUsername} (${member.status})`); // Tooltip on hover

            const avatarContainer = document.createElement('div');
            avatarContainer.className = 'discord-member-avatar-container';

            const avatarImg = document.createElement('img');
            avatarImg.className = 'discord-member-avatar';
            // Use member.avatar if available, fallback to default embed avatar
            avatarImg.src = member.avatar_url || `https://cdn.discordapp.com/embed/avatars/${member.discriminator % 5}.png`;
            avatarImg.alt = `${member.username}'s avatar`;
            avatarImg.loading = 'lazy'; // Lazy load avatars
            avatarImg.width = 32; // Set explicit width/height for layout stability
            avatarImg.height = 32;

            const statusIndicator = document.createElement('span');
            statusIndicator.className = `discord-member-status ${member.status || 'offline'}`;
            statusIndicator.setAttribute('aria-label', member.status || 'offline'); // Accessibility for status

            avatarContainer.appendChild(avatarImg);
            avatarContainer.appendChild(statusIndicator);

            const memberNameSpan = document.createElement('span');
            memberNameSpan.className = 'discord-member-name';

            const usernameText = document.createTextNode(member.username); // Display just username
            memberNameSpan.appendChild(usernameText);

            if (member.game && member.game.name) {
                 const gameSpan = document.createElement('span');
                 gameSpan.className = 'game';
                 // Truncate long game names
                 const gameName = member.game.name.length > 35 ? member.game.name.substring(0, 32) + '...' : member.game.name;
                 gameSpan.textContent = `Playing ${gameName}`;
                 memberNameSpan.appendChild(gameSpan);
            }

            listItem.appendChild(avatarContainer);
            listItem.appendChild(memberNameSpan);

            return listItem;
        }

        async function fetchDiscordData() {
            if (!loader || !widgetContainer || !widgetContent) {
                console.error("Discord widget essential elements not found.");
                displayDiscordError("Internal error: Widget elements missing.");
                return; // Stop if essential elements are missing
            }

            // Show loader and hide previous content/error
            if(loader) loader.classList.remove('hidden');
            if(widgetContent) widgetContent.classList.remove('opacity-100', 'loaded', 'error-state');
            if(errorMessageEl) errorMessageEl.classList.add('hidden');


            try {
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    let errorText = `Failed to fetch server info (Status: ${response.status}).`;
                    try {
                        const errorData = await response.json();
                        if (errorData.message) {
                           errorText = `Error: ${errorData.message}`;
                           if (errorData.code === 50004 || errorData.code === 10004) {
                             errorText += " - Check Server ID and ensure Widget is enabled in Discord Server Settings.";
                           } else if (errorData.code === 0) {
                             errorText += " - Discord API might be temporarily unavailable.";
                           }
                        }
                    } catch (e) { /* Ignore JSON parse error */ }
                    throw new Error(errorText);
                }

                const data = await response.json();

                // --- Update Widget UI Elements ---
                if (serverNameEl) serverNameEl.textContent = data.name || 'Discord Server';
                if (onlineCountEl) onlineCountEl.textContent = data.presence_count !== undefined ? data.presence_count : '--';

                if (serverIconEl) {
                    if (data.icon_url) {
                        serverIconEl.src = data.icon_url;
                        serverIconEl.alt = `${data.name || 'Server'} Icon`;
                        serverIconEl.style.display = ''; // Ensure it's displayed
                    } else {
                        serverIconEl.style.display = 'none'; // Hide if no icon URL
                    }
                }

                if (memberListEl) {
                    memberListEl.innerHTML = ''; // Clear placeholder/previous
                    if (data.members && data.members.length > 0) {
                        // Sort members by status (online, idle, dnd, offline)
                        const statusOrder = { 'online': 1, 'idle': 2, 'dnd': 3, 'offline': 4 };
                        data.members.sort((a, b) => {
                            const statusA = statusOrder[a.status] || 4;
                            const statusB = statusOrder[b.status] || 4;
                            if (statusA !== statusB) return statusA - statusB;
                            return a.username.localeCompare(b.username); // Then sort by username
                        });

                        data.members.forEach(member => {
                           const memberEl = createDiscordMemberElement(member);
                           memberListEl.appendChild(memberEl);
                        });
                    } else if (memberPlaceholderEl) {
                        memberPlaceholderEl.textContent = 'No members currently online or visible.';
                        memberListEl.appendChild(memberPlaceholderEl);
                    }
                }

                // --- Update Invite Link & Buttons ---
                inviteLink = data.instant_invite;
                if (inviteLink) {
                    if(joinLink) { joinLink.href = inviteLink; joinLink.classList.remove('hidden'); }
                    if(copyLinkButton) copyLinkButton.classList.remove('hidden');
                } else {
                    if(joinLink) joinLink.classList.add('hidden');
                    if(copyLinkButton) copyLinkButton.classList.add('hidden');
                    console.warn("No instant invite configured for Discord widget.");
                }

                // --- Finalize UI State ---
                loader.classList.add('hidden');
                if(errorMessageEl) errorMessageEl.classList.add('hidden');
                widgetContent.classList.add('opacity-100', 'loaded');
                widgetContent.classList.remove('error-state'); // Remove error state class

            } catch (error) {
                console.error('Failed to load Discord widget data:', error);
                displayDiscordError(error.message || 'An unknown error occurred while fetching Discord data.');
            }
        }

        // --- Event Listener for Copy Button ---
        if (copyLinkButton) {
            copyLinkButton.addEventListener('click', async () => {
                 if (!inviteLink) return;
                const originalText = copyLinkButton.innerHTML;
                const originalTooltip = copyLinkButton.getAttribute('data-tooltip-text');
                copyLinkButton.disabled = true;
                // Use a span for text to easily update just the text part
                copyLinkButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i> <span>Copying...</span>`;
                copyLinkButton.setAttribute('data-tooltip-text', 'Copying...'); // Update tooltip while copying

                // Hide the tooltip immediately if it's currently showing for this button
                const tooltipElement = document.getElementById('tooltip');
                if (activeTrigger === copyLinkButton && tooltipElement && tooltipElement.getAttribute('aria-hidden') === 'false') {
                     hide(copyLinkButton, 0); // Hide immediately
                }


                const success = await copyToClipboard(inviteLink);

                if (success) {
                    copyLinkButton.innerHTML = `<i class="fas fa-check mr-2" aria-hidden="true"></i> <span>Copied!</span>`;
                    copyLinkButton.setAttribute('data-tooltip-text', 'Copied!');
                } else {
                    copyLinkButton.innerHTML = `<i class="fas fa-times mr-2" aria-hidden="true"></i> <span>Failed</span>`;
                    copyLinkButton.setAttribute('data-tooltip-text', 'Copy failed!');
                }

                // Re-show tooltip with new text briefly, then hide and restore button
                show(copyLinkButton); // Show the "Copied!" or "Failed" tooltip

                setTimeout(() => {
                    hide(copyLinkButton); // Hide the "Copied!" / "Failed" tooltip
                    setTimeout(() => {
                        // Restore button text and tooltip after the tooltip has faded out
                        copyLinkButton.innerHTML = originalText;
                        copyLinkButton.setAttribute('data-tooltip-text', originalTooltip); // Restore original tooltip text
                        copyLinkButton.disabled = false;
                    }, 300); // Wait for tooltip fade out duration
                }, 1500); // Show "Copied!" / "Failed" for 1.5 seconds
            });
        } else {
            console.warn("Discord copy button not found.");
        }

        // --- Initial Fetch ---
        fetchDiscordData();

        // Optional: Refresh data periodically (e.g., every 5 minutes)
        // setInterval(fetchDiscordData, 5 * 60 * 1000); // 5 minutes

    } // End of check for discordSection existence

    // --- Alpine.js Initialization Check ---
    // This listener confirms Alpine is ready, useful for debugging
    document.addEventListener('alpine:init', () => {
        console.log('Alpine.js Initialized.');
    });

}); // End DOMContentLoaded
