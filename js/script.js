document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Set initial theme based on user's system preference
    document.documentElement.setAttribute('data-theme',
        prefersDarkScheme.matches ? 'dark' : 'light'
    );

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);

        // Optionally save the preference
        localStorage.setItem('theme', newTheme);
    });

    // Check for saved user preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // Load author links first, then load publications
    loadAuthorLinks().then(authorLinks => {
        loadPublications(authorLinks);
    });
});

function loadAuthorLinks() {
    return fetch('data/authorLinks.json')
        .then(response => response.json())
        .catch(error => {
            console.error('Error loading author links:', error);
            return {};
        });
}

function loadPublications(authorLinks) {
    fetch('data/publications.json')
        .then(response => response.json())
        .then(data => {
            const publicationsContainer = document.getElementById('publications-list');
            
            // Create document fragment for better performance
            const fragment = document.createDocumentFragment();
            
            data.forEach((pub, index) => {
                const pubItem = document.createElement('div');
                pubItem.classList.add('publication-item');

                // Add unique IDs for accessibility
                const abstractId = `abstract-${index}`;
                
                pubItem.innerHTML = `
                    <div class="title-row">
                        <div class="toggle-container">
                            <button class="abstract-toggle" 
                                   aria-label="Toggle abstract" 
                                   aria-expanded="false" 
                                   aria-controls="${abstractId}"></button>
                        </div>
                        <div class="title-container">
                            <h3 class="pub-title">
                                <button class="title-button" 
                                        aria-expanded="false" 
                                        aria-controls="${abstractId}">
                                    ${pub.title}
                                </button>
                            </h3>
                        </div>
                    </div>
                    <p class="pub-authors">${formatAuthors(pub.authors, authorLinks)}</p>
                    <p class="pub-venue">
                        <span class="venue-short">${pub.short_venue || `${pub.venue} (${pub.year})`}</span>
                        <span class="venue-full">${pub.venue} (${pub.year})</span>
                    </p>
                    <div class="publication-actions">
                        ${pub.url ? `
                            <a href="${pub.url}" class="action-btn" target="_blank" rel="noopener" title="Project Page">
                                <i class="fas fa-globe"></i>
                            </a>
                        ` : ''}  
                        ${pub.pdf ? `
                            <a href="${pub.pdf}" class="action-btn" target="_blank" rel="noopener" title="PDF">
                                <i class="fas fa-file-pdf"></i>
                            </a>
                        ` : ''}
                        ${pub.technical_report ? `
                            <a href="${pub.technical_report}" class="action-btn" target="_blank" rel="noopener" title="Technical Report">
                                <i class="fas fa-file-alt"></i>
                            </a>
                        ` : ''}
                        ${pub.code ? `
                            <a href="${pub.code}" class="action-btn" target="_blank" rel="noopener" title="Code">
                                <i class="fas fa-code"></i>
                            </a>
                        ` : ''}
                        ${pub.arxiv ? `
                            <a href="${pub.arxiv}" class="action-btn action-btn-wide" target="_blank" rel="noopener" title="arXiv">
                                <img src="assets/icons/arxiv-logo.svg" alt="arXiv" width="35" height="20" class="arxiv-icon">
                            </a>
                        ` : ''}
                    </div>
                    <div class="abstract" id="${abstractId}">
                        ${pub.abstract}
                    </div>
                `;

                const toggle = pubItem.querySelector('.abstract-toggle');
                const titleButton = pubItem.querySelector('.title-button');
                const abstract = pubItem.querySelector('.abstract');
                const venueShort = pubItem.querySelector('.venue-short');
                const venueFull = pubItem.querySelector('.venue-full');

                function toggleAbstract() {
                    // Toggle aria-expanded for accessibility
                    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                    toggle.setAttribute('aria-expanded', !isExpanded);
                    titleButton.setAttribute('aria-expanded', !isExpanded);
                    
                    toggle.classList.toggle('active');
                    titleButton.classList.toggle('active');
                    
                    // Use classList instead of directly manipulating style properties
                    abstract.classList.toggle('show');
                    venueShort.classList.toggle('hidden');
                    venueFull.classList.toggle('show');
                }

                toggle.addEventListener('click', toggleAbstract);
                titleButton.addEventListener('click', toggleAbstract);

                // Add to fragment instead of directly to DOM
                fragment.appendChild(pubItem);
            });
            
            // Single DOM update for better performance
            publicationsContainer.appendChild(fragment);
        })
        .catch(error => console.error('Error loading publications:', error));
}

function formatAuthors(authors, authorLinks) {
    if (typeof authors === 'string') {
        authors = authors.split(', ');
    }

    return authors.map(author => {
        const link = authorLinks[author];
        if (author === "Mohamed Alzayat") {
            return link ?
                `<a href="${link}" target="_blank" class="author-link"><strong><u>${author}</u></strong></a>` :
                `<strong><u>${author}</u></strong>`;
        }
        return link ?
            `<a href="${link}" target="_blank" class="author-link">${author}</a>` :
            author;
    }).join(', ');
}