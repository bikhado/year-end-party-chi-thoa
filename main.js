import { gsap } from 'gsap';

class Slideshow {
    constructor() {
        this.container = document.getElementById('slides-container');
        this.bgLayer = document.getElementById('bg-layer');
        this.bgFill = document.getElementById('bg-fill');
        this.assets = null;
        this.slides = [];
        this.currentIndex = -1;
        this.isPlaying = true;
        this.interval = null;
        this.slideDuration = 5000;

        this.init();
    }

    async init() {
        try {
            const response = await fetch('./src/assets.json');
            this.assets = await response.json();

            this.setupBackground();
            this.buildPlaylist();
            this.setupControls();

            // INTRO SEQUENCE
            setTimeout(() => {
                this.bgLayer.classList.add('dimmed');
                setTimeout(() => {
                    this.nextSlide();
                }, 1000);
            }, 3000);

        } catch (e) {
            console.error("Failed to load assets", e);
        }
    }

    setupBackground() {
        if (this.assets.backdrop) {
            const url = `url('./${this.assets.backdrop}')`;
            this.bgLayer.style.backgroundImage = url;
            if (this.bgFill) this.bgFill.style.backgroundImage = url;
        }
    }

    buildPlaylist() {
        // 1. Welcome Slide (Explicitly use Welcome.jpg if available)
        if (this.assets.welcome) {
            this.slides.push({
                type: 'welcome',
                render: () => {
                    const div = document.createElement('div');
                    div.className = 'slide slide-welcome';
                    const img = document.createElement('img');
                    img.src = `./${this.assets.welcome}`;
                    div.appendChild(img);
                    return div;
                },
                duration: 6000
            });
        }

        // 1b. Company Name / Logo (If distinct from Welcome, or fallback)
        this.slides.push({
            type: 'company',
            render: () => {
                const div = document.createElement('div');
                div.className = 'slide slide-welcome';
                if (this.assets.company) {
                    const img = document.createElement('img');
                    img.src = `./${this.assets.company}`;
                    div.appendChild(img);
                } else {
                    const h1 = document.createElement('h1');
                    h1.textContent = 'Welcome';
                    div.appendChild(h1);
                }
                return div;
            },
            duration: 5000
        });

        // 2. Invitations
        if (this.assets.invitations && this.assets.invitations.length > 0) {
            // Section Title
            this.slides.push({
                type: 'section-title',
                render: () => {
                    const div = document.createElement('div');
                    div.className = 'slide slide-section-title';
                    const h1 = document.createElement('h1');
                    h1.textContent = 'THƯ MỜI';
                    div.appendChild(h1);
                    return div;
                },
                duration: 3000
            });

            this.assets.invitations.forEach(inviteUrl => {
                this.slides.push({
                    type: 'invitation',
                    render: () => {
                        const div = document.createElement('div');
                        div.className = 'slide slide-invitation';
                        const img = document.createElement('img');
                        img.src = `./${inviteUrl}`;
                        div.appendChild(img);
                        return div;
                    },
                    duration: 5000
                });
            });
        }

        // 3. Menus
        if (this.assets.menu && this.assets.menu.length > 0) {
            // Section Title
            this.slides.push({
                type: 'section-title',
                render: () => {
                    const div = document.createElement('div');
                    div.className = 'slide slide-section-title';
                    const h1 = document.createElement('h1');
                    h1.textContent = 'THỰC ĐƠN';
                    div.appendChild(h1);
                    return div;
                },
                duration: 3000
            });

            this.assets.menu.forEach(menuUrl => {
                this.slides.push({
                    type: 'menu',
                    render: () => {
                        const div = document.createElement('div');
                        div.className = 'slide slide-menu';
                        const img = document.createElement('img');
                        img.className = 'fullscreen-img';
                        img.style.objectFit = 'contain';
                        img.src = `./${menuUrl}`;
                        div.appendChild(img);
                        return div;
                    },
                    duration: 6000
                });
            });
        }

        // 4. Honorees (Top 10 - 10 Years Service)
        const top10Honorees = [
            "TRAN HONG CHIEN",
            "NGUYEN THI HONG LOAN | SYDNEY",
            "NGUYEN PHAN QUOC THANH",
            "VU THU THUY | PAIGE",
            "MAI THI LIEU | DONISH",
            "NGO THI THU HIEN | WINDY",
            "NGUYEN THI MINH THOA | HELEN",
            "DANG THI THO | JENNY",
            "PHAM VAN BINH | BILL",
            "TRAN THI HAI HANH | HANA"
        ];

        // Section Title
        this.slides.push({
            type: 'section-title',
            render: () => {
                const div = document.createElement('div');
                div.className = 'slide slide-section-title';
                const h1 = document.createElement('h1');
                h1.textContent = 'VINH DANH';
                div.appendChild(h1);
                return div;
            },
            duration: 3000
        });

        // 10 Years Service Intro Slide
        this.slides.push({
            type: 'honoree-intro',
            render: () => {
                const div = document.createElement('div');
                div.className = 'slide slide-honorees';
                div.style.textAlign = 'center';

                const h2 = document.createElement('h2');
                h2.className = 'honoree-title';
                h2.textContent = 'KỶ NIỆM 10 NĂM CỐNG HIẾN';
                h2.style.fontSize = '4rem';
                h2.style.margin = '0';
                h2.style.border = 'none';

                div.appendChild(h2);
                return div;
            },
            duration: 4000
        });

        top10Honorees.forEach(name => {
            this.slides.push({
                type: 'honoree',
                render: () => {
                    const div = document.createElement('div');
                    div.className = 'slide slide-honorees';
                    const card = document.createElement('div');
                    card.className = 'honoree-card';

                    const title = document.createElement('div');
                    title.className = 'honoree-title';
                    title.textContent = 'PRESENTED TO';
                    title.style.fontSize = '2rem';
                    title.style.borderBottom = '1px solid var(--gold)';

                    const nameEl = document.createElement('div');
                    nameEl.className = 'honoree-name';
                    nameEl.textContent = name;

                    const desc = document.createElement('div');
                    desc.className = 'honoree-award'; // Using existing class for styling
                    desc.innerHTML = `
                        Celebrating over 10 years of loyal service.<br>
                        Thank you from all your friends and colleagues
                    `;
                    desc.style.marginTop = '2rem';
                    desc.style.lineHeight = '1.6';

                    card.appendChild(title);
                    card.appendChild(nameEl);
                    card.appendChild(desc);
                    div.appendChild(card);
                    return div;
                },
                duration: 7000
            });
        });

        // 5. Activities
        if (this.assets.activities && this.assets.activities.length > 0) {
            // Section Title
            this.slides.push({
                type: 'section-title',
                render: () => {
                    const div = document.createElement('div');
                    div.className = 'slide slide-section-title';
                    const h1 = document.createElement('h1');
                    h1.textContent = 'KHOẢNH KHẮC';
                    div.appendChild(h1);
                    return div;
                },
                duration: 3000
            });

            const actCount = 30; // Increased count
            const shuffled = [...this.assets.activities].sort(() => 0.5 - Math.random());

            shuffled.slice(0, actCount).forEach(url => {
                this.slides.push({
                    type: 'activity',
                    render: () => {
                        const div = document.createElement('div');
                        div.className = 'slide slide-activity-single';
                        const img = document.createElement('img');
                        img.src = `./${url}`;
                        img.className = 'fullscreen-img';
                        div.appendChild(img);
                        return div;
                    },
                    duration: 4000
                });
            });
        }



        // 6. Thank You Slide
        this.slides.push({
            type: 'thankyou',
            render: () => {
                const div = document.createElement('div');
                div.className = 'slide slide-thankyou';
                const h1 = document.createElement('h1');
                h1.textContent = 'THANK YOU';

                const sub = document.createElement('div');
                sub.style.color = "var(--gold)";
                sub.style.marginTop = "20px";
                sub.style.fontSize = "2rem";
                sub.textContent = "See you next year!";

                div.appendChild(h1);
                div.appendChild(sub);
                return div;
            },
            duration: 8000
        });

        console.log(`Playlist built: ${this.slides.length} slides.`);
    }

    setupControls() {
        document.getElementById('btn-next').onclick = () => { this.resetTimer(); this.nextSlide(); };
        document.getElementById('btn-prev').onclick = () => { this.resetTimer(); this.prevSlide(); };
        document.getElementById('btn-pause').onclick = () => {
            this.isPlaying = !this.isPlaying;
            document.getElementById('btn-pause').textContent = this.isPlaying ? "Pause" : "Play";
            if (this.isPlaying) this.nextSlide();
            else clearTimeout(this.timeout);
        };
    }

    resetTimer() {
        clearTimeout(this.timeout);
    }

    async nextSlide() {
        let next = this.currentIndex + 1;
        if (next >= this.slides.length) next = 0;
        await this.goToSlide(next);
    }

    async prevSlide() {
        let prev = this.currentIndex - 1;
        if (prev < 0) prev = this.slides.length - 1;
        await this.goToSlide(prev);
    }

    async goToSlide(index) {
        if (index === this.currentIndex) return;

        const currentSlideEl = this.container.querySelector('.slide.active');
        const nextSlideData = this.slides[index];

        // Create new DOM
        const nextSlideEl = nextSlideData.render();
        this.container.appendChild(nextSlideEl);

        // Random Animation Strategy
        const animType = Math.floor(Math.random() * 5); // 0 to 4

        // Default Enter props
        let fromProps = { opacity: 0, scale: 0.8 };
        let toProps = { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" };

        switch (animType) {
            case 0: // Zoom In
                fromProps = { opacity: 0, scale: 1.5 };
                toProps.scale = 1;
                break;
            case 1: // Slide from Right
                fromProps = { opacity: 0, x: 200, scale: 1 };
                toProps.x = 0;
                break;
            case 2: // Slide from Bottom
                fromProps = { opacity: 0, y: 100, scale: 1 };
                toProps.y = 0;
                break;
            case 3: // Rotate/Flip
                fromProps = { opacity: 0, rotationY: 90 };
                toProps.rotationY = 0;
                break;
            default: // Basic Fade/Scale
                break;
        }

        // Frame Logic
        const frameEl = document.getElementById('global-frame');
        // Reset classes
        frameEl.className = '';

        // Add specific class based on slide type
        if (nextSlideData.type === 'invitation' || nextSlideData.type === 'section-title') {
            frameEl.classList.add('frame-type-invitation');
        } else if (nextSlideData.type === 'menu') {
            frameEl.classList.add('frame-type-menu');
        } else if (nextSlideData.type === 'honoree' || nextSlideData.type === 'honoree-intro') {
            frameEl.classList.add('frame-type-honoree');
        } else if (nextSlideData.type === 'activity') {
            frameEl.classList.add('frame-type-activity');
        } else if (nextSlideData.type === 'welcome' || nextSlideData.type === 'company') {
            frameEl.classList.add('frame-type-welcome');
        }

        gsap.fromTo(nextSlideEl, fromProps, toProps);

        // Exit old
        if (currentSlideEl) {
            gsap.to(currentSlideEl, {
                opacity: 0,
                scale: 0.9,
                x: -50,
                duration: 1.0,
                onComplete: () => currentSlideEl.remove()
            });
            currentSlideEl.classList.remove('active');
        }

        nextSlideEl.classList.add('active');
        this.currentIndex = index;

        // Schedule next
        if (this.isPlaying) {
            this.timeout = setTimeout(() => {
                this.nextSlide();
            }, nextSlideData.duration);
        }
    }
}

new Slideshow();
