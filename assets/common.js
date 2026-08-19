document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('track');
    const sections = document.querySelectorAll('.sec');
    const wrapper = document.getElementById('wrapper');
    const ndots = document.getElementById('ndots');
    const avatarVideo = document.querySelector('#hero video');

    if (!track || sections.length === 0) return;

    let currentSection = 0;
    let isScrolling = false;

    const setSectionHeights = () => {
        const h = window.innerHeight;
        sections.forEach((sec, i) => {
            sec.style.height = h + 'px';
            // Инициализируем видимость секций: показываем только текущую
            if (i === currentSection) {
                sec.style.visibility = 'visible';
            } else {
                sec.style.visibility = 'hidden';
            }
        });
    };
    setSectionHeights();

    const triggerAnimations = (index) => {
        sections.forEach((sec, i) => {
            const anims = sec.querySelectorAll('.anim');
            if (i === index) {
                anims.forEach((el, idx) => {
                    setTimeout(() => {
                        el.classList.add('in');
                    }, idx * 100);
                });
            }
        });
        updateDots(index);
    };

    const scrollToSection = (index) => {
        if (index >= 0 && index < sections.length) {
            currentSection = index;
            
            // Показываем целевую секцию перед анимацией скролла
            sections[index].style.visibility = 'visible';

            // Управление воспроизведением видео-аватарки
            if (avatarVideo) {
                if (index === 0) {
                    avatarVideo.play().catch(() => {});
                } else {
                    avatarVideo.pause();
                }
            }

            const offset = sections[index].offsetTop;
            track.style.transform = `translateY(-${offset}px)`;
            triggerAnimations(currentSection);

            setTimeout(() => {
                isScrolling = false;
                // Скрываем все неактивные секции после завершения анимации
                sections.forEach((sec, i) => {
                    if (i === currentSection) {
                        sec.style.visibility = 'visible';
                    } else {
                        sec.style.visibility = 'hidden';
                    }
                });
            }, 900);
        } else {
            isScrolling = false;
        }
    };

    window.addEventListener('wheel', (e) => {
        if (isScrolling) return;

        const si = e.target.closest('.si');
        if (si) {
            const up = e.deltaY < 0;
            const down = e.deltaY > 0;
            if (down && Math.ceil(si.scrollTop + si.clientHeight) < si.scrollHeight) return;
            if (up && si.scrollTop > 0) return;
        }

        isScrolling = true;
        if (e.deltaY > 0) scrollToSection(currentSection + 1);
        else scrollToSection(currentSection - 1);
    }, { passive: true });

    let startY = 0;
    let touchTarget = null;
    window.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        touchTarget = e.target;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (isScrolling) return;
        let endY = e.changedTouches[0].clientY;
        let diff = startY - endY;

        const si = touchTarget ? touchTarget.closest('.si') : null;
        if (si) {
            const up = diff < 0;
            const down = diff > 0;
            if (down && Math.ceil(si.scrollTop + si.clientHeight) < si.scrollHeight) return;
            if (up && si.scrollTop > 0) return;
        }

        if (Math.abs(diff) > 60) {
            isScrolling = true;
            if (diff > 0) scrollToSection(currentSection + 1);
            else scrollToSection(currentSection - 1);
        }
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
        if (isScrolling) return;
        const si = sections[currentSection] ? sections[currentSection].querySelector('.si') : null;

        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
            if (si && Math.ceil(si.scrollTop + si.clientHeight) < si.scrollHeight) return;
            e.preventDefault();
            isScrolling = true;
            scrollToSection(currentSection + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            if (si && si.scrollTop > 0) return;
            e.preventDefault();
            isScrolling = true;
            scrollToSection(currentSection - 1);
        }
    });

    if (ndots) {
        sections.forEach((sec, i) => {
            const dot = document.createElement('div');
            dot.className = 'nd' + (i === 0 ? ' on' : '');
            dot.addEventListener('click', () => {
                if (!isScrolling) {
                    isScrolling = true;
                    scrollToSection(i);
                }
            });
            ndots.appendChild(dot);
        });
    }

    function updateDots(index) {
        if (!ndots) return;
        const allDots = ndots.querySelectorAll('.nd');
        allDots.forEach((d, i) => {
            if (i === index) d.classList.add('on');
            else d.classList.remove('on');
        });
    }

    window.addEventListener('resize', () => {
        setSectionHeights();
        const offset = sections[currentSection].offsetTop;
        track.style.transition = 'none';
        track.style.transform = `translateY(-${offset}px)`;
        setTimeout(() => { track.style.transition = ''; }, 50);
    });

    const PARTICLE_ASSETS = {
        winter: ["https://chat.yufic.ru/assets/winter1.png", "https://chat.yufic.ru/assets/winter2.png"],
        spring: ["https://chat.yufic.ru/assets/spring1.png", "https://chat.yufic.ru/assets/spring2.png"],
        summer: ["https://chat.yufic.ru/assets/summer1.png", "https://chat.yufic.ru/assets/summer2.png"],
        autumn: ["https://chat.yufic.ru/assets/autumn1.png", "https://chat.yufic.ru/assets/autumn2.png"]
    };

    function getSeasonKey() {
        const m = new Date().getMonth();
        if (m === 11 || m === 0 || m === 1) return "winter";
        if (m >= 2 && m <= 4) return "spring";
        if (m >= 5 && m <= 7) return "summer";
        return "autumn";
    }

    const initParticles = () => {
        const container = document.getElementById('snow-container');
        if (!container) return;
        
        const isMobile = window.innerWidth <= 768 || navigator.userAgent.match(/Android|iPhone|iPad|iPod/i);
        const count = isMobile ? 8 : 20;
        
        const season = getSeasonKey();
        const images = PARTICLE_ASSETS[season] || [];
        if (!images.length) return;
        const animations = [];

        for (let i = 0; i < count; i++) {
            const flake = document.createElement('div');
            flake.className = 'snowflake';
            const size = Math.random() * 12 + 10;
            flake.style.width = size + 'px';
            flake.style.height = size + 'px';
            flake.style.left = Math.random() * 100 + 'vw';
            flake.style.top = '-10vh';

            const img = document.createElement('img');
            img.src = images[Math.floor(Math.random() * images.length)];
            img.style.width = '100%';
            img.style.opacity = Math.random() * 0.2 + 0.15;

            flake.appendChild(img);
            container.appendChild(flake);

            const duration = Math.random() * 15 + 15;
            const delay = Math.random() * -30;

            const anim = flake.animate([
                { transform: `translateY(0) translateX(0) rotate(0deg)`, opacity: 0 },
                { opacity: 0.8, offset: 0.1 },
                { transform: `translateY(110vh) translateX(${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: duration * 1000,
                delay: delay * 1000,
                iterations: Infinity,
                easing: 'linear'
            });
            animations.push(anim);
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                animations.forEach(a => { if (a.playState === 'running') a.pause(); });
            } else {
                animations.forEach(a => { if (a.playState === 'paused') a.play(); });
            }
        });
    };
    initParticles();

    document.querySelectorAll('.btn-top').forEach(btn => {
        btn.addEventListener('click', () => scrollToSection(0));
    });

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href').substring(1);
            if (!targetId) return;
            e.preventDefault();
            const index = Array.from(sections).findIndex(s => s.id === targetId);
            if (index !== -1) scrollToSection(index);
        });
    });

    document.querySelectorAll('a:not([target="_blank"]):not([href^="#"]):not(.btn-top)').forEach(a => {
        a.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.href;
            document.body.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            document.body.style.opacity = '0';
            document.body.style.transform = 'translateY(10px)';
            setTimeout(() => { window.location.href = href; }, 500);
        });
    });

    // Carousel Helper
    function setupCarousel(trackSelector, slideSelector, dotSelector, prevBtnSelector, nextBtnSelector, viewportSelector) {
        const track = document.querySelector(trackSelector);
        const slides = document.querySelectorAll(slideSelector);
        const dots = document.querySelectorAll(dotSelector);
        const prevBtn = document.querySelector(prevBtnSelector);
        const nextBtn = document.querySelector(nextBtnSelector);
        const viewport = document.querySelector(viewportSelector);

        if (!track || slides.length === 0) return;

        let currentIndex = 0;
        const totalSlides = slides.length;

        const updateCarousel = () => {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            dots.forEach((dot, idx) => {
                if (idx === currentIndex) dot.classList.add('active');
                else dot.classList.remove('active');
            });
        };

        const nextSlide = () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateCarousel();
        };

        const prevSlide = () => {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateCarousel();
        };

        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                currentIndex = idx;
                updateCarousel();
            });
        });

        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isDragging = false;
        let hasMoved = false;

        const getPositionX = (event) => {
            return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        };

        const getPositionY = (event) => {
            return event.type.includes('mouse') ? event.pageY : event.touches[0].clientY;
        };

        const dragStart = (event) => {
            if (event.target.closest('.dash-carousel-arrow, .about-carousel-arrow, .links-carousel-arrow') || 
                event.target.closest('.dash-dot, .about-dot, .links-dot') || 
                event.target.closest('.refresh-btn, .music-icon-btn, .play-btn')) return;
            isDragging = true;
            hasMoved = false;
            startX = getPositionX(event);
            startY = getPositionY(event);
            currentX = startX;
            currentY = startY;
            track.style.transition = 'none';
        };

        const dragMove = (event) => {
            if (!isDragging) return;
            currentX = getPositionX(event);
            currentY = getPositionY(event);
            const diffX = currentX - startX;
            const diffY = currentY - startY;

            if (Math.abs(diffX) > 5) {
                hasMoved = true;
            }

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (event.cancelable) event.preventDefault();
            }

            const translate = -currentIndex * viewport.offsetWidth + diffX;
            track.style.transform = `translateX(${translate}px)`;
        };

        const dragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            track.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';

            const diffX = currentX - startX;

            if (diffX < -50) {
                nextSlide();
            } else if (diffX > 50) {
                prevSlide();
            } else {
                updateCarousel();
            }
            setTimeout(() => {
                hasMoved = false;
            }, 50);
            startX = 0;
            currentX = 0;
        };

        track.addEventListener('dragstart', (e) => e.preventDefault());

        track.addEventListener('click', (e) => {
            if (hasMoved) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);

        track.addEventListener('touchstart', dragStart, { passive: false });
        track.addEventListener('touchmove', dragMove, { passive: false });
        track.addEventListener('touchend', dragEnd);

        track.addEventListener('mousedown', dragStart);
        window.addEventListener('mousemove', dragMove);
        window.addEventListener('mouseup', dragEnd);

        window.addEventListener('resize', () => {
            track.style.transition = 'none';
            updateCarousel();
            setTimeout(() => {
                track.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            }, 50);
        });
    }

    // Initialize Carousels
    setupCarousel('.about-carousel-track', '.about-slide', '.about-dot', '.about-carousel-arrow.prev', '.about-carousel-arrow.next', '.about-carousel-viewport');
    setupCarousel('.links-carousel-track', '.links-slide', '.links-dot', '.links-carousel-arrow.prev', '.links-carousel-arrow.next', '.links-carousel-viewport');
    setupCarousel('.dash-carousel-track', '.dash-slide', '.dash-dot', '.dash-carousel-arrow.prev', '.dash-carousel-arrow.next', '.dash-carousel-viewport');

    // Initial trigger animations
    setTimeout(() => triggerAnimations(0), 100);
});
