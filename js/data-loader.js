/**
 * ملف خاص بتحميل البيانات من ملفات JSON
 * يستخدم للبحث وعرض معلومات الأدوية
 */

// مسارات ملفات البيانات
const DATA_PATHS = {
    medicines: 'data/medicines.json',
    categories: 'data/categories.json',
    popularMedicines: 'data/popular-medicines.json'
};

// تخزين البيانات المحملة مؤقتاً
let cachedData = {};

/**
 * تحميل البيانات من ملف JSON
 */
async function loadData(dataType) {
    // إذا كانت البيانات محملة مسبقاً، يتم إرجاعها فوراً
    if (cachedData[dataType]) {
        return cachedData[dataType];
    }
    
    try {
        const response = await fetch(DATA_PATHS[dataType]);
        if (!response.ok) {
            throw new Error(`فشل تحميل البيانات: ${response.status}`);
        }
        
        const data = await response.json();
        cachedData[dataType] = data;
        return data;
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        return null;
    }
}

/**
 * تحميل وعرض الأدوية الشائعة في الصفحة الرئيسية
 */
async function loadPopularMedicines() {
    const popularMedicinesContainer = document.getElementById('popularMedicines');
    if (!popularMedicinesContainer) return;
    
    try {
        // محاكاة تأخير الشبكة للعرض
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // استخدام بيانات مؤقتة للعرض حتى يتم ربط قاعدة البيانات الحقيقية
        const mockData = [
            { id: 'paracetamol', name: 'باراسيتامول', scientificName: 'Paracetamol', category: 'مسكنات', image: 'placeholder.jpg' },
            { id: 'amoxicillin', name: 'أموكسيسيلين', scientificName: 'Amoxicillin', category: 'مضادات حيوية', image: 'placeholder.jpg' },
            { id: 'omeprazole', name: 'أوميبرازول', scientificName: 'Omeprazole', category: 'مضادات الحموضة', image: 'placeholder.jpg' },
            { id: 'salbutamol', name: 'سالبوتامول', scientificName: 'Salbutamol', category: 'موسعات الشعب الهوائية', image: 'placeholder.jpg' }
        ];
        
        // تفريغ الحاوية وإزالة مؤشر التحميل
        popularMedicinesContainer.innerHTML = '';
        
        // إضافة الأدوية الشائعة للصفحة
        mockData.forEach(medicine => {
            const medicineCard = document.createElement('div');
            medicineCard.className = 'col-md-3 col-sm-6 mb-4';
            medicineCard.innerHTML = `
                <div class="card h-100 medicine-card">
                    <div class="text-center pt-3">
                        <i class="bi bi-capsule-pill text-primary" style="font-size: 3rem;"></i>
                    </div>
                    <div class="card-body text-center">
                        <h5 class="card-title">${medicine.name}</h5>
                        <p class="card-text text-muted">${medicine.scientificName}</p>
                        <span class="badge bg-info">${medicine.category}</span>
                    </div>
                    <div class="card-footer bg-transparent border-top-0 text-center">
                        <a href="medicine-details.html?id=${medicine.id}" class="btn btn-outline-primary">
                            عرض التفاصيل
                        </a>
                    </div>
                </div>
            `;
            popularMedicinesContainer.appendChild(medicineCard);
        });
    } catch (error) {
        console.error('خطأ في تحميل الأدوية الشائعة:', error);
        popularMedicinesContainer.innerHTML = `
            <div class="col-12 text-center text-danger">
                <i class="bi bi-exclamation-triangle fs-1"></i>
                <p>حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى لاحقاً.</p>
            </div>
        `;
    }
}

/**
 * تحميل وعرض فئات الأدوية في الصفحة الرئيسية
 */
async function loadMedicineCategories() {
    const categoriesContainer = document.getElementById('medicineCategories');
    if (!categoriesContainer) return;
    
    try {
        // محاكاة تأخير الشبكة للعرض
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // استخدام بيانات مؤقتة للعرض حتى يتم ربط قاعدة البيانات الحقيقية
        const mockCategories = [
            { id: 'painkillers', name: 'مسكنات الألم', icon: 'bi-bandaid', count: 24 },
            { id: 'antibiotics', name: 'مضادات حيوية', icon: 'bi-bug', count: 31 },
            { id: 'antihypertensives', name: 'أدوية الضغط', icon: 'bi-heart-pulse', count: 18 },
            { id: 'antidiabetics', name: 'أدوية السكري', icon: 'bi-droplet-half', count: 15 },
            { id: 'antiacids', name: 'مضادات الحموضة', icon: 'bi-cup-hot', count: 9 },
            { id: 'respiratory', name: 'أدوية الجهاز التنفسي', icon: 'bi-lungs', count: 22 }
        ];
        
        // تفريغ الحاوية وإزالة مؤشر التحميل
        categoriesContainer.innerHTML = '';
        
        // إضافة الفئات للصفحة
        mockCategories.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'col-md-4 col-sm-6 mb-4';
            categoryCard.innerHTML = `
                <div class="card h-100">
                    <div class="card-body text-center">
                        <i class="bi ${category.icon} text-primary" style="font-size: 2.5rem;"></i>
                        <h5 class="card-title mt-3">${category.name}</h5>
                        <p class="card-text text-muted">${category.count} دواء</p>
                        <a href="categories.html?id=${category.id}" class="btn btn-sm btn-outline-primary">
                            تصفح الفئة
                        </a>
                    </div>
                </div>
            `;
            categoriesContainer.appendChild(categoryCard);
        });
    } catch (error) {
        console.error('خطأ في تحميل فئات الأدوية:', error);
        categoriesContainer.innerHTML = `
            <div class="col-12 text-center text-danger">
                <i class="bi bi-exclamation-triangle fs-1"></i>
                <p>حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى لاحقاً.</p>
            </div>
        `;
    }
}

// تحميل البيانات عند تحميل الصفحة الرئيسية
document.addEventListener('DOMContentLoaded', function() {
    // تحميل الأدوية الشائعة إذا كنا في الصفحة الرئيسية
    if (document.getElementById('popularMedicines')) {
        loadPopularMedicines();
    }
    
    // تحميل فئات الأدوية إذا كنا في الصفحة الرئيسية
    if (document.getElementById('medicineCategories')) {
        loadMedicineCategories();
    }
    
    // تحميل فئات الأدوية للبحث المتقدم
    const categorySelector = document.getElementById('category');
    if (categorySelector) {
        populateCategorySelector(categorySelector);
    }
});