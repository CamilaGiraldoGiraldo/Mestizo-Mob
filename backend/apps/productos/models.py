from django.db import models
from apps.categorias.models import Categoria

class Producto(models.Model):
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=3)
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.CASCADE,
        related_name='productos'
    )
    stock = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.nombre
