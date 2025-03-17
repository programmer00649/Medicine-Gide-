/**
 * ملف خاص بوظائف البحث عن الأدوية
 */

// معالج حدث البحث السريع في الصفحة الرئيسية
document.addEventListener('DOMContentLoaded', function() {
    const quickSearchForm = document.getElementById('quickSearch');
    const searchButton = document.getElementById('searchButton');
    
    if (quickSearchForm && searchButton) {
        // معالج النقر على زر البحث
        searchButton.addEventListener('click', function() {
            performQuickSearch();
        });
        
        // معالج الضغط على زر الإدخال في حقل البحث
        quickSearchForm.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performQuickSearch();
            }
        });
    }
    
    // معالج نموذج البحث المتقدم
    const advancedSearchForm = document.getElementById('advancedSearchForm');
    if (advancedSearchForm) {
        advancedSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performAdvancedSearch();
        });
    }
});

/**
 * تنفيذ البحث السريع
 */
function performQuickSearch() {
    const searchTerm = document.getElementById('quickSearch').value.trim();
    if (!searchTerm) {
        showError('يرجى إدخال كلمة للبحث');
        return;
    }
    
    // توجيه المستخدم إلى صفحة البحث مع المعلمات المناسبة
    window.location.href = `search.html?term=${encodeURIComponent(searchTerm)}`;
}

/**
 * تنفيذ البحث المتقدم
 */
function performAdvancedSearch() {
    // جمع بيانات البحث من النموذج
    const drugName = document.getElementById('drugName').value.trim();
    const activeIngredient = document.getElementById('activeIngredient').value.trim();
    const category = document.getElementById('category').value;
    const symptom = document.getElementById('symptom').value.trim();
    const manufacturer = document.getElementById('manufacturer').value.trim();
    const dosageForm = document.getElementById('dosageForm').value;
    
    // التحقق من وجود معايير بحث واحدة على الأقل
    if (!drugName && !activeIngredient && !category && !symptom && !manufacturer && !dosageForm) {
        showError('يرجى تحديد معيار واحد على الأقل للبحث');
        return;
    }
    
    // البحث وعرض النتائج
    searchMedicines({
        drugName,
        activeIngredient,
        category,
        symptom,
        manufacturer,
        dosageForm
    });
}

/**
 * البحث عن الأدوية وعرض النتائج
 */
async function searchMedicines(criteria) {
    const resultsContainer = document.getElementById('resultsContainer');
    if (!resultsContainer) return;
    
    // عرض مؤشر التحميل
    resultsContainer.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">جاري البحث...</span>
            </div>
            <p class="mt-2">جاري البحث عن الأدوية...</p>
        </div>
    `;
    
    try {
        // محاكاة تأخير البحث
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // استخدام دالة البحث التي تعمل على البيانات المحملة من ملفات JSON
        const results = await getSearchResults(criteria);
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search fs-1 text-muted"></i>
                    <p class="mt-3">لم يتم العثور على نتائج مطابقة لمعايير البحث.</p>
                    <p>يرجى تجربة كلمات بحث مختلفة أو توسيع معايير البحث.</p>
                </div>
            `;
            return;
        }
        
        // عرض النتائج
        resultsContainer.innerHTML = '';
        results.forEach(medicine => {
            const resultCard = document.createElement('div');
            resultCard.className = 'col-md-4 col-sm-6 mb-4';
            resultCard.innerHTML = `
                <div class="card h-100 medicine-card">
                    <div class="text-center pt-3">
                        <i class="bi bi-capsule-pill text-primary" style="font-size: 3rem;"></i>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${medicine.name}</h5>
                        <p class="card-text text-muted">${medicine.scientificName}</p>
                        <div class="mb-2">
                            <span class="badge bg-info me-1">${medicine.category}</span>
                            <span class="badge bg-secondary">${medicine.form}</span>
                        </div>
                        <p class="small">${truncateText(medicine.description, 80)}</p>
                    </div>
                    <div class="card-footer bg-transparent border-top-0 text-center">
                        <a href="medicine-details.html?id=${medicine.id}" class="btn btn-outline-primary">
                            عرض التفاصيل
                        </a>
                    </div>
                </div>
            `;
            resultsContainer.appendChild(resultCard);
        });
        
        // إضافة عدد النتائج
        const resultCountElement = document.createElement('div');
        resultCountElement.className = 'col-12 mb-3';
        resultCountElement.innerHTML = `<p>تم العثور على ${results.length} نتيجة</p>`;
        resultsContainer.prepend(resultCountElement);
    } catch (error) {
        console.error('خطأ في البحث:', error);
        resultsContainer.innerHTML = `
            <div class="col-12 text-center text-danger">
                <i class="bi bi-exclamation-triangle fs-1"></i>
                <p>حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى لاحقاً.</p>
            </div>
        `;
    }
}

/**
 * تنفيذ البحث عن الأدوية باستخدام البيانات المحملة من ملفات JSON
 */
async function getSearchResults(criteria) {
    try {
        // تحميل بيانات الأدوية باستخدام دالة تحميل البيانات من data-loader.js
        const medicines = await loadData('medicines');
        if (!medicines) {
            throw new Error('فشل تحميل بيانات الأدوية');
        }
        
        // تطبيق معايير البحث على البيانات
        return medicines.filter(medicine => {
            // البحث في اسم الدواء
            if (criteria.drugName && !medicine.name.includes(criteria.drugName) && !medicine.scientificName.toLowerCase().includes(criteria.drugName.toLowerCase())) {
                return false;
            }
            
            // البحث في المادة الفعالة
            if (criteria.activeIngredient && !medicine.scientificName.toLowerCase().includes(criteria.activeIngredient.toLowerCase())) {
                return false;
            }
            
            // البحث في الفئة العلاجية
            if (criteria.category && medicine.category !== criteria.category) {
                return false;
            }
            
            // البحث في الأعراض
            if (criteria.symptom && !medicine.description.includes(criteria.symptom)) {
                return false;
            }
            
            // البحث في الشركة المصنعة
            if (criteria.manufacturer && !medicine.manufacturer.includes(criteria.manufacturer)) {
                return false;
            }
            
            // البحث في شكل الدواء
            if (criteria.dosageForm && medicine.form !== getArabicFormName(criteria.dosageForm)) {
                return false;
            }
            
            return true;
        });
    } catch (error) {
        console.error('خطأ في تحميل بيانات البحث:', error);
        return [];
    }
}

/**
 * تحويل اسم شكل الدواء من الإنجليزية إلى العربية
 */
function getArabicFormName(englishForm) {
    const formMapping = {
        'tablet': 'أقراص',
        'capsule': 'كبسولات',
        'syrup': 'شراب',
        'injection': 'حقن',
        'cream': 'كريم',
        'ointment': 'مرهم',
        'drops': 'قطرات',
        'inhaler': 'بخاخ'
    };
    
    return formMapping[englishForm] || englishForm;
}

/**
 * تعبئة قائمة الفئات في نموذج البحث المتقدم
 */
async function populateCategorySelector(selector) {
    try {
        // تحميل بيانات الفئات من ملف JSON
        const categories = await loadData('categories');
        if (!categories) {
            throw new Error('فشل تحميل بيانات الفئات');
        }
        
        // إضافة خيار "جميع الفئات" في البداية
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'جميع الفئات';
        selector.appendChild(defaultOption);
        
        // إضافة باقي الفئات من البيانات
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            selector.appendChild(option);
        });
    } catch (error) {
        console.error('خطأ في تحميل الفئات:', error);
    }
}

// معالجة معلمات البحث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('term');
    
    // إذا كان هناك مصطلح بحث في URL، ملء حقل البحث السريع والبحث فوراً
    if (searchTerm && document.getElementById('resultsContainer')) {
        const drugNameInput = document.getElementById('drugName');
        if (drugNameInput) {
            drugNameInput.value = searchTerm;
            performAdvancedSearch();
        }
    }
});