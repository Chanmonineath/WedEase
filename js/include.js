// Function to include HTML components
function includeHTML() {
    const elements = document.querySelectorAll('[data-include]');
    
    elements.forEach(element => {
        const file = element.getAttribute('data-include');
        
        fetch(file)
            .then(response => {
                if (!response.ok) throw new Error(`Could not load ${file}`);
                return response.text();
            })
            .then(data => {
                element.innerHTML = data;
                
                // Update active navigation link based on current page
                updateActiveNav();
            })
            .catch(error => {
                console.error('Error including HTML:', error);
                element.innerHTML = '<p>Component loading error</p>';
            });
    });
}

// Update active navigation link
function updateActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', includeHTML);