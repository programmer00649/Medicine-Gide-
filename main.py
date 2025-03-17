from flask import Flask, send_from_directory, redirect

# دليل الأدوية العربي - Arabic Medicine Guide
# تطبيق ويب لتوفير معلومات شاملة عن الأدوية باللغة العربية
app = Flask(__name__)

@app.route('/')
def index():
    """الصفحة الرئيسية"""
    return send_from_directory('.', 'index.html')

@app.route('/project-info')
def project_info():
    """معلومات المشروع"""
    return {
        "name": "دليل الأدوية العربي - Arabic Medicine Guide",
        "description": "منصة معلوماتية شاملة للأدوية باللغة العربية مع التركيز على اليمن",
        "features": [
            "بحث شامل للأدوية",
            "التعرف البصري على الأدوية",
            "حاسبة الجرعات الدوائية",
            "معلومات تفصيلية عن الأدوية"
        ],
        "version": "1.0.0"
    }

@app.route('/<path:path>')
def serve_file(path):
    """خدمة الملفات الثابتة"""
    return send_from_directory('.', path)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)