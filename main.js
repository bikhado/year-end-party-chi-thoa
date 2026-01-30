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

        // --- AUDIO CONTROLLER ---
        this.audio = {
            intro: new Audio('audio/intro.mp3'),
            activity: new Audio('audio/activity.mp3'),
            party: new Audio('audio/party.mp3'),
            honors: new Audio('audio/honors.mp3'),
            ending: new Audio('audio/ending.mp3')
        };

        // Configure Audio
        Object.values(this.audio).forEach(track => {
            track.loop = true;
            track.volume = 0; // Start silent for fade-in
        });

        this.currentTrack = null;
        this.isMusicPlaying = true; // Auto-play by default

        this.init();
    }

    async init() {
        try {
            const response = await fetch('./src/assets.json');
            this.assets = await response.json();

            this.setupBackground();
            this.generateSlides(); // Build playlist
            this.createControls();

            // Auto-detect music start on first interaction if blocked
            document.addEventListener('click', () => {
                this.resumeAudio();
            }, { once: true });

            // Note: INTRO SEQUENCE handled by nextSlide(0) logic
            this.nextSlide();

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

    // --- AUDIO METHODS ---
    playTrack(trackName) {
        if (!this.isMusicPlaying) return;

        const newTrack = this.audio[trackName];

        // Fix: If blocking happened, currentTrack might be equal but paused.
        if (this.currentTrack === newTrack) {
            if (this.currentTrack.paused) {
                this.currentTrack.play().catch(e => console.log("Audio resume failed:", e));
            }
            return;
        }

        // Fade out current
        if (this.currentTrack) {
            const oldTrack = this.currentTrack;
            gsap.to(oldTrack, { volume: 0, duration: 2, onComplete: () => oldTrack.pause() });
        }

        // Fade in new
        if (newTrack) {
            newTrack.volume = 0; // Ensure start at 0
            newTrack.play().then(() => {
                // Success
                gsap.to(newTrack, { volume: 0.8, duration: 2 });
            }).catch(e => {
                console.log("Audio play blocked. Waiting for interaction.", e);
            });
            this.currentTrack = newTrack;
        }
    }

    toggleMusic() {
        // Fix for "Double Click" issue:
        // If state says "Playing" (default) but audio is actually blocked/paused,
        // treat this click as a "Force Start" instead of "Turn Off".
        if (this.isMusicPlaying && this.currentTrack && this.currentTrack.paused) {
            console.log("Auto-play blocked, user interceded. Resuming.");
            this.resumeAudio();
            // Update button opacity to ensure it looks active
            const btn = document.getElementById('music-toggle');
            if (btn) btn.style.opacity = '1';
            return;
        }

        this.isMusicPlaying = !this.isMusicPlaying;
        const btn = document.getElementById('music-toggle');

        if (this.isMusicPlaying) {
            btn.style.opacity = '1';
            // Trigger logic to play correct track for current slide immediately
            const currentType = this.slides[this.currentIndex]?.type;
            this.handleMusicChange(currentType);
        } else {
            btn.style.opacity = '0.5';
            if (this.currentTrack) {
                const trackToPause = this.currentTrack; // Capture reference
                gsap.to(trackToPause, {
                    volume: 0,
                    duration: 1,
                    onComplete: () => {
                        trackToPause.pause();
                        // Reset volume so it's ready for next play
                        trackToPause.currentTime = 0;
                    }
                });
                this.currentTrack = null;
            }
        }
    }

    handleMusicChange(type) {
        if (!type) return;

        if (type === 'welcome' || type === 'company' || type === 'backdrop') {
            this.playTrack('intro');
        } else if (type === 'activity') {
            this.playTrack('activity');
        } else if (type === 'invitation' || type === 'menu' || type === 'section-title') {
            this.playTrack('party');
        } else if (type === 'honoree' || type === 'honoree-intro') {
            this.playTrack('honors');
        } else if (type === 'thankyou') {
            this.playTrack('ending');
        }
    }

    resumeAudio() {
        if (!this.isMusicPlaying) return;

        // If we have a track but it's paused (likely due to browser policy), try playing it
        if (this.currentTrack && this.currentTrack.paused) {
            this.currentTrack.play().catch(e => console.log("Audio resume failed:", e));
        } else if (!this.currentTrack) {
            // No track yet, start based on current slide
            const currentType = this.slides[this.currentIndex]?.type;
            if (currentType) this.handleMusicChange(currentType);
        }
    }

    generateSlides() {
        // --- 1. INTRO / BACKDROP (Music: On Top of the World) ---
        this.slides.push({
            type: 'backdrop',
            duration: 3000,
            render: () => {
                const div = document.createElement('div');
                div.className = 'slide slide-backdrop';
                return div;
            }
        });

        this.slides.push({
            type: 'welcome',
            duration: 5000,
            render: () => {
                const div = document.createElement('div');
                div.className = 'slide slide-welcome';
                const img = document.createElement('img');
                img.src = 'THIỆP MỜI , LOGO/Welcome.jpg';
                div.appendChild(img);
                return div;
            }
        });

        this.slides.push({
            type: 'company',
            render: () => {
                const div = document.createElement('div');
                div.className = 'slide slide-welcome';
                // User requested TÊN CTY.jpg as the company slide
                const img = document.createElement('img');
                img.src = 'THIỆP MỜI , LOGO/TÊN CTY.jpg';
                img.style.maxWidth = '80%';
                img.style.maxHeight = '80%';
                img.style.objectFit = 'contain';
                img.style.filter = 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))';

                div.appendChild(img);
                return div;
            },
            duration: 4000
        });

        // --- 2. PARTY / INVITATIONS / MENU (Music: Sugar) ---
        // Invitations
        if (this.assets.invitations && this.assets.invitations.length > 0) {
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
            this.assets.invitations.forEach(src => {
                this.slides.push({
                    type: 'invitation',
                    render: () => {
                        const div = document.createElement('div');
                        div.className = 'slide slide-invitation';
                        const img = document.createElement('img');
                        img.src = src;
                        div.appendChild(img);
                        return div;
                    },
                    duration: 4000
                });
            });
        }

        // Menu
        if (this.assets.menu && this.assets.menu.length > 0) {
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
            this.assets.menu.forEach(src => {
                this.slides.push({
                    type: 'menu',
                    render: () => {
                        const div = document.createElement('div');
                        div.className = 'slide slide-menu';
                        const img = document.createElement('img');
                        img.src = src;
                        div.appendChild(img);
                        return div;
                    },
                    duration: 5000
                });
            });
        }

        // --- 3. ACTIVITIES / KHOẢNH KHẮC (Music: Sunday Best) ---
        if (this.assets.activities && this.assets.activities.length > 0) {
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

            // Randomize and limit check
            const shuffled = [...this.assets.activities].sort(() => 0.5 - Math.random());

            // SINGLE IMAGE LAYOUT (Centering Fix)
            shuffled.forEach(src => {
                this.slides.push({
                    type: 'activity',
                    render: () => {
                        const div = document.createElement('div');
                        div.className = 'slide slide-activity-single';

                        // Main Photo (Centered, no cropping)
                        const img = document.createElement('img');
                        img.className = 'activity-photo-single';
                        img.src = src;

                        // Blurred Background
                        const bgDiv = document.createElement('div');
                        bgDiv.className = 'activity-bg-blur';
                        bgDiv.style.backgroundImage = `url(${src})`;
                        div.appendChild(bgDiv);

                        div.appendChild(img);
                        return div;
                    },
                    duration: 4000
                });
            });
        }

        // --- 4. HONOREES / VINH DANH (Music: Hall of Fame) ---
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
                    desc.className = 'honoree-award';
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

        // --- 5. RECAP / THANK YOU (Music: Memories) ---
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
            duration: 10000
        });

        console.log(`Playlist built: ${this.slides.length} slides.`);
    }

    // SKIP SECTION Logic (Added)
    nextSection() {
        let nextIndex = -1;
        // Search for the next 'section-title' or 'thankyou' from current position
        for (let i = this.currentIndex + 1; i < this.slides.length; i++) {
            if (this.slides[i].type === 'section-title' || this.slides[i].type === 'thankyou') {
                nextIndex = i;
                break;
            }
        }

        if (nextIndex !== -1) {
            this.goToSlide(nextIndex);
        } else {
            // If no next section, loop back to start (Intro)
            this.goToSlide(0);
        }
    }

    createControls() {
        // Controls Container
        const controls = document.createElement('div');
        controls.id = 'controls';

        // Helper to create icon buttons
        const createBtn = (icon, onClick, title) => {
            const btn = document.createElement('div');
            btn.className = 'control-btn';
            btn.innerHTML = icon;
            btn.title = title;
            btn.onclick = (e) => {
                e.stopPropagation();
                onClick(btn);
            };
            return btn;
        };

        // Prev
        const prevBtn = createBtn('⏮', () => this.prevSlide(), 'Previous Slide');

        // Pause/Play
        const pauseBtn = createBtn('⏸', (btn) => {
            this.isPlaying = !this.isPlaying;
            btn.innerHTML = this.isPlaying ? '⏸' : '▶';
            if (this.isPlaying) {
                this.nextSlide();
                // Ensure music plays if it was paused or blocked
                this.resumeAudio();
            } else {
                clearTimeout(this.timeout);
            }
        }, 'Pause/Play');

        // Next (Single)
        const nextBtn = createBtn('⏭', () => this.nextSlide(), 'Next Slide');

        // Skip Section (New)
        const skipBtn = createBtn('⏩', () => this.nextSection(), 'Skip to Next Section');
        skipBtn.style.border = '1px solid var(--gold-light)'; // Distinguish slightly

        // Music Toggle (Moved to Controls)
        const musicBtn = createBtn('🎵', () => this.toggleMusic(), 'Toggle Music');
        musicBtn.id = 'music-toggle'; // Keep ID for logic references

        controls.appendChild(prevBtn);
        controls.appendChild(pauseBtn);
        controls.appendChild(nextBtn);
        controls.appendChild(skipBtn);
        controls.appendChild(musicBtn); // <--- Added Music Button to Group

        document.body.appendChild(controls);

        // Auto-play attempt
        document.body.addEventListener('click', () => {
            this.resumeAudio();
        }, { once: true });

        // Try auto-play immediately (might be blocked)
        setTimeout(() => {
            this.resumeAudio();
        }, 1000);
    }

    nextSlide() {
        let index = this.currentIndex + 1;
        if (index >= this.slides.length) index = 0;
        this.goToSlide(index);
    }

    prevSlide() {
        let index = this.currentIndex - 1;
        if (index < 0) index = this.slides.length - 1;
        this.goToSlide(index);
    }

    goToSlide(index) {
        // if (this.isTransitioning) return; // REMOVED LOCK for instant response
        this.isTransitioning = true;

        const currentSlideEl = this.container.querySelector('.slide.active');
        const nextSlideData = this.slides[index];

        // 1. Handle Music
        this.handleMusicChange(nextSlideData.type);

        // 2. Handle Backdrop
        // 2. Handle Backdrop: ONLY visible on Intro/Welcome slides
        if (index === 0) {
            this.bgLayer.classList.remove('dimmed');
            this.bgLayer.style.opacity = '1';
            this.bgFill.style.opacity = '0';
        } else {
            // Hide completely for other slides as requested
            this.bgLayer.classList.add('dimmed');
            this.bgLayer.style.opacity = '0';
            this.bgFill.style.opacity = '0.4';
        }


        // 3. Handle Frame Style
        const frameEl = document.getElementById('global-frame');
        frameEl.className = ''; // Reset

        if (nextSlideData.type === 'invitation' || nextSlideData.type === 'section-title') {
            frameEl.classList.add('frame-type-invitation');
        } else if (nextSlideData.type === 'menu') {
            frameEl.classList.add('frame-type-menu');
        } else if (nextSlideData.type === 'honoree' || nextSlideData.type === 'honoree-intro') {
            frameEl.classList.add('frame-type-honoree');
        } else if (nextSlideData.type === 'activity') {
            frameEl.classList.add('frame-type-activity');
        } else if (nextSlideData.type === 'welcome' || nextSlideData.type === 'company' || nextSlideData.type === 'backdrop') {
            frameEl.classList.add('frame-type-welcome');
        }

        // 4. Render & Animate
        const nextSlideEl = nextSlideData.render();
        this.container.appendChild(nextSlideEl);

        let fromProps = { opacity: 0, scale: 0.8 };
        let toProps = { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" };

        // Random animation (Default)
        const animType = Math.floor(Math.random() * 5);
        if (animType === 0) { fromProps = { opacity: 0, scale: 1.5 }; toProps.scale = 1; }
        else if (animType === 1) { fromProps = { opacity: 0, x: 200 }; toProps.x = 0; }
        else if (animType === 2) { fromProps = { opacity: 0, y: 100 }; toProps.y = 0; }
        else if (animType === 3) { fromProps = { opacity: 0, rotationY: 90 }; toProps.rotationY = 0; }

        // OVERRIDE: Force smooth Fade for Activity Slides (Fix performance/smoothness)
        if (nextSlideData.type === 'activity') {
            fromProps = { opacity: 0, scale: 1.05 };
            toProps = { opacity: 1, scale: 1, duration: 2.0, ease: "power2.out" };
        }

        // Kill any ongoing animations on the container to prevent conflicts
        gsap.killTweensOf(this.container.children);

        gsap.fromTo(nextSlideEl, fromProps, toProps);

        if (currentSlideEl) {
            // Immediate removal for snappy feel, or very fast fade
            gsap.to(currentSlideEl, {
                opacity: 0,
                duration: 0.3, // Much faster exit
                onComplete: () => currentSlideEl.remove()
            });
            currentSlideEl.classList.remove('active');
        }

        nextSlideEl.classList.add('active');
        this.currentIndex = index;

        // Unlock transition immediately (or remove flag entirely if not needed)
        this.isTransitioning = false;

        // Schedule next
        if (this.isPlaying) {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.nextSlide();
            }, nextSlideData.duration);
        }
    }
}

new Slideshow();
