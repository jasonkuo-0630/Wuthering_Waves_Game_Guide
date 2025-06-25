class CharactersList {
    constructor() {
        this.characters = [];
        this.filteredCharacters = [];
        this.filters = {
            element: 'all',
            affiliation: 'all',
            rarity: 'all',
            weapon: 'all'
        };
        this.searchQuery = '';
        this.sortOrder = 'rarity';
        
        this.init();
    }
    
    async init() {
        await this.loadCharacters();
        this.setupEventListeners();
        this.renderCharacters();
        this.updateResultsCount();
    }
    
    async loadCharacters() {
        try {
            const response = await fetch('../../assets/data/characters.json');
            this.characters = await response.json();
            this.filteredCharacters = [...this.characters];
        } catch (error) {
            console.error('載入角色資料失敗:', error);
            // 顯示錯誤訊息
            const grid = document.getElementById('charactersGrid');
            if (grid) {
                grid.innerHTML = `
                    <div class="no-results">
                        <div class="no-results-icon">❌</div>
                        <h3>載入角色資料失敗</h3>
                        <p>請檢查網路連線或重新整理頁面</p>
                    </div>
                `;
            }
        }
    }
    
    setupEventListeners() {
        // 篩選器事件
        Object.keys(this.filters).forEach(key => {
            const element = document.getElementById(`filter-${key}`);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.filters[key] = e.target.value;
                    this.applyFilters();
                });
            }
        });
        
        // 排序事件
        const sortSelect = document.getElementById('sort-order');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortOrder = e.target.value;
                this.applySorting();
                this.renderCharacters();
            });
        }
        
        // 搜尋框事件
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim();
                this.applyFilters();
            });
        }
        
        // 重置按鈕
        const resetBtn = document.getElementById('reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }
    }
    
    applyFilters() {
        this.filteredCharacters = this.characters.filter(char => {
            // 篩選器條件
            const matchesFilters = Object.keys(this.filters).every(key => {
                if (this.filters[key] === 'all') return true;
                return key === 'rarity' 
                    ? char[key] === parseInt(this.filters[key])
                    : char[key] === this.filters[key];
            });
            
            // 搜尋條件
            const matchesSearch = this.searchQuery === '' || 
                char.name.toLowerCase().includes(this.searchQuery.toLowerCase());
            
            return matchesFilters && matchesSearch;
        });
        
        this.applySorting();
        this.renderCharacters();
        this.updateResultsCount();
    }
    
    applySorting() {
        this.filteredCharacters.sort((a, b) => {
            switch (this.sortOrder) {
                case 'rarity':
                    // 先按稀有度降序，再按名稱
                    if (a.rarity !== b.rarity) {
                        return b.rarity - a.rarity;
                    }
                    return a.name.localeCompare(b.name, 'zh-TW');
                    
                case 'release':
                    // 按出場時間降序（最新的在前）
                    const dateA = new Date(a.releaseDate || '2024-01-01');
                    const dateB = new Date(b.releaseDate || '2024-01-01');
                    return dateB - dateA;
                    
                case 'name':
                default:
                    return a.name.localeCompare(b.name, 'zh-TW');
            }
        });
    }
    
    renderCharacters() {
        const grid = document.getElementById('charactersGrid');
        
        if (this.filteredCharacters.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <h3>沒有找到符合條件的角色</h3>
                    <p>請嘗試調整篩選條件或搜尋關鍵字</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = this.filteredCharacters.map(char => this.renderCharacterCard(char)).join('');
    }
    
    renderCharacterCard(char) {
        return `
            <div class="character-card" data-rarity="${char.rarity}" onclick="window.openCharacterDetail('${char.id}')">
                <div class="character-image">
                    <img src="../../assets/images/characters/${char.image}" 
                         alt="${char.name}" 
                         onerror="this.src='../../assets/images/placeholder-character.jpg'">
                </div>
                
                <!-- 左上：勢力 icon -->
                <div class="affiliation-icon">
                    <img src="../../assets/images/icons/affiliations/${this.getAffiliationIcon(char.affiliation)}" 
                         alt="${char.affiliation}"
                         title="${char.affiliation}">
                </div>
                
                <!-- 右上：屬性 icon -->
                <div class="element-icon">
                    <img src="../../assets/images/icons/elements/${this.getElementIcon(char.element)}" 
                         alt="${char.element}"
                         title="${char.element}">
                </div>
                
                <!-- 底部資訊 -->
                <div class="character-info">
                    <h3 class="character-name">${char.name}</h3>
                    <div class="character-rarity">
                        ${this.renderRarityIcon(char.rarity)}
                    </div>
                </div>
            </div>
        `;
    }
    
    getElementClass(element) {
        const classMap = {
            '衍射': 'spectro',
            '湮滅': 'havoc',
            '氣動': 'aero',
            '導電': 'electro',
            '冷凝': 'glacio',
            '熱熔': 'fusion'
        };
        return classMap[element] || 'unknown';
    }
    
    getAffiliationIcon(affiliation) {
        const iconMap = {
            '煌瓏': 'huanglong.png',
            '黎那汐塔': 'rinascita.png',
            '黑海岸': 'black-shores.png'
        };
        return iconMap[affiliation] || 'unknown.png';
    }
    
    getElementIcon(element) {
        const iconMap = {
            '衍射': 'spectro.png',
            '湮滅': 'havoc.png',
            '氣動': 'aero.png',
            '導電': 'electro.png',
            '冷凝': 'glacio.png',
            '熱熔': 'fusion.png'
        };
        return iconMap[element] || 'unknown.png';
    }
    
    renderRarityIcon(rarity) {
        // 使用你的稀有度 icon (150x49)
        const rarityIconMap = {
            4: 'rarity-4.png',
            5: 'rarity-5.png'
        };
        
        const iconFile = rarityIconMap[rarity];
        if (iconFile) {
            return `<img src="../../assets/images/icons/rarity/${iconFile}" alt="${rarity}星" class="rarity-icon">`;
        }
        
        // 備用方案：如果沒有對應的 icon，就用文字
        return `<span style="color: white; font-size: 0.9rem;">${rarity}★</span>`;
    }
    
    updateResultsCount() {
        const countElement = document.getElementById('results-count');
        if (countElement) {
            countElement.textContent = `共 ${this.filteredCharacters.length} 個角色`;
        }
    }
    
    resetFilters() {
        // 重置篩選器
        Object.keys(this.filters).forEach(key => {
            this.filters[key] = 'all';
            const element = document.getElementById(`filter-${key}`);
            if (element) element.value = 'all';
        });
        
        // 重置排序
        this.sortOrder = 'rarity';
        const sortSelect = document.getElementById('sort-order');
        if (sortSelect) sortSelect.value = 'rarity';
        
        // 重置搜尋
        this.searchQuery = '';
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        
        this.applyFilters();
    }
}

// 全域函數 - 開啟角色詳情頁面
window.openCharacterDetail = function(characterId) {
    console.log('Opening character detail:', characterId);
    // 導向到角色詳情頁面
    window.location.href = `./detail.html?id=${characterId}`;
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new CharactersList();
});