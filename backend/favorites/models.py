from django.db import models

class FavoriteMovie(models.Model):
    
    #id do filme
    tmdb_id = models.IntegerField(unique=True)
    
    title = models.CharField(max_length=255)
    
    #caminho do poster
    poster_path = models.CharField(max_length=255, blank=True, null=True)
    
    #nota do filme
    vote_average = models.FloatField(null=True, blank=True)
    
    def __str__(self):
        return self.title
    
