from flask import Blueprint, request, render_template

teacher = Blueprint("teacher", __name__, template_folder="teacher_templates", static_folder="satic")

@teacher.route('/')
def index():
    return render_template('login.html')

# 任意のURLのルーティング
@teacher.route("/<url>")
def link(url):
    return render_template(f'{ url }')