from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
import requests
import json 
from .models import FavoriteMovie
from django.views.decorators.csrf import csrf_exempt

def search_movies(request):
    
    # Obtém o parâmetro de consulta da URL
    query =  request.GET.get('query', None)
    if not query:
        return JsonResponse({'error': 'Parâmetro "query" é obrigatório.'}, status=400)
    
    api_key = settings.TMDB_API_KEY
    if not api_key:
        return JsonResponse({'error': 'Chave da API TMDB não configurada.'}, status=500)
    
    # Montar a URL e chamar a API do TMDB
    base_url = 'https://api.themoviedb.org/3/search/movie'
    params = {
        'api_key': api_key,
        'query': query,
        'language': 'pt-BR',
    }
    
    try:
        response  = requests.get(base_url, params=params)
        response.raise_for_status() 
        
        return JsonResponse(response.json())
    
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
            
            return JsonResponse({
                'id': movie.id,
                'tmdb_id': movie.tmdb_id,
                'title': movie.title
            }, status=201)
            
        except KeyError:
            return JsonResponse({'error': 'Dados incompletos no body.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        
@csrf_exempt
def manage_favorite_detail(request, pk):
    try:
        movie  = FavoriteMovie.objects.get(pk=pk)
    except FavoriteMovie.DoesNotExist:
        return JsonResponse({'error': 'Filme favorito não encontrado.'}, status=404)
    if request.method == 'GET':
        data = {
            'id': movie.id,
            'tmdb_id': movie.tmdb_id,
            'title': movie.title,
            'poster_path': movie.poster_path,
            'vote_average': movie.vote_average
        }
        return JsonResponse(data)
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            movie.title = data.get('title', movie.title)
            movie.poster_path = data.get('poster_path', movie.poster_path)
            
            movie.save()
            
            return JsonResponse({
                'id': movie.id,
                'title': movie.title
            }, status=200)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
        
    elif request.method == 'DELETE':
        movie.delete()
        return JsonResponse({'message': 'Filme removido dos favoritos.'}, status=204)
    
    else:
        return JsonResponse({'error': 'Método não permitido.'}, status=405)