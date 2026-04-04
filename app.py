from flask import Flask, abort, render_template, request, url_for

from blogs import get_post, get_posts

app = Flask(__name__)
app.config["SECRET_KEY"] = "your secret key"


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


@app.route("/contact/submit", methods=["POST"])
def contact_submit():
    name = request.form.get("name")
    email = request.form.get("email")
    message = request.form.get("message")
    # In production, send email here via SMTP, SendGrid, etc.
    return f"""
    <div class="alert alert-success" role="alert">
        <h4 class="alert-heading">Message Sent!</h4>
        <p>Thanks {name}! I'll get back to you at {email} soon.</p>
    </div>
    """


@app.route("/blog")
def blog():
    posts = get_posts()
    return render_template("blog.html", posts=posts)


@app.route("/blogs/<slug>/")
def blog_detail(slug: str):
    post = get_post(slug)
    if not post:
        abort(404)
    return render_template("post.html", post=post)


@app.route("/projects")
def projects():
    return render_template("projects.html")


@app.route("/sitemap.xml")
def sitemap():
    posts = get_posts()
    from flask import make_response, render_template
    return make_response(render_template("sitemap.xml", posts=posts))
