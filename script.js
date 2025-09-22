document.addEventListener('DOMContentLoaded', () => {

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animation pour les sections
                if (entry.target.classList.contains('service-section')) {
                    entry.target.style.opacity = 1;
                    entry.target.style.transform = 'translateY(0)';
                }
                
                // Animation pour les cartes dans les sections
                const cards = entry.target.querySelectorAll('.service-card');
                cards.forEach((card, index) => {
                    card.style.animationDelay = `${index * 0.2}s`;
                    card.classList.add('in-view');
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const sections = document.querySelectorAll('.service-section, .main-content');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Code pour la barre de navigation animée au défilement
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });

    // Code pour la barre de recherche
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.querySelector('.search-input');
    const suggestionsList = document.querySelector('.suggestions-list');
    const searchButton = document.querySelector('.search-button');
    const errorContainer = document.querySelector('.error-container');
    const errorMessage = document.querySelector('.error-message');

    // Mots-clés et leurs destinations
    const keywords = {
        'professionnels': '#pro-section',
        'particuliers': '#particulier-section',
        'contact': '#contact-section',
        'mail': '#contact-section',
        'email': '#contact-section',
        'e-mail': '#contact-section',
        'courrier': '#contact-section',
        'courriel': '#contact-section',
        'logiciels': '#pro-section',
        'sites web': '#pro-section',
        'applications mobiles': '#pro-section',
        'réparation': '#particulier-section',
        'optimisation': '#particulier-section',
        'montage': '#particulier-section',
        'ordinateur': '#particulier-section',
        'pc': '#particulier-section'
    };
    const allKeywords = Object.keys(keywords);

    const stopWords = ['un', 'une', 'le', 'la', 'les', 'de', 'du', 'des', 'est', 'sont', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'ce', 'cet', 'cette', 'ces', 'et', 'ou', 'ni', 'car', 'donc', 'or', 'mais', 'qui', 'que', 'quoi', 'quand', 'où', 'comment', 'pourquoi', 'combien', 'plus', 'moins', 'plusieurs', 'je souhaite', 'mon ordinateur', 'je veux', 'un', 'à'];

    function getEditDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        
        const matrix = [];
        
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                const cost = (a.charAt(j - 1) === b.charAt(i - 1)) ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,      // deletion
                    matrix[i][j - 1] + 1,      // insertion
                    matrix[i - 1][j - 1] + cost // substitution
                );
            }
        }
        
        return matrix[b.length][a.length];
    }
    
    function findBestMatches(query) {
        const matches = new Set();
        const queryWords = query.split(' ').filter(word => !stopWords.includes(word));
        
        queryWords.forEach(qWord => {
            allKeywords.forEach(kWord => {
                if (qWord.length > 2 && getEditDistance(qWord, kWord) <= 2) {
                    matches.add(kWord);
                } else if (kWord.includes(qWord)) {
                    matches.add(kWord);
                }
            });
        });
        
        return Array.from(matches);
    }
    
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        suggestionsList.innerHTML = '';
        
        if (query.length > 2) {
            const matches = findBestMatches(query);
            
            if (matches.length > 0) {
                matches.forEach(match => {
                    const li = document.createElement('li');
                    li.textContent = match;
                    li.addEventListener('click', () => {
                        searchInput.value = match;
                        performSearch(match);
                        suggestionsList.classList.remove('show');
                    });
                    suggestionsList.appendChild(li);
                });
                suggestionsList.classList.add('show');
                hideError();
            } else {
                suggestionsList.classList.remove('show');
                showError("Mot-clé non trouvé.");
            }
        } else {
            suggestionsList.classList.remove('show');
            hideError();
        }
    });

    searchButton.addEventListener('click', () => {
        performSearch(searchInput.value);
    });

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            performSearch(searchInput.value);
        }
    });

    function performSearch(query) {
        const cleanedQuery = query.toLowerCase().trim();

        if (cleanedQuery === '') {
            showError("Veuillez entrer un mot-clé.");
            searchContainer.classList.add('shake');
            setTimeout(() => {
                searchContainer.classList.remove('shake');
            }, 1000);
            return;
        }

        const matches = findBestMatches(cleanedQuery);
        if (matches.length > 0) {
            const bestMatch = matches[0];
            const targetSectionId = keywords[bestMatch];
            
            if (targetSectionId) {
                const targetElement = document.querySelector(targetSectionId);
                if (targetElement) {
                    window.location.href = targetSectionId;
                    
                    setTimeout(() => {
                        highlightElement(targetElement);
                    }, 500);
                }
            }
            searchContainer.classList.remove('shake');
            hideError();
        } else {
            searchContainer.classList.add('shake');
            setTimeout(() => {
                searchContainer.classList.remove('shake');
            }, 1000);
            showError("Mot-clé non trouvé sur ce site.");
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorContainer.classList.add('show');
    }

    function hideError() {
        errorContainer.classList.remove('show');
    }

    function highlightElement(element) {
        element.classList.remove('highlight-item');
        void element.offsetWidth;
        element.classList.add('highlight-item');

        setTimeout(() => {
            element.classList.remove('highlight-item');
        }, 2000);
    }
    
    document.addEventListener('click', (event) => {
        if (!searchContainer.contains(event.target)) {
            suggestionsList.classList.remove('show');
            hideError();
        }
    });

    // CODE POUR LA MODALE D'E-MAIL
    const emailButton = document.getElementById('email-button');
    const contactButton = document.getElementById('contact-button');
    const emailModalOverlay = document.getElementById('email-modal-overlay');
    const closeModalButton = document.getElementById('close-email-modal');
    const contactForm = document.getElementById('contact-form');
    const cancelButton = document.getElementById('cancel-form');
    const modalError = document.getElementById('modal-error');
    
    contactButton.addEventListener('click', () => {
        emailModalOverlay.classList.add('show');
    });

    closeModalButton.addEventListener('click', () => {
        emailModalOverlay.classList.remove('show');
        resetModal();
    });

    cancelButton.addEventListener('click', () => {
        emailModalOverlay.classList.remove('show');
        resetModal();
    });

    emailModalOverlay.addEventListener('click', (e) => {
        if (e.target === emailModalOverlay) {
            emailModalOverlay.classList.remove('show');
            resetModal();
        }
    });

    function showModalError(message) {
        modalError.textContent = message;
        modalError.classList.add('show');
    }

    function hideModalError() {
        modalError.classList.remove('show');
        modalError.textContent = '';
    }

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name-input').value;
        const phone = document.getElementById('phone-input').value;
        const subject = document.getElementById('subject-input').value;
        const message = document.getElementById('message-input').value;

        if (name.trim() === '' || subject.trim() === '' || message.trim() === '') {
            showModalError("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        hideModalError();

        let body = "Prénom:\n" + name + "\n\n";

        if (phone.trim() !== '') {
            body += "Numéro de téléphone:\n" + phone + "\n\n";
        }
        
        body += "Demande ou problématique:\n" + message;

        const mailtoLink = `mailto:metacorerepair@gmail.com?subject=${encodeURIComponent(name + ' - ' + subject)}&body=${encodeURIComponent(body)}`;
        
        window.location.href = mailtoLink;
        
        emailModalOverlay.classList.remove('show');
        resetModal();
    });

    function resetModal() {
        contactForm.reset();
        hideModalError();
    }
    
    // NOUVEAU CODE POUR LE MODAL DE DÉTAILS DE SERVICE
    const serviceDetailsButtons = document.querySelectorAll('.service-details-button');
    const serviceModalOverlay = document.getElementById('service-modal-overlay');
    const closeServiceModalButton = document.getElementById('close-service-modal');
    const serviceTitle = document.getElementById('service-title');
    const serviceDescription = document.getElementById('service-description');
    const serviceDevisButton = document.getElementById('service-devis-button');
    
    const services = {
        'logiciel': {
            title: 'Création de Logiciels',
            description: 'Nous développons des logiciels sur mesure, adaptés aux besoins spécifiques de votre entreprise. De la conception à la mise en production, nos solutions optimisent vos processus et augmentent votre efficacité.'
        },
        'sites-web': {
            title: 'Création de Sites Web',
            description: 'De la simple vitrine au site e-commerce complexe, nous créons des plateformes web modernes et réactives, conçues pour offrir une expérience utilisateur optimale sur tous les appareils.'
        },
        'applications-mobiles': {
            title: 'Applications Mobiles',
            description: 'Nous concevons et développons des applications iOS et Android natives ou multiplateformes. Nos applications sont performantes, sécurisées et intuitives, vous permettant de rester connecté à vos clients.'
        },
        'reparation': {
            title: 'Réparation d\'Ordinateur',
            description: 'Votre ordinateur est lent ou en panne ? Nous réalisons un diagnostic complet et procédons à la réparation des composants défectueux ou au nettoyage du système pour lui redonner une seconde vie.'
        },
        'optimisation': {
            title: 'Optimisation PC',
            description: 'Augmentez la vitesse et les performances de votre ordinateur sans changer de matériel. Nous nettoyons les logiciels inutiles, optimisons les paramètres système et installons les mises à jour nécessaires.'
        },
        'montage-pc': {
            title: 'Montage d\'Ordinateur',
            description: 'Que vous soyez un gamer passionné ou un professionnel, nous assemblons votre PC sur mesure. Choisissez vos composants et nous nous occupons du montage, des tests et de l\'installation du système d\'exploitation.'
        }
    };
    
    serviceDetailsButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const serviceId = e.target.dataset.service;
            const service = services[serviceId];
            
            if (service) {
                serviceTitle.textContent = service.title;
                serviceDescription.textContent = service.description;
                serviceModalOverlay.classList.add('show');
            }
        });
    });

    closeServiceModalButton.addEventListener('click', () => {
        serviceModalOverlay.classList.remove('show');
    });

    serviceModalOverlay.addEventListener('click', (e) => {
        if (e.target === serviceModalOverlay) {
            serviceModalOverlay.classList.remove('show');
        }
    });

    serviceDevisButton.addEventListener('click', () => {
        serviceModalOverlay.classList.remove('show');
        emailModalOverlay.classList.add('show');
    });

    // Code pour la nouvelle fonction "Copier l'e-mail"
    const copyEmailButton = document.getElementById('copy-email-button');
    const copyFeedback = document.getElementById('copy-feedback');
    const emailToCopy = 'metacorerepair@gmail.com';

    copyEmailButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(emailToCopy);
            copyFeedback.textContent = 'Copié !';
            copyFeedback.classList.add('show');
            setTimeout(() => {
                copyFeedback.classList.remove('show');
            }, 2000);
        } catch (err) {
            console.error('Impossible de copier le texte: ', err);
            copyFeedback.textContent = 'Erreur de copie';
            copyFeedback.classList.add('show');
            setTimeout(() => {
                copyFeedback.classList.remove('show');
            }, 2000);
        }
    });
});