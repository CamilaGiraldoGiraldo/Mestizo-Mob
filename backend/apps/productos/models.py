from django.db import models
from apps.categorias.models import Categoria

class Producto(models.Model):
    codigo = models.CharField(
        max_length=20,
        unique=True,
        editable=False
    )
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=3)
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.CASCADE,
        related_name='productos'
    )
    stock = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.codigo:
            ultimo = Producto.objects.order_by('-id').first()
            if ultimo:
                numero = int(ultimo.codigo.split('-')[1]) + 1
            else:
                numero = 1
            self.codigo = f"PRD-{numero:06d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"
