/**
 * ملف خاص بحاسبة الجرعات الدوائية
 */

document.addEventListener('DOMContentLoaded', async function() {
    const ageGroupRadios = document.querySelectorAll('input[name="ageGroup"]');
    const ageInputContainer = document.getElementById('ageInputContainer');
    const calculatorForm = document.getElementById('dosageCalculatorForm');
    const medicineTypeSelect = document.getElementById('medicineType');
    
    // إذا لم تكن في صفحة حاسبة الجرعات، تخطي التنفيذ
    if (!calculatorForm) return;
    
    // تهيئة قائمة الأدوية من ملف البيانات
    await populateMedicineSelector();
    
    // معالج تغيير فئة العمر (بالغ/طفل)
    ageGroupRadios.forEach(function(radio) {
        radio.addEventListener('change', function() {
            if (this.value === 'child') {
                ageInputContainer.classList.remove('d-none');
            } else {
                ageInputContainer.classList.add('d-none');
            }
        });
    });
    
    // معالج تقديم نموذج حساب الجرعة
    calculatorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateDosage();
    });
    
    /**
     * تعبئة قائمة الأدوية من بيانات الأدوية
     */
    async function populateMedicineSelector() {
        try {
            // تحميل بيانات الأدوية
            const medicines = await loadData('medicines');
            if (!medicines || !medicines.length) {
                console.error('لم يتم العثور على بيانات الأدوية');
                return;
            }
            
            // إفراغ القائمة مع الاحتفاظ بالعنصر الافتراضي
            const defaultOption = medicineTypeSelect.querySelector('option[disabled]');
            medicineTypeSelect.innerHTML = '';
            
            if (defaultOption) {
                medicineTypeSelect.appendChild(defaultOption);
            } else {
                // إنشاء عنصر افتراضي إذا لم يكن موجودًا
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'اختر الدواء...';
                option.selected = true;
                option.disabled = true;
                medicineTypeSelect.appendChild(option);
            }
            
            // إضافة الأدوية إلى القائمة
            medicines.forEach(medicine => {
                const option = document.createElement('option');
                option.value = medicine.id;
                option.textContent = `${medicine.name} (${medicine.scientificName})`;
                medicineTypeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('خطأ في تحميل بيانات الأدوية:', error);
        }
    }
    
    /**
     * حساب الجرعة الدوائية
     */
    async function calculateDosage() {
        // حالات عرض نتائج الحساب
        const initialCalcState = document.getElementById('initialCalcState');
        const loadingCalcState = document.getElementById('loadingCalcState');
        const resultsCalcState = document.getElementById('resultsCalcState');
        const warningCalcState = document.getElementById('warningCalcState');
        const additionalInfoSection = document.getElementById('additionalInfoSection');
        
        // جمع البيانات من النموذج
        const medicineType = document.getElementById('medicineType').value;
        const ageGroup = document.querySelector('input[name="ageGroup"]:checked').value;
        let age = null;
        if (ageGroup === 'child') {
            age = parseFloat(document.getElementById('ageInput').value);
        }
        const weight = parseFloat(document.getElementById('weightInput').value);
        const medicalConditions = Array.from(document.getElementById('medicalConditions').selectedOptions).map(option => option.value);
        const otherMedications = document.getElementById('otherMedications').value;
        
        // التحقق من صحة البيانات
        if (!medicineType) {
            showError('يرجى اختيار نوع الدواء');
            return;
        }
        
        if (!weight || weight <= 0 || weight > 200) {
            showError('يرجى إدخال وزن صحيح بين 1 و 200 كجم');
            return;
        }
        
        if (ageGroup === 'child' && (isNaN(age) || age < 0 || age > 11)) {
            showError('يرجى إدخال عمر صحيح للطفل بين 0 و 11 سنة');
            return;
        }
        
        // عرض حالة التحميل
        initialCalcState.classList.add('d-none');
        loadingCalcState.classList.remove('d-none');
        resultsCalcState.classList.add('d-none');
        warningCalcState.classList.add('d-none');
        additionalInfoSection.classList.add('d-none');
        
        try {
            // الحصول على نتائج حساب الجرعة من الدالة المحدثة
            const result = await getMockDosageResult(medicineType, ageGroup, age, weight, medicalConditions);
            
            loadingCalcState.classList.add('d-none');
            
            if (result.warning) {
                // عرض التحذير إذا وجد
                warningCalcState.classList.remove('d-none');
                document.getElementById('warningMessage').textContent = result.warning;
            } else {
                // عرض نتائج الحساب
                resultsCalcState.classList.remove('d-none');
                resultsCalcState.innerHTML = `
                    <div class="calculator-result">
                        <h5>${result.medicineName}</h5>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <p class="mb-1">الجرعة المناسبة لكل مرة:</p>
                                <p class="dosage-value">${result.singleDose}</p>
                            </div>
                            <div class="col-md-6 mb-3">
                                <p class="mb-1">عدد مرات الاستخدام:</p>
                                <p class="dosage-value">${result.frequency}</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <p class="mb-1">المدة الموصى بها:</p>
                                <p class="dosage-value">${result.duration}</p>
                            </div>
                            <div class="col-md-6 mb-3">
                                <p class="mb-1">الحد الأقصى يومياً:</p>
                                <p class="dosage-value">${result.maxDailyDose}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="alert alert-warning mb-0">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        <strong>تنبيه:</strong> هذه الجرعات إرشادية فقط ويجب استشارة الطبيب أو الصيدلي قبل الاستخدام.
                    </div>
                `;
                
                // عرض معلومات إضافية عن الدواء
                additionalInfoSection.classList.remove('d-none');
                document.getElementById('additionalInfo').innerHTML = `
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <h6>الاستخدامات الرئيسية:</h6>
                            <ul>
                                ${result.additionalInfo.uses.map(use => `<li>${use}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="col-md-6 mb-3">
                            <h6>الآثار الجانبية الشائعة:</h6>
                            <ul>
                                ${result.additionalInfo.sideEffects.map(effect => `<li>${effect}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    <div class="mb-3">
                        <h6>احتياطات:</h6>
                        <ul>
                            ${result.additionalInfo.precautions.map(precaution => `<li>${precaution}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
        } catch (error) {
            console.error('خطأ في حساب الجرعة:', error);
            loadingCalcState.classList.add('d-none');
            warningCalcState.classList.remove('d-none');
            document.getElementById('warningMessage').textContent = 'حدث خطأ أثناء حساب الجرعة. يرجى المحاولة مرة أخرى.';
        }
    }
    
    /**
     * الحصول على نتائج حساب الجرعة باستخدام بيانات الدواء
     */
    async function getMockDosageResult(medicineType, ageGroup, age, weight, medicalConditions) {
        try {
            // التحقق من وجود موانع استعمال معروفة
            if (medicineType === 'ibuprofen' && medicalConditions.includes('kidney')) {
                return {
                    warning: 'لا ينصح باستخدام الإيبوبروفين للمرضى الذين يعانون من مشاكل في الكلى. يرجى استشارة الطبيب لبديل مناسب.'
                };
            }
            
            // تحميل بيانات الأدوية من ملف JSON مركزي
            const medicines = await loadData('medicines');
            if (!medicines || !medicines.length) {
                throw new Error('لم يتم العثور على بيانات الأدوية');
            }
            
            // البحث عن الدواء المطلوب
            const medicineData = medicines.find(med => med.id === medicineType);
            if (!medicineData) {
                return {
                    warning: 'عذراً، لا توجد معلومات متوفرة عن هذا الدواء حالياً.'
                };
            }
            
            // تحويل البيانات من الملف المركزي إلى الشكل المطلوب لحاسبة الجرعات
            const medicine = {
                name: `${medicineData.name} (${medicineData.scientificName})`,
                adult: {
                    singleDose: medicineData.dosage.adult.dose,
                    frequency: medicineData.dosage.adult.frequency,
                    duration: '5-7 أيام أو حسب توصية الطبيب',
                    maxDailyDose: medicineData.dosage.adult.maxDaily
                },
                child: {
                    calculateDose: function(age, weight) {
                        // استخراج معدل الجرعة للأطفال من البيانات
                        let doseInfo = medicineData.dosage.child.dose;
                        let doseRate = 10; // قيمة افتراضية
                        
                        // استخراج قيمة معدل الجرعة من النص (مثل "10-15 ملغ/كغ")
                        if (doseInfo.includes('ملغ/كغ')) {
                            // استخراج الأرقام من النص
                            const doseMatch = doseInfo.match(/(\d+)-?(\d+)?/);
                            if (doseMatch) {
                                if (doseMatch[2]) {
                                    // إذا كان هناك مدى (مثل 10-15)، نأخذ المتوسط
                                    doseRate = (parseInt(doseMatch[1]) + parseInt(doseMatch[2])) / 2;
                                } else {
                                    // إذا كان هناك رقم واحد
                                    doseRate = parseInt(doseMatch[1]);
                                }
                            }
                        }
                        
                        // حساب الجرعة بناءً على الوزن ومعدل الجرعة
                        const dose = Math.round(weight * doseRate);
                        // تحديد عدد الجرعات بناءً على العمر
                        const dosesPerDay = Math.min(4, Math.max(3, Math.ceil(age)));
                        
                        return {
                            singleDose: `${dose} ملغ`,
                            frequency: medicineData.dosage.child.frequency,
                            duration: '3-5 أيام أو حسب توصية الطبيب',
                            maxDailyDose: `${dose * dosesPerDay} ملغ (${dosesPerDay} جرعات في اليوم)`
                        };
                    }
                },
                additionalInfo: {
                    uses: medicineData.indications.slice(0, 4),
                    sideEffects: medicineData.sideEffects.slice(0, 4),
                    precautions: medicineData.precautions.slice(0, 4)
                }
            };
            
            // حساب الجرعة حسب الفئة العمرية
            const result = {
                medicineName: medicine.name,
                additionalInfo: medicine.additionalInfo
            };
            
            if (ageGroup === 'adult') {
                // جرعة البالغين
                Object.assign(result, medicine.adult);
            } else {
                // جرعة الأطفال
                const childDosage = medicine.child.calculateDose(age, weight);
                Object.assign(result, childDosage);
            }
            
            // تطبيق تعديلات خاصة بناءً على الحالات الطبية
            if (medicalConditions.includes('liver')) {
                // تخفيض الجرعة لمرضى الكبد
                result.maxDailyDose += ' (ينصح بتخفيض الجرعة لمرضى الكبد)';
            }
            
            if (medicalConditions.includes('kidney')) {
                // تخفيض الجرعة لمرضى الكلى
                result.maxDailyDose += ' (ينصح بتخفيض الجرعة لمرضى الكلى)';
            }
            
            return result;
        } catch (error) {
            console.error('خطأ في حساب الجرعة:', error);
            return {
                warning: 'حدث خطأ أثناء حساب الجرعة. يرجى المحاولة مرة أخرى أو استشارة الطبيب.'
            };
        }
    }
});