import glob
import os
from datetime import datetime
from typing import Any, TypedDict

import markdown
import yaml

BLOG_DIR = os.path.join(os.path.dirname(__file__), "blogs")


class Post(TypedDict):
    slug: str
    title: str
    date: datetime | None
    description: str
    html: str
    source_path: str


class Cache(TypedDict):
    posts: list[Post] | None
    mtime: float | None


_cache: Cache = {
    "posts": None,
    "mtime": None,
}

_cache = {
    "posts": None,
    "mtime": None,
}


def _load_posts():
    posts = []
    for path in glob.glob(os.path.join(BLOG_DIR, "*.md")):
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()

        # Split front matter and body
        if text.startswith("---"):
            _, fm_text, body = text.split("---", 2)
            meta = yaml.safe_load(fm_text) or {}
        else:
            meta = {}
            body = text

        html = markdown.markdown(
            body, extensions=["fenced_code", "codehilite", "tables"]
        )

        filename = os.path.basename(path)
        meta.setdefault("slug", meta.get("slug") or os.path.splitext(filename)[0])
        meta.setdefault(
            "title", meta.get("title") or meta["slug"].replace("-", " ").title()
        )
        if "date" in meta and isinstance(meta["date"], str):
            meta["date"] = datetime.fromisoformat(meta["date"])

        posts.append(
            {
                "slug": meta["slug"],
                "title": meta["title"],
                "date": meta.get("date"),
                "description": meta.get("description", ""),
                "html": html,
                "source_path": path,
            }
        )

    # Newest first
    posts.sort(key=lambda p: p["date"] or datetime.min, reverse=True)
    return posts


def get_posts(force_reload=False):
    # Basic cache: reload when any file changes
    latest_mtime = max(
        (os.path.getmtime(p) for p in glob.glob(os.path.join(BLOG_DIR, "*.md"))),
        default=None,
    )
    if (
        force_reload
        or _cache["posts"] is None
        or latest_mtime is None
        or _cache["mtime"] is None
        or latest_mtime > _cache["mtime"]
    ):
        _cache["posts"] = _load_posts()
        _cache["mtime"] = latest_mtime
    return _cache["posts"]


def get_post(slug: str) -> Any:
    for post in get_posts():
        if post["slug"] == slug:
            return post
    return None
