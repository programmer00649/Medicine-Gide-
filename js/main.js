/**
 * الملف الرئيسي للكود المشترك بين جميع الصفحات
 */

// وضع الإضاءة المنخفضة
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من الإعدادات المحفوظة للوضع الداكن
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }
    
    // إضافة معالج حدث النقر على زر تبديل الوضع
    const darkModeToggle = document.getElementById('toggleDarkMode');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            const isDarkMode = document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
            updateDarkModeIcon(isDarkMode);
        });
    }
    
    // تبديل اللغة
    const languageToggle = document.getElementById('toggleLanguage');
    if (languageToggle) {
        languageToggle.addEventListener('click', function() {
            // سيتم تنفيذ هذه الوظيفة في الإصدارات المستقبلية
            alert('سيتم إضافة دعم اللغة الإنجليزية في الإصدار القادم');
        });
    }
});

/**
 * تحديث أيقونة زر الوضع الداكن
 */
function updateDarkModeIcon(isDarkMode) {
    const darkModeButton = document.getElementById('toggleDarkMode');
    if (darkModeButton) {
        darkModeButton.innerHTML = isDarkMode 
            ? '<i class="bi bi-sun"></i>' 
            : '<i class="bi bi-moon"></i>';
    }
}

/**
 * عرض رسالة خطأ للمستخدم
 */
function showError(message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'alert alert-danger alert-dismissible fade show';
    errorContainer.innerHTML = `
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="إغلاق"></button>
    `;
    
    // إضافة العنصر إلى الصفحة
    document.querySelector('main') 
        ? document.querySelector('main').prepend(errorContainer) 
        : document.querySelector('.container').prepend(errorContainer);
    
    // إزالة التنبيه تلقائياً بعد 5 ثوانٍ
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(errorContainer);
        bsAlert.close();
    }, 5000);
}

/**
 * تنسيق التاريخ إلى الصيغة العربية
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-AE', options);
}

/**
 * تحويل النص المحتوي على أرقام إلى الأرقام العربية
 */
function toArabicNumbers(str) {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/[0-9]/g, (w) => arabicNumbers[+w]);
}

/**
 * تحويل الأرقام العربية إلى أرقام إنجليزية
 */
function toEnglishNumbers(str) {
    return str.replace(/[٠١٢٣٤٥٦٧٨٩]/g, function(d) {
        return d.charCodeAt(0) - 1632;
    });
}

/**
 * اختصار النص إذا كان طويلاً
 */
function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}