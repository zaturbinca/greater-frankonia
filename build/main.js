// script.js (Imperial Frankonia Enhanced)
document.addEventListener('DOMContentLoaded', () => {

    // --- Centralized Discord Invite Link ---
    let discordInviteLink = 'https://discord.gg/default';

    const updateAllDiscordLinks = () => {
        const allDiscordLinks = document.querySelectorAll('.discord-join-link');
        allDiscordLinks.forEach(link => {
            link.href = discordInviteLink;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        });
    };

    // --- Advanced Tooltip System (With Viewport Boundary Check) ---
    const initializeAdvancedTooltips = () => {
        const tooltipContainers = document.querySelectorAll('.tooltip-container');

        tooltipContainers.forEach(container => {
            const tooltip = container.querySelector('.tooltip-text');
            if (!tooltip) return;

            // Move tooltip to the body to escape parent's overflow:hidden
            document.body.appendChild(tooltip);

            container.addEventListener('mouseenter', () => {
                const rect = container.getBoundingClientRect();
                
                // Position the tooltip above the container
                let top = rect.top - tooltip.offsetHeight - 8; // 8px gap
                let left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
                
                // Adjust if tooltip would go off-screen
                if (top < 10) top = rect.bottom + 8; // Show below if no space above
                if (left < 10) left = 10;
                if (left + tooltip.offsetWidth > window.innerWidth - 10) {
                    left = window.innerWidth - tooltip.offsetWidth - 10;
                }
                
                tooltip.style.top = `${top}px`;
                tooltip.style.left = `${left}px`;
                
                tooltip.classList.add('active');
            });

            container.addEventListener('mouseleave', () => {
                tooltip.classList.remove('active');
            });
        });
    };
    
    // Call the new tooltip system
    initializeAdvancedTooltips();

    // --- Card Appear Animation ---
    const animateCardsOnLoad = () => {
        const cards = document.querySelectorAll('.interactive-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('card-appear');
        });
    };

    // --- Intersection Observer for scroll animations ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));

    // --- Custom Cursor Glow ---
    const cursorGlow = document.querySelector('.cursor-glow');
    if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', (e) => {
            cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        });
        document.querySelectorAll('a, button, .tab-btn, .tooltip-container, .operational-map img, .gallery-item, .interactive-card').forEach(elem => {
            elem.addEventListener('mouseenter', () => cursorGlow.classList.add('hover'));
            elem.addEventListener('mouseleave', () => cursorGlow.classList.remove('hover'));
        });
    } else if (cursorGlow) {
        cursorGlow.style.display = 'none';
    }

    // --- Interactive Card Glow Effect ---
    const interactiveCards = document.querySelectorAll('.interactive-card');
    interactiveCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
        
        // Add subtle pulse animation on load
        card.style.animation = 'card-appear 0.6s ease-out';
    });

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = mobileNav.classList.toggle('open');
            mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
        });
    }

    // --- Current Year for Footer ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- AI Recommendation Tool (Homepage) - Enhanced ---
    const aiToolBtn = document.getElementById('get-recommendation-btn');
    if (aiToolBtn) {
        aiToolBtn.addEventListener('click', () => {
            const playstyle = document.getElementById('playstyle').value;
            const interest = document.getElementById('interest').value;
            const errorEl = document.getElementById('ai-error');
            const resultEl = document.getElementById('ai-result');
            const resultTitle = document.getElementById('result-title');
            const resultDesc = document.getElementById('result-desc');
            const resultReason = document.getElementById('result-reason');

            if (!playstyle || !interest) {
                errorEl.style.display = 'block';
                resultEl.style.display = 'none';
                return;
            }

            errorEl.style.display = 'none';
            resultEl.style.display = 'block';
            resultTitle.textContent = 'Analyzing...';
            resultDesc.textContent = 'Calculating your optimal placement...';
            resultReason.textContent = '';
            
            // Add loading animation
            resultTitle.classList.add('analyzing');
            
            setTimeout(() => {
                let recommendation = { 
                    title: 'Army', 
                    desc: 'The backbone of Frankonia, perfect for those who enjoy direct combat and being on the front lines.',
                    icon: 'fas fa-fist-raised'
                };
                
                const playstyleText = document.getElementById('playstyle').options[document.getElementById('playstyle').selectedIndex].text;
                let reasoning = `Your preference for "${playstyleText}" points towards a foundational role.`;
                
                // Remove loading animation
                resultTitle.classList.remove('analyzing');

                switch (playstyle) {
                    case 'Direct Combat':
                        recommendation = { 
                            title: 'Army', 
                            desc: 'The primary combat force of the Empire. Perfect for frontline warriors who thrive in direct engagements.',
                            icon: 'fas fa-fist-raised'
                        };
                        reasoning = `Your preference for direct combat makes you ideal for the main fighting force.`;
                        break;
                    case 'Enforcement':
                        recommendation = { 
                            title: 'Military Police', 
                            desc: 'The enforcers of order and discipline. A crucial role for those who value structure and integrity.',
                            icon: 'fas fa-gavel'
                        };
                        reasoning = `Your interest in enforcement aligns with maintaining military discipline.`;
                        break;
                    case 'Strategy':
                        recommendation = { 
                            title: 'Government', 
                            desc: 'The administrative heart of the Empire, ideal for those who prefer organization, policy-making, and supporting the group from within.',
                            icon: 'fas fa-landmark'
                        };
                        reasoning = `Your strategic mindset is valuable for civil administration and policy.`;
                        break;
                    case 'Elite Guard':
                        recommendation = { 
                            title: 'Royal Guard', 
                            desc: 'An elite unit for the most disciplined protectors, tasked with guarding the Royal Family and vital locations.',
                            icon: 'fas fa-chess-rook'
                        };
                        reasoning = `Your desire for elite duties suits the prestigious Royal Guard.`;
                        break;
                    case 'Covert Ops':
                        recommendation = { 
                            title: 'Special Forces', 
                            desc: 'An elite unit for high-stakes, covert operations. For players who are strategic, patient, and excel in specialized tasks.',
                            icon: 'fas fa-user-secret'
                        };
                        reasoning = `Your preference for covert operations matches our Special Forces division.`;
                        break;
                }
                
                resultTitle.innerHTML = `<i class="${recommendation.icon}"></i> ${recommendation.title}`;
                resultDesc.textContent = recommendation.desc;
                resultReason.textContent = reasoning;
            }, 800);
        });
    }

    // --- Discord Widget API Fetch ---
    const discordWidgetContainer = document.getElementById('discord-widget');
    if (discordWidgetContainer) {
        const serverId = '1355603384165470290'; // Your Discord Server ID
        const apiUrl = `https://discord.com/api/guilds/${serverId}/widget.json`;
        
        const loadingEl = document.getElementById('discord-loading');
        const errorEl = document.getElementById('discord-error');
        const widgetContent = document.getElementById('discord-widget-content');
        const memberList = document.getElementById('discord-member-list');

        const fetchDiscordData = async () => {
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error(`Server returned status ${response.status}`);
                const data = await response.json();

                if (data.instant_invite) {
                    discordInviteLink = data.instant_invite;
                    updateAllDiscordLinks();
                }
                
                document.getElementById('discord-server-icon').src = data.icon_url || 'assets/frankonia_logo.png';
                document.getElementById('discord-server-name').textContent = data.name;
                document.getElementById('discord-online-count').textContent = data.presence_count;

                memberList.innerHTML = '';
                if (data.members && data.members.length > 0) {
                    data.members.slice(0, 15).forEach(member => {
                        const memberEl = document.createElement('div');
                        memberEl.className = 'discord-member';
                        memberEl.innerHTML = `
                            <img src="${member.avatar_url}" alt="${member.username} avatar" class="discord-avatar">
                            <span class="discord-username">${member.username}</span>
                        `;
                        memberList.appendChild(memberEl);
                    });
                } else {
                    memberList.innerHTML = '<p>No members currently online or visible.</p>';
                }
                
                loadingEl.style.display = 'none';
                widgetContent.style.display = 'block';

            } catch (error) {
                console.error("Discord Widget Error:", error);
                loadingEl.style.display = 'none';
                errorEl.style.display = 'block';
                updateAllDiscordLinks();
            }
        };

        fetchDiscordData();
    } else {
        updateAllDiscordLinks();
    }

    // --- Tabbed Interface (Structure Page) ---
    const tabsContainer = document.querySelector('.tabs-container');
    if (tabsContainer) {
        const tabButtons = tabsContainer.querySelectorAll('.tab-btn');
        const tabPanes = tabsContainer.querySelectorAll('.tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetPaneId = button.dataset.tab;
                
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                tabPanes.forEach(pane => {
                    if (pane.id === targetPaneId) {
                        pane.classList.add('active');
                    } else {
                        pane.classList.remove('active');
                    }
                });
            });
        });
    }

    // --- Collapsible Descriptions (Regiments Page) ---
    const toggleButtons = document.querySelectorAll('.toggle-description');
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.previousElementSibling;
            const isExpanded = content.classList.toggle('expanded');
            button.textContent = isExpanded ? 'See Less' : 'See More';
        });
    });

    // --- Lore Map Modal (Lore Page) ---
    const mapModal = document.getElementById("map-modal");
    if (mapModal) {
        const mapImage = document.getElementById("operational-map-img");
        const modalImage = document.getElementById("modal-map-content");
        const closeModal = document.querySelector(".close-modal");

        if (mapImage) {
            mapImage.onclick = function() {
                mapModal.style.display = "flex";
                modalImage.src = this.src;
            }
        }
        if (closeModal) {
            closeModal.onclick = function() { mapModal.style.display = "none"; }
        }
        mapModal.onclick = function(event) {
            if (event.target === mapModal) {
                mapModal.style.display = "none";
            }
        }
    }
    
    // --- Initialize Strategic Points (Lore Page) ---
    const strategicPoints = document.querySelectorAll('.strategic-point');
    strategicPoints.forEach(point => {
        point.addEventListener('mouseenter', function() {
            this.querySelector('.point-label').style.opacity = '1';
        });
        
        point.addEventListener('mouseleave', function() {
            this.querySelector('.point-label').style.opacity = '0';
        });
    });
    
    // --- Animate Cards on Load ---
    animateCardsOnLoad();
    
    // --- Initialize Crown Animations ---
    const crownIcons = document.querySelectorAll('.crown-icon');
    crownIcons.forEach(icon => {
        icon.style.animation = 'crown-glow 2s infinite alternate';
    });
});
