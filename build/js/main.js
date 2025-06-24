// js/main.js

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Preloader ---
    const preloader = document.querySelector('.preloader');
    window.addEventListener('load', () => {
        preloader.classList.add('loaded');
    });

    // --- 2. Mobile Menu ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
            mobileMenuBtn.innerHTML = mobileMenu.classList.contains('active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });

        // Close menu when a link is clicked
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mobileMenu.classList.contains('active')) {
                    mobileMenuBtn.click();
                }
            });
        });
    }

    // --- 3. Animate on Scroll (AOS) ---
    AOS.init({
        duration: 800,
        once: true,
        offset: 50,
    });

    // --- 4. Footer Current Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- 5. AI Regiment Recommender Tool ---
    const recommenderForm = document.getElementById('regiment-recommender-form');
    if (recommenderForm) {
        recommenderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const playstyle = document.getElementById('playstyle').value;
            const interest = document.getElementById('interest').value;
            const errorMsg = document.getElementById('recommender-error');
            const resultBox = document.getElementById('recommender-result');
            const resultText = document.getElementById('result-text');
            const resultReasoning = document.getElementById('result-reasoning');

            if (!playstyle || !interest) {
                errorMsg.style.display = 'block';
                resultBox.style.display = 'none';
                return;
            }

            errorMsg.style.display = 'none';
            resultBox.style.display = 'block';

            let recommendation = "The Army";
            let reasoning = "As the backbone of our forces, the Army is a great starting point for any dedicated soldier.";

            if (playstyle === 'combat' || interest === 'events') {
                recommendation = "The Army or Mechanized Infantry";
                reasoning = "Your focus on direct action and large-scale battles makes you a prime candidate for our frontline combat units.";
            } else if (playstyle === 'stealth') {
                recommendation = "Special Forces";
                reasoning = "Your preference for covert operations aligns perfectly with the high-stakes missions of our elite Special Forces.";
            } else if (playstyle === 'support' && interest === 'discipline') {
                recommendation = "Military Police";
                reasoning = "Your interest in support roles and discipline is ideal for the Military Police, who uphold order within our ranks.";
            } else if (playstyle === 'civilian' || interest === 'lore') {
                recommendation = "The Government";
                reasoning = "Your interest in non-combat roles and the world's lore suggests you would thrive in the administrative and political heart of the Empire.";
            } else if (interest === 'progression') {
                 recommendation = "The Army";
                 reasoning = "The Army offers the clearest and most structured path for advancement through dedication and skill.";
            }

            resultText.textContent = recommendation;
            resultReasoning.textContent = reasoning;
        });
    }

    // --- 6. Discord Widget ---
    const discordWidgetContainer = document.getElementById('discord-widget-container');
    if (discordWidgetContainer) {
        const serverId = '1355603384165470290'; // <-- UPDATED
        const inviteLink = 'https://discord.gg/WwwVnJHQTt'; // <-- UPDATED
        const inviteCode = 'WwwVnJHQTt'; // <-- UPDATED

        const fetchDiscordData = async () => {
            try {
                // The API endpoint is dynamically built using the serverId
                const response = await fetch(`https://discord.com/api/v9/widgets/${serverId}.json`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch server info (Status: ${response.status})`);
                }
                const data = await response.json();

                // Check if the widget returned an error (e.g., widget disabled)
                if (data.code) {
                    throw new Error(`Error from Discord API: ${data.message}`);
                }

                let membersHtml = '';
                if (data.members && data.members.length > 0) {
                    data.members.slice(0, 15).forEach(member => { // Limit to 15 members
                        membersHtml += `
                            <div class="discord-member">
                                <div class="discord-member-avatar">
                                    <img src="${member.avatar_url}" alt="${member.username}'s avatar" width="40" height="40" style="border-radius: 50%;">
                                    <span class="discord-status-indicator ${member.status}"></span>
                                </div>
                                <div class="discord-member-info">
                                    <span class="username">${member.username}</span>
                                    <span class="game">${member.game ? `Playing ${member.game.name}` : ''}</span>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    membersHtml = '<p>No members currently online or visible.</p>';
                }

                discordWidgetContainer.innerHTML = `
                    <div class="discord-header">
                        <img src="https://cdn.discordapp.com/icons/${data.id}/${data.icon}.png" alt="Server Icon" class="discord-server-icon">
                        <div class="discord-server-info">
                            <h3>${data.name}</h3>
                            <p><span class="online-count">${data.presence_count}</span> Online</p>
                        </div>
                    </div>
                    <h4>Online Members</h4>
                    <div class="discord-members-list">${membersHtml}</div>
                    <div class="discord-actions">
                        <a href="${inviteLink}" target="_blank" class="btn btn-primary">Join Discord</a>
                        <button id="copy-invite-btn" class="btn btn-secondary">Copy Invite</button>
                    </div>
                `;

                // Add event listener for the new copy button
                document.getElementById('copy-invite-btn').addEventListener('click', (e) => {
                    const btn = e.currentTarget;
                    navigator.clipboard.writeText(`https://discord.gg/${inviteCode}`).then(() => {
                        btn.textContent = 'Copied!';
                        setTimeout(() => { btn.textContent = 'Copy Invite'; }, 2000);
                    }, () => {
                        btn.textContent = 'Failed';
                        setTimeout(() => { btn.textContent = 'Copy Invite'; }, 2000);
                    });
                });

            } catch (error) {
                console.error('Discord Widget Error:', error);
                discordWidgetContainer.innerHTML = `
                    <div class="discord-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Error loading Discord status.</p>
                        <p class="tool-note">${error.message}. Check Server ID and ensure the widget is enabled in your Discord Server Settings.</p>
                    </div>
                `;
            }
        };

        fetchDiscordData();
    }

    // --- 7. Structure Page Tabs ---
    const tabsContainer = document.querySelector('.tabs-container');
    if (tabsContainer) {
        const tabButtons = tabsContainer.querySelectorAll('.tab-btn');
        const tabContents = tabsContainer.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;

                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === targetTab) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    // --- 8. Regiments Page Collapsible Cards ---
    const collapseToggles = document.querySelectorAll('.collapse-toggle');
    collapseToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const content = toggle.previousElementSibling;
            content.classList.toggle('show');
            if (content.classList.contains('show')) {
                toggle.textContent = 'See Less';
            } else {
                toggle.textContent = 'See More';
            }
        });
    });

    // --- 9. Lore Page Map Modal ---
    const modal = document.getElementById("map-modal");
    const mapImg = document.getElementById("operational-map");
    const modalImg = document.getElementById("modal-map-image");
    
    if (modal && mapImg && modalImg) {
        mapImg.onclick = function() {
            modal.classList.add('active');
            modalImg.src = this.src;
        }

        const closeModal = () => {
            modal.classList.remove('active');
        }

        modal.querySelector('.modal-close').onclick = closeModal;
        modal.onclick = function(event) {
            if (event.target === modal) {
                closeModal();
            }
        }
    }
});
