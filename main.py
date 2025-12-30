from fastapi import FastAPI, Body, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi import FastAPI, Request, Form, Cookie
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
import os
from dotenv import load_dotenv
from fastapi import UploadFile, File, Form
import json
import uuid
from pathlib import Path


BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Mila/src
IMAGES_DIR = Path("assets/images")
DATA_FILE = Path("data/images.json")

IMAGES_DIR.mkdir(parents=True, exist_ok=True)
DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

load_dotenv()

ADMIN_LOGIN = os.getenv("ADMIN_LOGIN")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")


app = FastAPI()

templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "./templates"))


# Static asset mounts
app.mount(
    "/css",
    StaticFiles(directory=os.path.join(BASE_DIR, "./assets/css")),
    name="css"
)

app.mount(
    "/images",
    StaticFiles(directory=os.path.join(BASE_DIR, "./assets/images")),
    name="images"
)

app.mount(
    "/js",
    StaticFiles(directory=os.path.join(BASE_DIR, "./assets/js")),
    name="js"
)

app.mount(
    "/data",
    StaticFiles(directory=os.path.join(BASE_DIR, "./data")),
    name="data"
)


@app.get("/", response_class=HTMLResponse)
async def start_page_get(request: Request):
   return templates.TemplateResponse('index.html', {'request': request})


# ---------- LOGIN PAGE ----------
@app.get("/login", response_class=HTMLResponse)
async def login_get(request: Request):
    return templates.TemplateResponse(
        "login.html",
        {"request": request, "error": None}
    )


# ---------- LOGIN HANDLER ----------
@app.post("/login")
async def login_post(
    request: Request,
    username: str = Form(...),
    password: str = Form(...)
):
    if username == ADMIN_LOGIN and password == ADMIN_PASSWORD:
        response = RedirectResponse("/ozpanel", status_code=302)
        response.set_cookie(
            key="auth",
            value="true",
            httponly=True
        )
        return response

    return templates.TemplateResponse(
        "login.html",
        {"request": request, "error": "Неверный логин или пароль"}
    )


# ---------- LOGOUT ----------
@app.get("/logout")
async def logout():
    response = RedirectResponse("/login", status_code=302)
    response.delete_cookie("auth")
    return response


# ---------- OZPANEL ----------
@app.get("/ozpanel", response_class=HTMLResponse)
async def admin_panel_get(request: Request):
    auth = request.cookies.get("auth")

    if auth != "true":
        return RedirectResponse("/login", status_code=302)

    return templates.TemplateResponse(
        "dashboard.html",
        {"request": request}
    )


@app.post("/admin/upload-image")
async def upload_image(
    request: Request,
    title: str = Form(...),
    image: UploadFile = File(...),
):
    auth = request.cookies.get("auth")
    if auth != "true":
        raise HTTPException(status_code=401)

    # ---------- validate ----------
    if not image.content_type.startswith("image/"):
        return JSONResponse(
            {"error": "Invalid file type"},
            status_code=400
        )

    # ---------- save file ----------
    ext = image.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    image_path = IMAGES_DIR / filename

    with open(image_path, "wb") as f:
        f.write(await image.read())

    # ---------- load json ----------
    if DATA_FILE.exists():
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            images = json.load(f)
    else:
        images = []

    # ---------- append ----------
    images.append({
        "src": f"images/{filename}",
        "title": title
    })

    # ---------- save json ----------
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(images, f, indent=4, ensure_ascii=False)

    return {"success": True}

@app.post("/admin/delete-image")
async def delete_image(request: Request,payload: dict = Body(...)):
    auth = request.cookies.get("auth")
    if auth != "true":
        raise HTTPException(status_code=401)

    src = payload.get("src")

    if not src:
        return JSONResponse({"error": "No src"}, status_code=400)

    image_path = Path("assets") / src
    data_file = Path("data/images.json")

    # ---------- load json ----------
    with open(data_file, "r", encoding="utf-8") as f:
        images = json.load(f)

    # ---------- filter ----------
    images_new = [img for img in images if img["src"] != src]

    if len(images) == len(images_new):
        return JSONResponse({"error": "Not found"}, status_code=404)

    # ---------- delete file ----------
    if image_path.exists():
        image_path.unlink()

    # ---------- save json ----------
    with open(data_file, "w", encoding="utf-8") as f:
        json.dump(images_new, f, indent=4, ensure_ascii=False)

    return {"success": True}

if __name__ == "__main__":
#    uvicorn.run("main:app", host='0.0.0.0', port=443, reload=True, ssl_keyfile='/etc/letsencrypt/live/akademplast.ru/privkey.pem', ssl_certfile='/etc/letsencrypt/live/akademplast.ru/fullchain.pem')#37.140.192.188
    uvicorn.run("main:app", host = '0.0.0.0', port = 8003)#37.140.192.188
    