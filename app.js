document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const preferenceForm = document.getElementById('preferenceForm');
    const cookingTimeSlider = document.getElementById('cookingTime');
    const cookingTimeDisplay = document.getElementById('cookingTimeDisplay');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsSection = document.getElementById('resultsSection');
    const recipesList = document.getElementById('recipesList');
    const sortRecipesSelect = document.getElementById('sortRecipes');
    const recipeModal = document.getElementById('recipeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const closeModal = document.getElementById('closeModal');
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const closeHelpModal = document.getElementById('closeHelpModal');
    
    // 更新烹饪时间显示
    cookingTimeSlider.addEventListener('input', function() {
        cookingTimeDisplay.textContent = `${this.value}分钟`;
        
        // 更新范围输入滑块的背景
        const value = (this.value - this.min) / (this.max - this.min) * 100;
        this.style.backgroundImage = `linear-gradient(to right, #111827 0%, #111827 ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`;
    });
    
    // 初始化滑块背景
    const initialValue = (cookingTimeSlider.value - cookingTimeSlider.min) / (cookingTimeSlider.max - cookingTimeSlider.min) * 100;
    cookingTimeSlider.style.backgroundImage = `linear-gradient(to right, #111827 0%, #111827 ${initialValue}%, #e5e7eb ${initialValue}%, #e5e7eb 100%)`;
    
    // 打开帮助模态框
    helpBtn.addEventListener('click', function() {
        helpModal.classList.remove('hidden');
    });
    
    // 关闭帮助模态框
    closeHelpModal.addEventListener('click', function() {
        helpModal.classList.add('hidden');
    });
    
    // 关闭食谱详情模态框
    closeModal.addEventListener('click', function() {
        recipeModal.classList.add('hidden');
    });
    
    // 点击模态框背景关闭模态框
    recipeModal.addEventListener('click', function(e) {
        if (e.target === recipeModal) {
            recipeModal.classList.add('hidden');
        }
    });
    
    helpModal.addEventListener('click', function(e) {
        if (e.target === helpModal) {
            helpModal.classList.add('hidden');
        }
    });
    
    // 处理表单提交
    preferenceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 收集用户偏好
        const preferences = {
            dietTypes: Array.from(document.querySelectorAll('input[name="dietType"]:checked')).map(input => input.value),
            cuisines: Array.from(document.querySelectorAll('input[name="cuisine"]:checked')).map(input => input.value),
            cookingTime: parseInt(cookingTimeSlider.value),
            nutrition: Array.from(document.querySelectorAll('input[name="nutrition"]:checked')).map(input => input.value),
            excludedIngredients: document.getElementById('excludeIngredients').value
                .split(',')
                .map(item => item.trim())
                .filter(item => item !== '')
        };
        
        // 显示加载指示器，隐藏结果区域
        loadingIndicator.classList.remove('hidden');
        resultsSection.classList.add('hidden');
        
        // 模拟AI分析过程
        setTimeout(() => {
            // 匹配食谱
            const matchedRecipes = matchRecipes(preferences);
            
            // 隐藏加载指示器，显示结果区域
            loadingIndicator.classList.add('hidden');
            resultsSection.classList.remove('hidden');
            
            // 渲染食谱列表
            renderRecipesList(matchedRecipes);
            
            // 绑定排序事件
            sortRecipesSelect.addEventListener('change', function() {
                renderRecipesList(sortRecipes(matchedRecipes, this.value));
            });
            
            // 绑定食谱点击事件
            bindRecipeClickEvents();
            
        }, 1500); // 模拟1.5秒的处理时间
    });
    
    /**
     * 匹配食谱
     * @param {Object} preferences - 用户偏好
     * @returns {Array} - 匹配的食谱列表，包含匹配分数
     */
    function matchRecipes(preferences) {
        const matchedRecipes = [];
        
        for (const recipe of recipesData) {
            const score = calculateMatchingScore(recipe, preferences);
            
            // 只保留分数大于0的食谱
            if (score > 0) {
                matchedRecipes.push({
                    ...recipe,
                    matchScore: score
                });
            }
        }
        
        // 按匹配分数降序排序
        return matchedRecipes.sort((a, b) => b.matchScore - a.matchScore);
    }
    
    /**
     * 渲染食谱列表
     * @param {Array} recipes - 食谱列表
     */
    function renderRecipesList(recipes) {
        if (recipes.length === 0) {
            recipesList.innerHTML = `
                <div class="col-span-full py-12 text-center">
                    <p class="text-gray-500 mb-4">很抱歉，未找到符合您偏好的食谱。</p>
                    <p class="text-gray-500">请尝试调整您的偏好设置。</p>
                </div>
            `;
            return;
        }
        
        recipesList.innerHTML = '';
        
        recipes.forEach(recipe => {
            const recipeCard = createRecipeCard(recipe, recipe.matchScore);
            recipesList.innerHTML += recipeCard;
        });
    }
    
    /**
     * 绑定食谱点击事件
     */
    function bindRecipeClickEvents() {
        const recipeCards = document.querySelectorAll('.recipe-card');
        
        recipeCards.forEach(card => {
            card.addEventListener('click', function() {
                const recipeId = parseInt(this.dataset.recipeId);
                const recipe = recipesData.find(r => r.id === recipeId);
                
                if (recipe) {
                    // 填充模态框内容
                    modalTitle.textContent = recipe.name;
                    modalContent.innerHTML = createRecipeDetails(recipe);
                    
                    // 显示模态框
                    recipeModal.classList.remove('hidden');
                }
            });
        });
    }
});
