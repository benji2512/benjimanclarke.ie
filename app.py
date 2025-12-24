from flask  import Flask, render_template

app = Flask(__name__)

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
