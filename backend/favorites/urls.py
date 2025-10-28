from django.urls import path
from . import views

urlpatterns = [
    path('search/', views.search_movies, name='search_movies'),
    path('favorites/', views.list_or_add_favorites, name='list_or_add_favorites'),
    path('favorites/<int:pk>/', views.manage_favorite_detail, name='manage_favorite_detail'),
    path('proxy-image/', views.proxy_image, name='proxy_image'),
]
