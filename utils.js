/**
 * 计算食谱与用户偏好的匹配分数
 * @param {Object} recipe - 食谱对象
 * @param {Object} preferences - 用户偏好对象
 * @returns {number} - 匹配分数 (0-100)
 */
function calculateMatchingScore(recipe, preferences) {
    let score = 0;
    let maxScore = 0;
    
    // 评分因素权重
    const weights = {
        dietTypes: 5,
        cuisine: 4,
        cookingTime: 3,
        nutrition: 4,
        excludedIngredients: 10 // 这是一个强制因素
    };
    
    // 1. 饮食类型匹配（素食、低碳水等）
    if (preferences.dietTypes.length > 0) {
        maxScore += weights.dietTypes;
        const matchingDietTypes = recipe.dietTypes.filter(diet => preferences.dietTypes.includes(diet));
        score += weights.dietTypes * (matchingDietTypes.length / preferences.dietTypes.length);
    }
    
    // 2. 料理风格匹配（中式、西式等）
    if (preferences.cuisines.length > 0) {
        maxScore += weights.cuisine;
        if (preferences.cuisines.includes(recipe.cuisine)) {
            score += weights.cuisine;
        }
    }
    
    // 3. 烹饪时间匹配
    maxScore += weights.cookingTime;
    if (recipe.cookingTime <= preferences.cookingTime) {
        // 时间越接近用户预期的最大值，得分越高
        const timeRatio = 1 - (preferences.cookingTime - recipe.cookingTime) / preferences.cookingTime * 0.5;
        score += weights.cookingTime * timeRatio;
    }
    
    // 4. 营养需求匹配
    if (preferences.nutrition.length > 0) {
        maxScore += weights.nutrition;
        let nutritionMatches = 0;
        
        for (const nutrition of preferences.nutrition) {
            if (nutrition === 'highProtein' && recipe.protein >= 20) {
                nutritionMatches++;
            } else if (nutrition === 'lowCalorie' && recipe.calories <= 300) {
                nutritionMatches++;
            }
        }
        
        score += weights.nutrition * (nutritionMatches / preferences.nutrition.length);
    }
    
    // 5. 排除食材匹配（这是一个强制因素）
    if (preferences.excludedIngredients.length > 0) {
        const hasExcludedIngredient = preferences.excludedIngredients.some(excluded => {
            return recipe.ingredients.some(ingredient => 
                ingredient.toLowerCase().includes(excluded.toLowerCase())
            );
        });
        
        if (hasExcludedIngredient) {
            return 0; // 如果包含排除的食材，直接返回0分
        }
    }
    
    // 计算最终得分 (0-100范围)
    const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 100;
    return finalScore;
}

/**
 * 根据排序方式对食谱列表进行排序
 * @param {Array} recipes - 食谱列表
 * @param {string} sortBy - 排序方式
 * @returns {Array} - 排序后的食谱列表
 */
function sortRecipes(recipes, sortBy) {
    const sortedRecipes = [...recipes];
    
    switch (sortBy) {
        case 'relevance':
            // 已经按相关性排序，不需要额外操作
            break;
        case 'time':
            sortedRecipes.sort((a, b) => a.cookingTime - b.cookingTime);
            break;
        case 'calories':
            sortedRecipes.sort((a, b) => a.calories - b.calories);
            break;
        default:
            break;
    }
    
    return sortedRecipes;
}

/**
 * 根据食谱的饮食类型获取标签类名
 * @param {string} dietType - 饮食类型
 * @returns {string} - 对应的CSS类名
 */
function getDietTypeBadgeClass(dietType) {
    const badgeClasses = {
        'vegetarian': 'badge-green',
        'vegan': 'badge-green',
        'lowCarb': 'badge-blue',
        'lowFat': 'badge-blue',
        'glutenFree': 'badge-amber',
        'dairyFree': 'badge-amber',
        'highProtein': 'badge-red',
        'lowCalorie': 'badge-blue'
    };
    
    return badgeClasses[dietType] || '';
}

/**
 * 获取饮食类型的中文翻译
 * @param {string} dietType - 饮食类型
 * @returns {string} - 中文翻译
 */
function getDietTypeLabel(dietType) {
    const dietTypeLabels = {
        'vegetarian': '素食主义',
        'vegan': '纯素食主义',
        'lowCarb': '低碳水',
        'lowFat': '低脂',
        'glutenFree': '无麸质',
        'dairyFree': '无乳制品',
        'highProtein': '高蛋白',
        'lowCalorie': '低卡路里'
    };
    
    return dietTypeLabels[dietType] || dietType;
}

/**
 * 获取料理风格的中文翻译
 * @param {string} cuisine - 料理风格
 * @returns {string} - 中文翻译
 */
function getCuisineLabel(cuisine) {
    const cuisineLabels = {
        'chinese': '中式料理',
        'western': '西式料理',
        'japanese': '日式料理',
        'korean': '韩式料理',
        'italian': '意式料理',
        'thai': '泰式料理'
    };
    
    return cuisineLabels[cuisine] || cuisine;
}

/**
 * 创建食谱卡片HTML
 * @param {Object} recipe - 食谱对象
 * @param {number} score - 匹配分数
 * @returns {string} - 食谱卡片HTML
 */
function createRecipeCard(recipe, score) {
    // 获取食谱的前三个饮食类型标签
    const dietTypesBadges = recipe.dietTypes.slice(0, 3).map(dietType => {
        const badgeClass = getDietTypeBadgeClass(dietType);
        return `<span class="badge ${badgeClass}">${getDietTypeLabel(dietType)}</span>`;
    }).join('');
    
    return `
        <div class="recipe-card bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all" data-recipe-id="${recipe.id}">
            <div class="relative h-48 overflow-hidden">
                <img src="${recipe.image}" alt="${recipe.name}" class="w-full h-full object-cover">
                <div class="absolute top-2 right-2 bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded-full">
                    匹配度 ${score}%
                </div>
            </div>
            <div class="p-4">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="font-semibold text-lg">${recipe.name}</h3>
                    <span class="text-sm text-gray-500">${recipe.cookingTime}分钟</span>
                </div>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">${recipe.description}</p>
                <div class="flex items-center justify-between">
                    <div class="flex flex-wrap gap-1">
                        ${dietTypesBadges}
                    </div>
                    <span class="text-sm font-medium">${recipe.calories} 卡路里</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * 创建食谱详情HTML
 * @param {Object} recipe - 食谱对象
 * @returns {string} - 食谱详情HTML
 */
function createRecipeDetails(recipe) {
    // 构建食材列表
    const ingredientsList = recipe.ingredients.map(ingredient => {
        return `<li class="py-2 border-b border-gray-100 last:border-0">${ingredient}</li>`;
    }).join('');
    
    // 构建步骤列表
    const stepsList = recipe.steps.map((step, index) => {
        return `<li>${step}</li>`;
    }).join('');
    
    // 构建标签列表
    const tagsList = recipe.tags.map(tag => {
        return `<span class="badge">${tag}</span>`;
    }).join('');
    
    // 构建饮食类型标签
    const dietTypesLabels = recipe.dietTypes.map(dietType => {
        const badgeClass = getDietTypeBadgeClass(dietType);
        return `<span class="badge ${badgeClass}">${getDietTypeLabel(dietType)}</span>`;
    }).join('');
    
    // 计算蛋白质、碳水、脂肪的最大值（用于图表显示）
    const maxNutritionValue = Math.max(recipe.protein, recipe.carbs, recipe.fat);
    
    return `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2">
                <div class="mb-6">
                    <img src="${recipe.image}" alt="${recipe.name}" class="w-full h-64 object-cover rounded-lg">
                </div>
                <div class="mb-6">
                    <h4 class="text-lg font-medium mb-3">描述</h4>
                    <p class="text-gray-600">${recipe.description}</p>
                </div>
                <div class="mb-6">
                    <h4 class="text-lg font-medium mb-3">烹饪步骤</h4>
                    <ol class="steps-list space-y-4">
                        ${stepsList}
                    </ol>
                </div>
            </div>
            <div>
                <div class="bg-gray-50 rounded-lg p-4 mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="font-medium">基本信息</h4>
                    </div>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-600">料理风格</span>
                            <span class="font-medium">${getCuisineLabel(recipe.cuisine)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">烹饪时间</span>
                            <span class="font-medium">${recipe.cookingTime} 分钟</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">难度</span>
                            <span class="font-medium">${recipe.difficulty}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">份量</span>
                            <span class="font-medium">${recipe.servings} 人份</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">烹饪方式</span>
                            <span class="font-medium">${recipe.cookingMethod}</span>
                        </div>
                    </div>
                </div>
                
                <div class="mb-6">
                    <h4 class="text-lg font-medium mb-3">营养成分</h4>
                    <div class="bg-gray-50 rounded-lg p-4">
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-gray-600">卡路里</span>
                            <span class="font-medium">${recipe.calories} 千卡</span>
                        </div>
                        <div class="space-y-4 nutrition-chart">
                            <div>
                                <div class="flex justify-between mb-1">
                                    <span class="text-sm text-gray-600">蛋白质</span>
                                    <span class="text-sm font-medium">${recipe.protein}g</span>
                                </div>
                                <div class="bar">
                                    <div class="bar-fill bg-red-500" style="width: ${(recipe.protein / maxNutritionValue) * 100}%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between mb-1">
                                    <span class="text-sm text-gray-600">碳水化合物</span>
                                    <span class="text-sm font-medium">${recipe.carbs}g</span>
                                </div>
                                <div class="bar">
                                    <div class="bar-fill bg-blue-500" style="width: ${(recipe.carbs / maxNutritionValue) * 100}%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between mb-1">
                                    <span class="text-sm text-gray-600">脂肪</span>
                                    <span class="text-sm font-medium">${recipe.fat}g</span>
                                </div>
                                <div class="bar">
                                    <div class="bar-fill bg-yellow-500" style="width: ${(recipe.fat / maxNutritionValue) * 100}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mb-6">
                    <h4 class="text-lg font-medium mb-3">食材</h4>
                    <ul class="bg-gray-50 rounded-lg p-4 divide-y divide-gray-100">
                        ${ingredientsList}
                    </ul>
                </div>
                
                <div class="mb-6">
                    <h4 class="text-lg font-medium mb-3">标签</h4>
                    <div class="flex flex-wrap">
                        ${tagsList}
                    </div>
                </div>
                
                <div>
                    <h4 class="text-lg font-medium mb-3">适合饮食</h4>
                    <div class="flex flex-wrap">
                        ${dietTypesLabels}
                    </div>
                </div>
            </div>
        </div>
    `;
}
