// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

    console.log("Frankonia Website Initialized (v8 - Discord Widget Refined).");

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
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            requestAnimationFrame(handleScroll);
        }, 10);
    }, { passive: true });
    handleScroll(); // Initial check


    // --- Smooth Scrolling for Nav Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();

                    const headerOffset = header ? header.offsetHeight : 0; // Check if header exists
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    const alpineComponent = this.closest('[x-data]');
                    if (alpineComponent && alpineComponent.__x) {
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
    // NOTE: The regiments_page.html has its own, more specific tooltip script.
    // This script block in main.js is primarily for index.html or other pages
    // that might use a simpler [data-tooltip] attribute.
    if (typeof Popper !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-tooltip]'));
        const tooltipElement = document.getElementById('tooltip');
        // Check if tooltipElement exists before querying its children
        const tooltipContent = tooltipElement ? tooltipElement.querySelector('.tooltip-custom') : null; // Get the content element
        const tooltipArrow = tooltipElement ? tooltipElement.querySelector('.tooltip-arrow') : null;

        if (tooltipElement && tooltipContent && tooltipArrow && tooltipTriggerList.length > 0) {
            let popperInstance = null;

            tooltipTriggerList.forEach(tooltipTriggerEl => {
                const tooltipText = tooltipTriggerEl.getAttribute('data-tooltip');

                function show() {
                    if (!tooltipText) return;
                    tooltipContent.textContent = tooltipText; // Set text
                    tooltipElement.classList.remove('hidden'); // Make it visible for Popper calc
                    tooltipElement.style.display = 'block';

                    popperInstance = Popper.createPopper(tooltipTriggerEl, tooltipElement, {
                        placement: 'top',
                        modifiers: [
                            { name: 'offset', options: { offset: [0, 8] } },
                            { name: 'arrow', options: { element: tooltipArrow } },
                        ],
                    });

                    // Force update for positioning and then show with opacity
                    popperInstance.update();
                    requestAnimationFrame(() => {
                         tooltipElement.classList.add('opacity-100');
                    });
                }

                function hide() {
                    tooltipElement.classList.remove('opacity-100');
                    // Use transitionend to hide completely after fade out
                    const handleTransitionEnd = () => {
                        tooltipElement.style.display = 'none';
                        tooltipElement.classList.add('hidden');
                        tooltipElement.removeEventListener('transitionend', handleTransitionEnd);
                        if (popperInstance) {
                            popperInstance.destroy();
                            popperInstance = null;
                        }
                    }
                    tooltipElement.addEventListener('transitionend', handleTransitionEnd);
                    // Fallback timeout in case transitionend doesn't fire
                    setTimeout(() => {
                        if (!tooltipElement.classList.contains('opacity-100')) {
                             handleTransitionEnd();
                        }
                    }, 300); // Match transition duration
                }

                const showEvents = ['mouseenter', 'focus'];
                const hideEvents = ['mouseleave', 'blur'];
                showEvents.forEach(event => tooltipTriggerEl.addEventListener(event, show));
                hideEvents.forEach(event => tooltipTriggerEl.addEventListener(event, hide));
            });
        } else {
             console.warn("Tooltip elements/Popper.js not fully set up for [data-tooltip].");
        }
    } else {
        console.warn("Popper.js not found. Tooltips will not function.");
    }


    // --- START: Discord Widget Integration Logic ---

    const discordSection = document.getElementById('discord-status');

    if (discordSection) {
        const serverId = '1355603384165470290'; // <<< YOUR SERVER ID HERE
        const apiUrl = `https://discord.com/api/guilds/${serverId}/widget.json?${Date.now()}`;

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
            if (serverNameEl) serverNameEl.textContent = 'Error Loading';
            if (onlineCountEl) onlineCountEl.textContent = 'N/A';
            if (memberPlaceholderEl) {
                 memberPlaceholderEl.textContent = 'Could not load members.';
                 if (memberListEl) {
                    memberListEl.innerHTML = '';
                    memberListEl.appendChild(memberPlaceholderEl);
                 }
            }

            if (errorMessageEl) {
                errorMessageEl.textContent = message;
                errorMessageEl.classList.remove('hidden');
            }


            if(loader) loader.classList.add('hidden');
            if(widgetContent) widgetContent.classList.add('opacity-100', 'loaded'); // Show content area even with error
            if(joinLink) joinLink.classList.add('hidden');
            if(copyLinkButton) copyLinkButton.classList.add('hidden');
            if(serverIconEl) serverIconEl.style.display = 'none';
        }

        async function copyToClipboard(text) {
            if (!navigator.clipboard) {
                try {
                    const textArea = document.createElement("textarea");
                    textArea.value = text; textArea.style.position = "fixed"; textArea.style.opacity = "0";
                    document.body.appendChild(textArea); textArea.focus(); textArea.select();
                    document.execCommand('copy'); document.body.removeChild(textArea); return true;
                } catch (err) { console.error('Fallback copy failed:', err); return false; }
            }
            try { await navigator.clipboard.writeText(text); return true; }
            catch (err) { console.error('Async clipboard copy failed:', err); return false; }
        }

        function createDiscordMemberElement(member) {
            const listItem = document.createElement('li');
            listItem.className = 'discord-member-item';
            listItem.setAttribute('title', `${member.username}#${member.discriminator || '0000'} (${member.status})`);

            const avatarContainer = document.createElement('div');
            avatarContainer.className = 'discord-member-avatar-container';

            const avatarImg = document.createElement('img');
            avatarImg.className = 'discord-member-avatar';
            avatarImg.src = member.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png';
            avatarImg.alt = `${member.username}'s avatar`;
            avatarImg.loading = 'lazy';
            avatarImg.width = 32;
            avatarImg.height = 32;

            const statusIndicator = document.createElement('span');
            statusIndicator.className = `discord-member-status ${member.status || 'offline'}`;

            avatarContainer.appendChild(avatarImg);
            avatarContainer.appendChild(statusIndicator);

            const memberNameSpan = document.createElement('span');
            memberNameSpan.className = 'discord-member-name';

            const usernameText = document.createTextNode(member.username);
            memberNameSpan.appendChild(usernameText);

            if (member.game && member.game.name) {
                 const gameSpan = document.createElement('span');
                 gameSpan.className = 'game';
                 const gameName = member.game.name.length > 35 ? member.game.name.substring(0, 32) + '...' : member.game.name;
                 gameSpan.textContent = `Playing ${gameName}`;
                 memberNameSpan.appendChild(gameSpan);
            }

            listItem.appendChild(avatarContainer);
            listItem.appendChild(memberNameSpan);

            return listItem;
        }

        async function fetchDiscordData() {
            if (!loader || !widgetContent) {
                console.error("Discord widget elements not found.");
                return; // Stop if essential elements is missing
            }
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
                    } catch (e) { /* Ignore */ }
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
                        serverIconEl.style.display = '';
                    } else {
                        serverIconEl.style.display = 'none';
                    }
                }

                if (memberListEl) {
                    memberListEl.innerHTML = ''; // Clear placeholder/previous
                    if (data.members && data.members.length > 0) {
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
                copyLinkButton.disabled = true;
                copyLinkButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Copying...`;

                const success = await copyToClipboard(inviteLink);

                if (success) { copyLinkButton.innerHTML = `<i class="fas fa-check mr-2"></i> Copied!`; }
                else { copyLinkButton.innerHTML = `<i class="fas fa-times mr-2"></i> Failed`; }

                setTimeout(() => {
                    copyLinkButton.innerHTML = originalText;
                    copyLinkButton.disabled = false;
                }, 2500);
            });
        } else {
            console.warn("Discord copy button not found.");
        }

        // --- Initial Fetch ---
        fetchDiscordData();

    } // End of check for discordSection existence

    // --- Alpine.js Initialization Check ---
    document.addEventListener('alpine:init', () => {
        console.log('Alpine.js Initialized.');
    });

}); // End DOMContentLoaded
