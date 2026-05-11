document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('active'));
    });

    // 2. Reveal animations on scroll
    const revealElements = document.querySelectorAll('.service-card, .feature-item, .product-card, .about-content, .about-image, .mission-item, .vision-image');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => observer.observe(el));

    // 3. Scroll Top Button
    const scrollTopBtn = document.querySelector('.scroll-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            scrollTopBtn.style.display = window.scrollY > 500 ? 'flex' : 'none';
        });
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // 4. Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === "#" || targetId === "") return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 120;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });

    // 5. Active Navigation Link on Scroll
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.scrollY + 200;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        navItems.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) link.classList.add('active');
        });
    });

    // 6. Testimonial Slider
    const dots = document.querySelectorAll('.dot');
    const slider = document.querySelector('.testimonial-slider');
    
    if (dots.length && slider) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const cardWidth = document.querySelector('.testimonial-card')?.offsetWidth || 350;
                slider.scrollTo({ left: index * (cardWidth + 30), behavior: 'smooth' });
                dots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
            });
        });
    }

    // 7. Enhanced Chatbot
    class GagangiriChatbot {
        constructor() {
            this.messagesContainer = document.getElementById('chatbotMessages');
            this.input = document.getElementById('chatbotInput');
            this.sendBtn = document.getElementById('chatbotSendBtn');
            this.trigger = document.getElementById('chatbotTrigger');
            this.widget = document.getElementById('chatbot-widget');
            this.minimizeBtn = document.querySelector('.chatbot-minimize');
            this.closeBtn = document.querySelector('.chatbot-close');
            this.typingIndicator = document.getElementById('chatbotTyping');
            this.quickReplies = document.querySelectorAll('.quick-reply');
            this.init();
        }
        
        init() {
            this.trigger.addEventListener('click', () => this.openChat());
            if (this.minimizeBtn) this.minimizeBtn.addEventListener('click', () => this.minimizeChat());
            if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.closeChat());
            this.sendBtn.addEventListener('click', () => this.sendMessage());
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            this.input.addEventListener('input', () => {
                this.input.style.height = 'auto';
                this.input.style.height = Math.min(this.input.scrollHeight, 100) + 'px';
            });
            this.quickReplies.forEach(btn => {
                btn.addEventListener('click', () => this.handleQuickReply(btn.getAttribute('data-question')));
            });
        }
        
        openChat() {
            this.widget.classList.remove('chatbot-closed');
            this.widget.classList.add('chatbot-open');
            this.trigger.style.display = 'none';
            const badge = document.querySelector('.chatbot-badge');
            if (badge) badge.style.display = 'none';
        }
        
        minimizeChat() {
            this.widget.classList.add('chatbot-closed');
            this.widget.classList.remove('chatbot-open');
            this.trigger.style.display = 'flex';
        }
        
        closeChat() {
            this.widget.classList.add('chatbot-closed');
            this.widget.classList.remove('chatbot-open');
            this.trigger.style.display = 'flex';
        }
        
        async sendMessage() {
            const message = this.input.value.trim();
            if (!message) return;
            this.addMessage(message, 'user');
            this.input.value = '';
            this.input.style.height = 'auto';
            this.showTyping();
            
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: message })
                });
                
                const data = await response.json();
                this.hideTyping();
                
                if (data.response) {
                    this.addMessage(data.response, 'bot');
                } else if (data.error) {
                    this.addMessage("⚠️ " + data.error, 'bot');
                } else {
                    this.addMessage("⚠️ Sorry, I could not process your request.", 'bot');
                }
            } catch (error) {
                console.error('Error:', error);
                this.hideTyping();
                this.addMessage("⚠️ Network error. Please try again later.", 'bot');
            }
            this.scrollToBottom();
        }
        
        handleQuickReply(question) {
            const messages = {
                prices: 'What are your water bottle prices?',
                delivery: 'Tell me about delivery services',
                process: 'Explain your purification process',
                contact: 'Share contact details'
            };
            if (messages[question]) {
                this.input.value = messages[question];
                this.sendMessage();
            }
        }
        
        addMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender === 'user' ? 'user-message' : 'bot-message'}`;
            
            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user" style="color: #00C2FF;"></i>' : '<img src="assets/1.png" alt="Bot">';
            
            const content = document.createElement('div');
            content.className = 'message-content';
            
            const textDiv = document.createElement('div');
            textDiv.className = 'message-text';
            textDiv.innerHTML = text.replace(/\n/g, '<br>');
            
            const time = document.createElement('div');
            time.className = 'message-time';
            time.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            
            content.appendChild(textDiv);
            content.appendChild(time);
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(content);
            this.messagesContainer.appendChild(messageDiv);
            this.scrollToBottom();
        }
        
        showTyping() { this.typingIndicator.style.display = 'flex'; this.scrollToBottom(); }
        hideTyping() { this.typingIndicator.style.display = 'none'; }
        scrollToBottom() { this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight; }
    }
    
    new GagangiriChatbot();
});