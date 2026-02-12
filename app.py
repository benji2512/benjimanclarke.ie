from flask import Flask, render_template
from flask_flatpages import FlatPages

DEBUG = True
FLATPAGES_AUTO_RELOAD = DEBUG
FLATPAGES_EXTENSION = '.md'
FLATPAGES_ROOT = 'content'
POST_DIR = 'posts'

app = Flask(__name__)
app.config.from_object(__name__)
flatpages = FlatPages(app)

@app.route("/helloworld")
def helloWorld():
    return "<h1>Hello Ben</h1>"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/aboutben")
def aboutben():
    return render_template("aboutme.html")

@app.route("/career")
def career():
    return render_template("career.html")

@app.route("/contact")
def contact():
    return render_template("findme.html")

@app.route("/blog")
def blog():
    return render_template("blog.html")

@app.route("/projects")
def projects():
    return render_template("projects.html")

@app.route("/blog/")
def blog_index():
    posts = [p for p in flatpages if p.path.startswith(POST_DIR)]
    posts.sort(key=lambda p: p['date'], reverse=True)
    return render_template("blog_index.html", posts=posts)

@app.route("/blog/<slug>/")
def blog_detail(slug):
    path = f"{POST_DIR}/{slug}"
    post = flatpages.get_or_404(path)
    return render_template("blog_detail.html", post=post)
