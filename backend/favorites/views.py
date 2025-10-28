from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.conf import settings
import requests
import json
import base64   
from urllib.parse import urlparse
from .models import FavoriteMovie
from django.views.decorators.csrf import csrf_exempt



FALLBACK_DATA_URL = b"iVBORw0KGgoAAAANSUhEUgAAAEYAAABqCAYAAABj2S3nAAAACXBIWXMAAAsSAAALEgHS3X78AAAAJ0lEQVR4nO3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAAAAAAAAAAAAAAwK8E8wABm0b9yQAAAABJRU5ErkJggg=="
FALLBACK_BYTES = base64.b64decode(FALLBACK_DATA_URL)

ALLOWED_IMG_HOSTS = {
    "image.tmdb.org",
    "media.themoviedb.org",
    "upload.wikimedia.org",
}

def search_movies(request):
    query = request.GET.get('query', None)
    if not query:
        return JsonResponse({'error': 'Parâmetro "query" é obrigatório.'}, status=400)
    api_key = settings.TMDB_API_KEY
    if not api_key:
        return JsonResponse({'error': 'Chave da API TMDB não configurada.'}, status=500)
    base_url = 'https://api.themoviedb.org/3/search/movie'
    params = {'api_key': api_key, 'query': query, 'language': 'pt-BR'}
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        data = response.json()
        for movie in data.get("results", []):
            if movie.get("poster_path"):
                movie["poster_path"] = f"https://image.tmdb.org/t/p/w300{movie['poster_path']}"
        return JsonResponse(data)
    except requests.RequestException as e:
        return JsonResponse({'error': 'Erro ao conectar com a API do TMDB.', 'details': str(e)}, status=502)

@csrf_exempt
def list_or_add_favorites(request):
    if request.method == 'GET':
        movies = FavoriteMovie.objects.all()
        data = list(movies.values('id', 'tmdb_id', 'title', 'poster_path', 'vote_average'))
        return JsonResponse(data, safe=False)
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            if FavoriteMovie.objects.filter(tmdb_id=data['tmdb_id']).exists():
                return JsonResponse({'error': 'Filme já está nos favoritos.'}, status=409)
            movie = FavoriteMovie.objects.create(
                tmdb_id=data['tmdb_id'],
                title=data['title'],
                poster_path=data.get('poster_path', None),
                vote_average=data.get('vote_average', None)
            )
            return JsonResponse({'id': movie.id, 'tmdb_id': movie.tmdb_id, 'title': movie.title}, status=201)
        except KeyError:
            return JsonResponse({'error': 'Dados incompletos no body.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': 'Erro ao adicionar filme.', 'details': str(e)}, status=500)
@csrf_exempt
def manage_favorite_detail(request, pk):
    try:
        movie = FavoriteMovie.objects.get(pk=pk)
    except FavoriteMovie.DoesNotExist:
        return JsonResponse({'error': 'Filme favorito não encontrado.'}, status=404)
    if request.method == 'GET':
        data = {'id': movie.id, 'tmdb_id': movie.tmdb_id, 'title': movie.title, 'poster_path': movie.poster_path, 'vote_average': movie.vote_average}
        return JsonResponse(data)
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            movie.title = data.get('title', movie.title)
            movie.poster_path = data.get('poster_path', movie.poster_path)
            movie.save()
            return JsonResponse({'id': movie.id, 'title': movie.title}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    elif request.method == 'DELETE':
        movie.delete()
        return JsonResponse({'message': 'Filme removido dos favoritos.'}, status=200)
    else:
        return JsonResponse({'error': 'Método não permitido.'}, status=405)

@csrf_exempt
def proxy_image(request):
    url = request.GET.get("url")
    if not url:
        return JsonResponse({"error": "url ausente"}, status=400)
    try:
        p = urlparse(url)
        if p.scheme not in ("http", "https"):
            return JsonResponse({"error": "url inválida"}, status=400)
        if p.netloc not in ALLOWED_IMG_HOSTS:
            return HttpResponse(FALLBACK_BYTES, content_type="image/png", status=200)

        headers = {
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://www.themoviedb.org/",
            "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        }
        r = requests.get(url, headers=headers, timeout=20, stream=True)
        if r.ok and r.content:
            ct = r.headers.get("Content-Type", "image/jpeg")
            return HttpResponse(r.content, status=200, content_type=ct)
        return HttpResponse(FALLBACK_BYTES, content_type="image/png", status=200)
    except Exception:
        return HttpResponse(FALLBACK_BYTES, content_type="image/png", status=200)