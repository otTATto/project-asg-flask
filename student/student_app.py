from flask import Blueprint, request, render_template

student = Blueprint("student", __name__, template_folder="student_templates", static_folder="satic")

@student.route('/')
def index():
    return render_template('loginS.html')

# 任意のURLのルーティング
@student.route("/<url>")
def link(url):
    return render_template(f'{ url }')