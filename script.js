/* script.js */
document.addEventListener('DOMContentLoaded', async () => {
    
    const BASE_URL = 'https://ddragon.leagueoflegends.com';
    let currentVersion = '14.1.1'; 
    let championsList = [];
    let displayedCount = 0;
    const ITEMS_PER_PAGE = 20;

    const grid = document.getElementById('championGrid');
    const loader = document.getElementById('loader');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const searchInput = document.getElementById('searchInput');
    const modal = document.getElementById('championModal');
    
    try {
        const versionResponse = await fetch(`${BASE_URL}/api/versions.json`);
        const versions = await versionResponse.json();
        currentVersion = versions[0];

        const dataResponse = await fetch(`${BASE_URL}/cdn/${currentVersion}/data/fr_FR/champion.json`);
        const data = await dataResponse.json();
        
        championsList = Object.values(data.data);
        
        loader.classList.add('hidden');
        grid.classList.remove('hidden');
        renderChampions(0, ITEMS_PER_PAGE);
        loadMoreBtn.classList.remove('hidden');

    } catch (error) {
        console.error("Erreur API:", error);
        loader.innerHTML = `<p class="text-red-500">Impossible de charger les données.</p>`;
    }

    function renderChampions(start, end, filterText = '') {
        let filtered = championsList;
        if (filterText) {
            filtered = championsList.filter(c => c.name.toLowerCase().includes(filterText.toLowerCase()));
            grid.innerHTML = ''; 
        }

        const toShow = filterText ? filtered : filtered.slice(start, end);

        toShow.forEach(champ => {
            const card = document.createElement('article');
            card.className = "group relative bg-lol-darker border border-gray-800 rounded-lg overflow-hidden hover:border-lol-gold hover:-translate-y-2 transition-all duration-300 cursor-pointer shadow-lg";
            
            const imgUrl = `${BASE_URL}/cdn/img/champion/loading/${champ.id}_0.jpg`;
            
            // OPTIMISATION : Ajout de width/height explicites pour le CLS
            card.innerHTML = `
                <div class="aspect-[308/560] overflow-hidden relative">
                    <img src="${imgUrl}" 
                        alt="${champ.name}" 
                        width="308" 
                        height="560"
                        loading="lazy"
                        crossorigin="anonymous" 
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                    <div class="absolute inset-0 bg-gradient-to-t from-lol-darker via-transparent to-transparent opacity-90"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-4">
                        <h4 class="text-xl font-bold text-gray-100 group-hover:text-lol-gold transition-colors">${champ.name}</h4>
                        <p class="text-xs text-lol-blue uppercase tracking-wider">${champ.title}</p>
                    </div>
                </div>
            `;
            
            card.addEventListener('click', () => openModal(champ));
            grid.appendChild(card);
        });

        if (!filterText) {
            displayedCount = end;
            if (displayedCount >= championsList.length) {
                loadMoreBtn.classList.add('hidden');
            } else {
                loadMoreBtn.classList.remove('hidden');
            }
        } else {
            loadMoreBtn.classList.add('hidden');
        }
    }

    searchInput.addEventListener('input', (e) => {
        const text = e.target.value;
        if (text.length > 0) {
            renderChampions(0, championsList.length, text);
        } else {
            grid.innerHTML = '';
            displayedCount = 0;
            renderChampions(0, ITEMS_PER_PAGE);
        }
    });

    loadMoreBtn.addEventListener('click', () => {
        renderChampions(displayedCount, displayedCount + ITEMS_PER_PAGE);
    });

    function openModal(champ) {
        document.getElementById('modalName').textContent = champ.name;
        document.getElementById('modalTitle').textContent = champ.title;
        document.getElementById('modalDesc').textContent = champ.blurb;
        
        document.getElementById('statAtk').textContent = champ.info.attack;
        document.getElementById('statDef').textContent = champ.info.defense;
        document.getElementById('statMag').textContent = champ.info.magic;
        document.getElementById('statDiff').textContent = champ.info.difficulty;

        const splashUrl = `${BASE_URL}/cdn/img/champion/splash/${champ.id}_0.jpg`;
        document.getElementById('modalImgContainer').style.backgroundImage = `url('${splashUrl}')`;

        const tagsContainer = document.getElementById('modalTags');
        tagsContainer.innerHTML = '';
        champ.tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = "px-3 py-1 bg-lol-blue/20 text-lol-blue border border-lol-blue/50 text-xs rounded font-bold uppercase";
            span.textContent = tag;
            tagsContainer.appendChild(span);
        });

        const guideBtn = document.getElementById('guideLink');
        guideBtn.href = `guide.html?id=${champ.id}`;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
    }

    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', closeModal);

    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('flex');
    });

    const details = document.querySelectorAll("#faq details");
    details.forEach((targetDetail) => {
        targetDetail.addEventListener("click", () => {
            details.forEach((detail) => {
                if (detail !== targetDetail) {
                    detail.removeAttribute("open");
                }
            });
        });
    });
});