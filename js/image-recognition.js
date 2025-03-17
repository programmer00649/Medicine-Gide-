/**
 * ملف خاص بميزة التعرف البصري على الأدوية
 */

document.addEventListener('DOMContentLoaded', function() {
    const dropArea = document.getElementById('dropArea');
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const removeButton = document.getElementById('removeImage');
    const recognizeButton = document.getElementById('recognizeButton');
    
    // حالات عرض نتائج التعرف
    const initialState = document.getElementById('initialState');
    const loadingState = document.getElementById('loadingState');
    const resultsState = document.getElementById('resultsState');
    const errorState = document.getElementById('errorState');
    
    if (!dropArea || !imageInput) return;
    
    // معالج النقر على منطقة إفلات الصورة
    dropArea.addEventListener('click', function() {
        imageInput.click();
    });
    
    // معالج تغيير ملف الصورة
    imageInput.addEventListener('change', function() {
        handleImageSelection(this.files);
    });
    
    // معالج إفلات الصورة
    dropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropArea.classList.add('bg-light');
    });
    
    dropArea.addEventListener('dragleave', function() {
        dropArea.classList.remove('bg-light');
    });
    
    dropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        dropArea.classList.remove('bg-light');
        
        if (e.dataTransfer.files.length) {
            handleImageSelection(e.dataTransfer.files);
        }
    });
    
    // معالج نقر زر إزالة الصورة
    if (removeButton) {
        removeButton.addEventListener('click', function() {
            resetImageUpload();
        });
    }
    
    // معالج نقر زر التعرف على الدواء
    if (recognizeButton) {
        recognizeButton.addEventListener('click', function() {
            recognizeMedicine();
        });
    }
    
    /**
     * معالجة اختيار الصورة
     */
    function handleImageSelection(files) {
        if (files.length === 0) return;
        
        const file = files[0];
        
        // التحقق من أن الملف هو صورة
        if (!file.type.match('image.*')) {
            showError('يرجى اختيار ملف صورة صالح (JPEG، PNG، إلخ)');
            return;
        }
        
        // التحقق من حجم الملف (أقل من 5 ميغابايت)
        if (file.size > 5 * 1024 * 1024) {
            showError('حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 5 ميغابايت');
            return;
        }
        
        // إظهار معاينة الصورة
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            dropArea.classList.add('d-none');
            previewContainer.classList.remove('d-none');
        };
        reader.readAsDataURL(file);
    }
    
    /**
     * إعادة تعيين حالة تحميل الصورة
     */
    function resetImageUpload() {
        dropArea.classList.remove('d-none');
        previewContainer.classList.add('d-none');
        imageInput.value = '';
        
        // إعادة تعيين حالة النتائج
        setRecognitionState('initial');
    }
    
    /**
     * التعرف على الدواء من الصورة
     */
    async function recognizeMedicine() {
        // تغيير الحالة إلى جاري التحميل
        setRecognitionState('loading');
        
        try {
            // محاكاة تأخير لعملية التعرف على الصورة
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // تحميل بيانات الأدوية
            const medicines = await loadData('medicines');
            if (!medicines) {
                throw new Error('فشل تحميل بيانات الأدوية');
            }
            
            // محاكاة نجاح التعرف بنسبة 70%
            const success = Math.random() > 0.3;
            
            if (success) {
                // اختيار دواء عشوائي من البيانات للعرض كمحاكاة للتعرف
                const randomIndex = Math.floor(Math.random() * medicines.length);
                const medicine = medicines[randomIndex];
                
                // إضافة درجة الثقة في التعرف (محاكاة)
                const medicineWithConfidence = {
                    ...medicine,
                    confidence: Math.floor(Math.random() * 20) + 75 // درجة ثقة بين 75 و 95%
                };
                
                // عرض نتائج التعرف
                displayRecognitionResults(medicineWithConfidence);
            } else {
                // فشل التعرف
                setRecognitionState('error');
            }
        } catch (error) {
            console.error('خطأ في التعرف على الدواء:', error);
            setRecognitionState('error');
        }
    }
    
    /**
     * تغيير حالة عرض نتائج التعرف
     */
    function setRecognitionState(state) {
        initialState.classList.add('d-none');
        loadingState.classList.add('d-none');
        resultsState.classList.add('d-none');
        errorState.classList.add('d-none');
        
        switch(state) {
            case 'initial':
                initialState.classList.remove('d-none');
                break;
            case 'loading':
                loadingState.classList.remove('d-none');
                break;
            case 'results':
                resultsState.classList.remove('d-none');
                break;
            case 'error':
                errorState.classList.remove('d-none');
                break;
        }
    }
    
    /**
     * عرض نتائج التعرف على الدواء
     */
    function displayRecognitionResults(medicine) {
        if (!resultsState) return;
        
        // تحضير محتوى نتائج التعرف
        resultsState.innerHTML = `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3">
                        <div>
                            <h5 class="mb-0">${medicine.name}</h5>
                            <p class="text-muted mb-0">${medicine.scientificName}</p>
                        </div>
                        <span class="ms-auto badge bg-success">
                            نسبة التطابق: ${medicine.confidence}%
                        </span>
                    </div>
                    <hr>
                    <div class="row g-2">
                        <div class="col-6">
                            <p class="mb-1"><strong>الفئة العلاجية:</strong></p>
                            <span class="badge bg-info">${medicine.category}</span>
                        </div>
                        <div class="col-6">
                            <p class="mb-1"><strong>الشركة المصنعة:</strong></p>
                            <span>${medicine.manufacturer}</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-transparent">
                    <a href="medicine-details.html?id=${medicine.id}" class="btn btn-primary w-100">
                        عرض التفاصيل الكاملة للدواء
                    </a>
                </div>
            </div>
            
            <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                هل هذا ليس الدواء الصحيح؟ يمكنك <a href="#" id="tryAgainButton" class="alert-link">إعادة المحاولة بصورة أوضح</a> أو استخدام <a href="search.html" class="alert-link">البحث اليدوي</a>.
            </div>
        `;
        
        // معالج نقر زر إعادة المحاولة
        const tryAgainButton = document.getElementById('tryAgainButton');
        if (tryAgainButton) {
            tryAgainButton.addEventListener('click', function(e) {
                e.preventDefault();
                resetImageUpload();
            });
        }
        
        // تغيير الحالة إلى عرض النتائج
        setRecognitionState('results');
    }
});