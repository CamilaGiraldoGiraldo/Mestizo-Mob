from django.db import models

class Tapizado(models.Model):
    nombre = models.CharField(max_length=100)
    color = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.nombre} - {self.color}"
